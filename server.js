const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static('public'));
app.use('/Players', express.static(path.join(__dirname, 'Players')));

// Game config
const GAME_CONFIG = {
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 600,
  GRAVITY: 0.6,
  FRICTION: 0.9,
  ACCELERATION: 0.5,
  PLAYER_SPEED: 5,
  PLAYER_JUMP_STRENGTH: 12,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  MAX_PLAYERS_PER_ROOM: 6,
  TICK_RATE: 60,
  TICK_INTERVAL: 1000 / 60
};

// Game state
class Game {
  constructor(roomId, maxPlayers = 4) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.gameObjects = [];
    this.buttons = [];
    this.gates = [];
    this.moveableBlocks = [];
    this.levelId = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.finishLine = null;
    this.tickCount = 0;
  }

  addPlayer(playerId, playerIndex, character = null) {
    const playerColors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];
    // Spread players across the bottom of the screen
    const spacing = GAME_CONFIG.CANVAS_WIDTH / 7; // Space for 6 players with margins
    const startX = spacing + (playerIndex * spacing);
    
    const player = {
      id: playerId,
      playerIndex: playerIndex,
      x: Math.max(10, Math.min(startX, GAME_CONFIG.CANVAS_WIDTH - 50)),
      y: GAME_CONFIG.CANVAS_HEIGHT - 150, // Start in air so gravity pulls them down
      vx: 0,
      vy: 0,
      width: GAME_CONFIG.PLAYER_WIDTH,
      height: GAME_CONFIG.PLAYER_HEIGHT,
      isJumping: false,
      isGrounded: false,
      onTopOf: null, // playerId of player this one is standing on
      stackedPlayers: [], // playerIds standing on this player
      color: playerColors[playerIndex],
      character: character || 'bodybuilder.png', // Default character
      inputState: {
        left: false,
        right: false,
        jump: false
      }
    };
    this.players.set(playerId, player);
    return player;
  }

  update() {
    if (!this.isRunning || this.isPaused) return;

    this.tickCount++;

    // Update player movement and gravity
    for (const [, player] of this.players) {
      // Apply gravity
      player.vy += GAME_CONFIG.GRAVITY;

      // Apply horizontal movement
      if (player.inputState.left) {
        player.vx = Math.max(player.vx - GAME_CONFIG.ACCELERATION, -GAME_CONFIG.PLAYER_SPEED);
      } else if (player.inputState.right) {
        player.vx = Math.min(player.vx + GAME_CONFIG.ACCELERATION, GAME_CONFIG.PLAYER_SPEED);
      } else {
        player.vx *= GAME_CONFIG.FRICTION;
      }

      // Apply velocity
      player.x += player.vx;
      player.y += player.vy;

      // Reset grounded state
      player.isGrounded = false;
    }

    // Platform and collision detection
    this.checkCollisions();

    // Check button overlaps
    this.updateButtonStates();

    // Check if all players reached the finish line
    this.checkWinCondition();
  }

  checkCollisions() {
    for (const [playerId, player] of this.players) {
      // Check platform collisions
      for (const platform of this.gameObjects) {
        if (platform.type === 'platform') {
          const collision = this.getAABBCollision(player, platform);
          if (collision) {
            
            if (collision.normal.y < 0) {
              // Collision from top (landing on platform)
              player.y = platform.y - player.height;
              player.vy = 0;
              player.isGrounded = true;
              player.isJumping = false;
              player.onTopOf = null;
            } else if (collision.normal.y > 0) {
              // Collision from bottom (hit head)
              player.y = platform.y + platform.height;
              player.vy = 0;
            }

            if (collision.normal.x < 0) {
              // Collision from right
              player.x = platform.x - player.width;
              player.vx = 0;
            } else if (collision.normal.x > 0) {
              // Collision from left
              player.x = platform.x + platform.width;
              player.vx = 0;
            }
          }
        }
      }

      // Check player stacking (standing on other players)
      for (const [otherPlayerId, otherPlayer] of this.players) {
        if (playerId === otherPlayerId) continue;

        const collision = this.getAABBCollision(player, otherPlayer);
        if (collision && collision.normal.y < 0 && player.vy >= 0) {
          // Landing on another player
          player.y = otherPlayer.y - player.height;
          player.vy = 0;
          player.isGrounded = true;
          player.isJumping = false;
          player.onTopOf = otherPlayerId;
          if (!otherPlayer.stackedPlayers.includes(playerId)) {
            otherPlayer.stackedPlayers.push(playerId);
          }
        } else if (collision) {
          // Horizontal collision with another player
          if (collision.normal.x < 0) {
            player.x = otherPlayer.x - player.width;
          } else if (collision.normal.x > 0) {
            player.x = otherPlayer.x + otherPlayer.width;
          }
        }
      }

      // Keep players in bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > GAME_CONFIG.CANVAS_WIDTH) {
        player.x = GAME_CONFIG.CANVAS_WIDTH - player.width;
      }

      // Death zone (fall off bottom)
      if (player.y > GAME_CONFIG.CANVAS_HEIGHT) {
        player.x = 50;
        player.y = 100;
        player.vx = 0;
        player.vy = 0;
        player.isGrounded = false;
        player.onTopOf = null;
        player.stackedPlayers = [];
      }
    }

    // Check moveable block collisions
    for (const block of this.moveableBlocks) {
      if (block.active) {
        for (const [, player] of this.players) {
          const collision = this.getAABBCollision(player, block);
          if (collision) {
            if (collision.normal.y < 0 && player.vy >= 0) {
              // Landing on block
              player.y = block.y - player.height;
              player.vy = 0;
              player.isGrounded = true;
              player.isJumping = false;
              player.onTopOf = block.id;
            } else if (collision.normal.y > 0) {
              player.y = block.y + block.height;
              player.vy = 0;
            } else if (collision.normal.x < 0) {
              player.x = block.x - player.width;
              player.vx = 0;
            } else if (collision.normal.x > 0) {
              player.x = block.x + block.width;
              player.vx = 0;
            }
          }
        }

        // Platform collision for blocks
        for (const platform of this.gameObjects) {
          if (platform.type === 'platform') {
            const collision = this.getAABBCollision(block, platform);
            if (collision) {
              if (collision.normal.y < 0) {
                block.y = platform.y - block.height;
                block.vy = 0;
              } else if (collision.normal.y > 0) {
                block.y = platform.y + platform.height;
                block.vy = 0;
              }
              if (collision.normal.x < 0) {
                block.x = platform.x - block.width;
                block.vx = 0;
              } else if (collision.normal.x > 0) {
                block.x = platform.x + block.width;
                block.vx = 0;
              }
            }
          }
        }

        // Gravity on blocks
        block.vy += GAME_CONFIG.GRAVITY;
        block.y += block.vy;
        block.x += block.vx;
        block.vx *= GAME_CONFIG.FRICTION;
      }
    }
  }

  getAABBCollision(rect1, rect2) {
    const dx = (rect1.x + rect1.width / 2) - (rect2.x + rect2.width / 2);
    const dy = (rect1.y + rect1.height / 2) - (rect2.y + rect2.height / 2);
    const minDist = { x: rect1.width / 2 + rect2.width / 2, y: rect1.height / 2 + rect2.height / 2 };

    if (Math.abs(dx) >= minDist.x || Math.abs(dy) >= minDist.y) return null;

    const overlapX = minDist.x - Math.abs(dx);
    const overlapY = minDist.y - Math.abs(dy);

    let normal = { x: 0, y: 0 };

    if (overlapX >= overlapY) {
      normal.y = dy > 0 ? 1 : -1;
    } else {
      normal.x = dx > 0 ? 1 : -1;
    }

    return { normal, overlap: { x: overlapX, y: overlapY } };
  }

  updateButtonStates() {
    for (const button of this.buttons) {
      button.active = false;
      // Continuous overlap checking
      for (const [, player] of this.players) {
        if (this.isOverlapping(player, button)) {
          button.active = true;
          break;
        }
      }

      // Update connected gates
      for (const gate of this.gates) {
        if (gate.buttonId === button.id) {
          gate.isOpen = button.active;
        }
      }
    }
  }

  isOverlapping(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x ||
             rect1.x > rect2.x + rect2.width ||
             rect1.y + rect1.height < rect2.y ||
             rect1.y > rect2.y + rect2.height);
  }

  checkWinCondition() {
    if (!this.finishLine || this.players.size === 0) return;

    let allPlayersFinished = true;
    for (const [, player] of this.players) {
      if (!this.isOverlapping(player, this.finishLine)) {
        allPlayersFinished = false;
        break;
      }
    }

    if (allPlayersFinished && this.players.size > 0) {
      this.levelId++;
      this.resetLevel();
    }
  }

  resetLevel() {
    // Reset all players to starting position
    let index = 0;
    for (const [, player] of this.players) {
      player.x = 50 + index * 60;
      player.y = 100;
      player.vx = 0;
      player.vy = 0;
      player.isJumping = false;
      player.isGrounded = false;
      player.onTopOf = null;
      player.stackedPlayers = [];
      index++;
    }
  }

  getStateUpdate() {
    const playerData = Array.from(this.players.values()).map(p => ({
      id: p.id,
      playerIndex: p.playerIndex,
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      width: p.width,
      height: p.height,
      isGrounded: p.isGrounded,
      color: p.color,
      character: p.character,
      stackedPlayers: p.stackedPlayers
    }));

    return {
      players: playerData,
      gameObjects: this.gameObjects,
      buttons: this.buttons.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, active: b.active })),
      gates: this.gates.map(g => ({ id: g.id, x: g.x, y: g.y, width: g.width, height: g.height, isOpen: g.isOpen })),
      moveableBlocks: this.moveableBlocks.map(b => ({ id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, weight: b.weight })),
      finishLine: this.finishLine,
      levelId: this.levelId,
      isPaused: this.isPaused
    };
  }
}

// Store active games by room
const activeGames = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('joinGame', (data) => {
    const { roomId, maxPlayers, character } = data;
    socket.join(roomId);

    if (!activeGames.has(roomId)) {
      activeGames.set(roomId, new Game(roomId, maxPlayers || 4));
      const game = activeGames.get(roomId);
      // Load first level when room is created
      loadLevel(game, 0);
    }

    const game = activeGames.get(roomId);
    const playerIndex = game.players.size;

    if (playerIndex >= game.maxPlayers) {
      socket.emit('roomFull', { message: 'Room is full' });
      return;
    }

    game.addPlayer(socket.id, playerIndex, character);
    game.isRunning = true;

    socket.emit('joinedGame', {
      playerId: socket.id,
      playerIndex: playerIndex,
      gameState: game.getStateUpdate(),
      config: GAME_CONFIG
    });

    io.to(roomId).emit('playerJoined', {
      totalPlayers: game.players.size,
      maxPlayers: game.maxPlayers
    });

    // Start game loop if not already running
    startGameLoop(roomId);
  });

  socket.on('inputUpdate', (data) => {
    const { roomId, input } = data;
    const game = activeGames.get(roomId);
    if (!game) return;

    const player = game.players.get(socket.id);
    if (player) {
      player.inputState = input;

      // Handle jump
      if (input.jump && player.isGrounded && !player.isJumping) {
        player.vy = -GAME_CONFIG.PLAYER_JUMP_STRENGTH;
        player.isJumping = true;
        player.isGrounded = false;
      }
    }
  });

  socket.on('loadLevel', (data) => {
    const { roomId, levelId } = data;
    const game = activeGames.get(roomId);
    if (!game) return;

    loadLevel(game, levelId);
    game.levelId = levelId;
    game.resetLevel();

    io.to(roomId).emit('levelLoaded', {
      levelId: levelId,
      gameState: game.getStateUpdate()
    });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    // Find and remove player from game
    for (const [roomId, game] of activeGames) {
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        if (game.players.size === 0) {
          activeGames.delete(roomId);
        } else {
          io.to(roomId).emit('playerLeft', {
            totalPlayers: game.players.size
          });
        }
        break;
      }
    }
  });
});

// Game loop
const gameLoops = new Map();

function startGameLoop(roomId) {
  if (gameLoops.has(roomId)) return;

  const intervalId = setInterval(() => {
    const game = activeGames.get(roomId);
    if (!game) {
      clearInterval(intervalId);
      gameLoops.delete(roomId);
      return;
    }

    game.update();
    io.to(roomId).emit('stateUpdate', game.getStateUpdate());
  }, GAME_CONFIG.TICK_INTERVAL);

  gameLoops.set(roomId, intervalId);
}

// Level loading function
function loadLevel(game, levelId) {
  game.gameObjects = [];
  game.buttons = [];
  game.gates = [];
  game.moveableBlocks = [];

  const levels = require('./levels.js');
  const level = levels[levelId];

  if (!level) return;

  // Load platforms
  for (const platform of level.platforms) {
    game.gameObjects.push({
      type: 'platform',
      x: platform.x,
      y: platform.y,
      width: platform.width,
      height: platform.height
    });
  }

  // Load buttons
  for (const button of (level.buttons || [])) {
    game.buttons.push({
      id: button.id,
      x: button.x,
      y: button.y,
      width: button.width,
      height: button.height,
      active: false
    });
  }

  // Load gates
  for (const gate of (level.gates || [])) {
    game.gates.push({
      id: gate.id,
      x: gate.x,
      y: gate.y,
      width: gate.width,
      height: gate.height,
      isOpen: false,
      buttonId: gate.buttonId
    });
  }

  // Load moveable blocks
  for (const block of (level.moveableBlocks || [])) {
    game.moveableBlocks.push({
      id: block.id,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      weight: block.weight,
      vx: 0,
      vy: 0,
      active: true
    });
  }

  // Set finish line
  if (level.finishLine) {
    game.finishLine = {
      x: level.finishLine.x,
      y: level.finishLine.y,
      width: level.finishLine.width,
      height: level.finishLine.height
    };
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
