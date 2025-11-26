// PICO Park - Client-side Game Logic
class PICOParkGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.socket = io();
    
    this.playerId = null;
    this.playerIndex = null;
    this.roomId = null;
    this.selectedCharacter = null;
    this.maxPlayers = 4;
    this.gameState = null;
    this.config = null;
    
    this.players = new Map();
    this.gameObjects = [];
    this.buttons = [];
    this.gates = [];
    this.moveableBlocks = [];
    this.finishLine = null;
    this.levelId = 0;
    
    this.inputState = {
      left: false,
      right: false,
      jump: false
    };
    
    this.isConnected = false;
    this.isGameStarted = false;
    this.gameRunning = true;
    
    // Characters list
    this.characters = [
      'bodybuilder.png',
      'female-soccer-player.png',
      'fencer.png',
      'football-player.png',
      'formula-1.png',
      'motorcyclist.png',
      'shooter.png',
      'tennis-player.png'
    ];
    
    // Preload character images
    this.characterImages = {};
    this.characters.forEach(char => {
      const img = new Image();
      img.src = `/Players/${char}`;
      this.characterImages[char] = img;
    });
    
    this.setupEventListeners();
    this.setupSocketListeners();
    this.initializeCharacterGrid();
    this.startGameLoop();
  }
  
  setupEventListeners() {
    // Join button
    document.getElementById('joinBtn').addEventListener('click', () => this.joinGame());
    
    // Keyboard input
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  initializeCharacterGrid() {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = ''; // Clear any existing content
    
    this.characters.forEach((char, index) => {
      const option = document.createElement('div');
      option.className = 'character-option';
      option.dataset.character = char;
      
      const img = document.createElement('img');
      img.src = `/Players/${char}`;
      img.alt = char.replace('.png', '');
      
      option.appendChild(img);
      
      option.addEventListener('click', () => this.selectCharacter(char, option));
      grid.appendChild(option);
    });
  }
  
  selectCharacter(characterName, element) {
    // Check if character is already selected by another player
    const characterOptions = document.querySelectorAll('.character-option');
    const isDisabled = element.classList.contains('disabled');
    
    if (isDisabled) {
      return; // Can't select disabled character
    }
    
    // Remove previous selection
    characterOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selection to this character
    element.classList.add('selected');
    this.selectedCharacter = characterName;
    console.log('Selected character:', characterName);
  }
  
  updateCharacterAvailability(selectedCharacters) {
    // Called when game state updates to show which characters are taken
    const characterOptions = document.querySelectorAll('.character-option');
    
    characterOptions.forEach(option => {
      const characterName = option.dataset.character;
      
      if (selectedCharacters.includes(characterName)) {
        option.classList.add('disabled');
        
        // Add "taken" indicator
        if (!option.querySelector('.disabled-text')) {
          const text = document.createElement('div');
          text.className = 'disabled-text';
          text.textContent = 'Taken';
          option.appendChild(text);
        }
      } else {
        option.classList.remove('disabled');
        const text = option.querySelector('.disabled-text');
        if (text) text.remove();
      }
    });
  }
  
  setupEventListeners() {
    // Join button
    document.getElementById('joinBtn').addEventListener('click', () => this.joinGame());
    
    // Keyboard input
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      document.getElementById('disconnectScreen').classList.remove('hidden');
    });
    
    this.socket.on('joinedGame', (data) => {
      console.log('Joined game', data);
      this.playerId = data.playerId;
      this.playerIndex = data.playerIndex;
      this.config = data.config;
      this.gameState = data.gameState;
      this.isGameStarted = true;
      
      this.updateGameState(data.gameState);
      this.switchScreen('gameScreen');
      
      // Load first level
      this.loadLevel(0);
    });
    
    this.socket.on('roomFull', (data) => {
      alert(data.message);
      document.getElementById('joinScreen').classList.add('active');
    });
    
    this.socket.on('playerJoined', (data) => {
      console.log(`Player joined. Total: ${data.totalPlayers}/${data.maxPlayers}`);
      document.getElementById('playerCountLabel').textContent = 
        `Players: ${data.totalPlayers}/${data.maxPlayers}`;
      
      if (data.totalPlayers < data.maxPlayers) {
        document.getElementById('waitingScreen').classList.remove('hidden');
        document.getElementById('waitingText').textContent = 
          `Connected: ${data.totalPlayers}/${data.maxPlayers}`;
      } else {
        document.getElementById('waitingScreen').classList.add('hidden');
      }
    });
    
    this.socket.on('playerLeft', (data) => {
      console.log(`Player left. Total: ${data.totalPlayers}`);
      document.getElementById('playerCountLabel').textContent = 
        `Players: ${data.totalPlayers}/${this.maxPlayers}`;
      document.getElementById('disconnectScreen').classList.remove('hidden');
    });
    
    this.socket.on('stateUpdate', (data) => {
      this.updateGameState(data);
    });
    
    this.socket.on('levelLoaded', (data) => {
      console.log('Level loaded:', data.levelId);
      this.levelId = data.levelId;
      this.updateGameState(data.gameState);
      document.getElementById('levelLabel').textContent = `Level ${data.levelId + 1}`;
      document.getElementById('levelCompleteScreen').classList.add('hidden');
    });
  }
  
  joinGame() {
    this.roomId = document.getElementById('roomInput').value || 'room1';
    this.maxPlayers = parseInt(document.getElementById('maxPlayersInput').value) || 4;
    
    if (!this.roomId) {
      alert('Please enter a room ID');
      return;
    }
    
    if (!this.selectedCharacter) {
      alert('Please select a character');
      return;
    }
    
    this.socket.emit('joinGame', {
      roomId: this.roomId,
      maxPlayers: this.maxPlayers,
      character: this.selectedCharacter
    });
    
    this.switchScreen('gameScreen');
    document.getElementById('waitingScreen').classList.remove('hidden');
    document.getElementById('playerCountLabel').textContent = `Players: 1/${this.maxPlayers}`;
  }
  
  loadLevel(levelId) {
    this.socket.emit('loadLevel', {
      roomId: this.roomId,
      levelId: levelId
    });
  }
  
  updateGameState(state) {
    // Update players
    console.log('updateGameState: Received state with players:', state.players.length);
    if (state.players.length > 0) {
      console.log('Player data sample:', state.players[0]);
    }
    this.players.clear();
    for (const playerData of state.players) {
      console.log('Adding player:', playerData.id, 'playerIndex:', playerData.playerIndex, 'at', playerData.x, playerData.y, 'character:', playerData.character);
      this.players.set(playerData.id, playerData);
    }
    
    // Update game objects
    this.gameObjects = state.gameObjects || [];
    this.buttons = state.buttons || [];
    this.gates = state.gates || [];
    this.moveableBlocks = state.moveableBlocks || [];
    this.finishLine = state.finishLine || null;
    this.levelId = state.levelId || 0;
    
    console.log('updateGameState: Total players map size:', this.players.size);
    console.log('updateGameState: Platforms:', this.gameObjects.length);
    
    // Update UI
    this.updatePlayerLabel();
  }
  
  updatePlayerLabel() {
    if (this.playerIndex !== null) {
      const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Magenta', 'Cyan'];
      const color = colors[this.playerIndex] || 'Unknown';
      document.getElementById('playerLabel').textContent = `You are Player ${this.playerIndex + 1} (${color})`;
    }
  }
  
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Player 1 controls (WASD)
    if (this.playerIndex === 0) {
      if (key === 'a') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === 'd') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === 'w' || key === ' ') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    // Player 2 controls (Arrow Keys)
    else if (this.playerIndex === 1) {
      if (key === 'arrowleft') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === 'arrowright') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === 'arrowup') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    // Player 3 controls (TFGH)
    else if (this.playerIndex === 2) {
      if (key === 't') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === 'h') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === 'g') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    // Player 4 controls (IJKL)
    else if (this.playerIndex === 3) {
      if (key === 'i') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === 'l') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === 'k') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    // Player 5 controls (ZXCV)
    else if (this.playerIndex === 4) {
      if (key === 'z') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === 'v') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === 'x') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    // Player 6 controls (NUMPAD 4,6,5)
    else if (this.playerIndex === 5) {
      if (key === '4') {
        this.inputState.left = true;
        e.preventDefault();
      } else if (key === '6') {
        this.inputState.right = true;
        e.preventDefault();
      } else if (key === '5') {
        this.inputState.jump = true;
        e.preventDefault();
      } else if (key === 'r') {
        this.loadLevel(this.levelId);
        e.preventDefault();
      }
    }
    
    this.sendInputUpdate();
  }
  
  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    
    // Player 1 controls (WASD)
    if (this.playerIndex === 0) {
      if (key === 'a') {
        this.inputState.left = false;
      } else if (key === 'd') {
        this.inputState.right = false;
      } else if (key === 'w' || key === ' ') {
        this.inputState.jump = false;
      }
    }
    // Player 2 controls (Arrow Keys)
    else if (this.playerIndex === 1) {
      if (key === 'arrowleft') {
        this.inputState.left = false;
      } else if (key === 'arrowright') {
        this.inputState.right = false;
      } else if (key === 'arrowup') {
        this.inputState.jump = false;
      }
    }
    // Player 3 controls (TFGH)
    else if (this.playerIndex === 2) {
      if (key === 't') {
        this.inputState.left = false;
      } else if (key === 'h') {
        this.inputState.right = false;
      } else if (key === 'g') {
        this.inputState.jump = false;
      }
    }
    // Player 4 controls (IJKL)
    else if (this.playerIndex === 3) {
      if (key === 'i') {
        this.inputState.left = false;
      } else if (key === 'l') {
        this.inputState.right = false;
      } else if (key === 'k') {
        this.inputState.jump = false;
      }
    }
    // Player 5 controls (ZXCV)
    else if (this.playerIndex === 4) {
      if (key === 'z') {
        this.inputState.left = false;
      } else if (key === 'v') {
        this.inputState.right = false;
      } else if (key === 'x') {
        this.inputState.jump = false;
      }
    }
    // Player 6 controls (NUMPAD 4,6,5)
    else if (this.playerIndex === 5) {
      if (key === '4') {
        this.inputState.left = false;
      } else if (key === '6') {
        this.inputState.right = false;
      } else if (key === '5') {
        this.inputState.jump = false;
      }
    }
    
    this.sendInputUpdate();
  }
  
  sendInputUpdate() {
    if (this.isGameStarted && this.isConnected) {
      this.socket.emit('inputUpdate', {
        roomId: this.roomId,
        input: { ...this.inputState }
      });
    }
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw gradient sky
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw game objects (platforms)
    this.ctx.fillStyle = '#8B4513';
    for (const obj of this.gameObjects) {
      if (obj.type === 'platform') {
        this.drawRectWithShadow(obj.x, obj.y, obj.width, obj.height, '#8B4513');
        
        // Add texture
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < obj.width; i += 20) {
          this.ctx.fillRect(obj.x + i, obj.y + obj.height - 5, 10, 5);
        }
      }
    }
    
    // Draw finish line
    if (this.finishLine) {
      this.drawFinishLine(this.finishLine.x, this.finishLine.y, this.finishLine.width, this.finishLine.height);
    }
    
    // Draw gates
    for (const gate of this.gates) {
      if (gate.isOpen) {
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      } else {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
      }
      this.drawRect(gate.x, gate.y, gate.width, gate.height);
      this.ctx.strokeStyle = gate.isOpen ? '#00FF00' : '#FF0000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
    }
    
    // Draw buttons
    for (const button of this.buttons) {
      this.drawButton(button.x, button.y, button.width, button.height, button.active);
    }
    
    // Draw moveable blocks
    for (const block of this.moveableBlocks) {
      this.drawMoveableBlock(block.x, block.y, block.width, block.height, block.weight);
    }
    
    // Draw players
    console.log('Render: Players count =', this.players.size, 'Game started =', this.isGameStarted, 'Connected =', this.isConnected);
    for (const [id, player] of this.players) {
      console.log('Drawing player', id, 'at', player.x, player.y, 'character:', player.character, 'width:', player.width, 'height:', player.height);
      if (!player.width || !player.height) {
        console.warn('Player missing width/height:', player);
      }
      this.drawPlayer(player);
    }
  }
  
  drawRectWithShadow(x, y, width, height, color) {
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(x, y + height + 2, width, 4);
    
    // Main rectangle
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
    
    // Border
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
  }
  
  drawRect(x, y, width, height) {
    this.ctx.fillRect(x, y, width, height);
  }
  
  drawButton(x, y, width, height, active) {
    const squashAmount = active ? 0.6 : 1;
    const squashedHeight = height * squashAmount;
    const yOffset = height - squashedHeight;
    
    this.ctx.fillStyle = active ? '#FFD700' : '#FFA500';
    this.ctx.fillRect(x, y + yOffset, width, squashedHeight);
    
    this.ctx.strokeStyle = '#FF8C00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y + yOffset, width, squashedHeight);
    
    // Draw button indicator
    this.ctx.fillStyle = active ? '#FFE700' : '#FFB700';
    this.ctx.fillRect(x + 5, y + yOffset + 5, width - 10, squashedHeight - 10);
  }
  
  drawMoveableBlock(x, y, width, height, weight) {
    this.ctx.fillStyle = '#4169E1';
    this.drawRectWithShadow(x, y, width, height, '#4169E1');
    
    // Draw weight indicator
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(weight, x + width / 2, y + height / 2);
  }
  
  drawPlayer(player) {
    // Draw character image
    if (player.character && this.characterImages[player.character]) {
      const img = this.characterImages[player.character];
      if (img.complete) { // Check if image is loaded
        this.ctx.drawImage(img, player.x, player.y, player.width, player.height);
      } else {
        // Fallback if image not loaded yet
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
      }
    } else {
      // Fallback colored square
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Border
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // Draw player index
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(player.playerIndex + 1, player.x + player.width / 2, player.y + player.height);
    
    // Highlight current player
    if (player.id === this.playerId) {
      this.ctx.strokeStyle = '#FFFF00';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
    }
  }
  
  drawFinishLine(x, y, width, height) {
    // Draw checkered pattern
    const checkerSize = 20;
    for (let i = 0; i < width; i += checkerSize) {
      for (let j = 0; j < height; j += checkerSize) {
        if (((i / checkerSize) + (j / checkerSize)) % 2 === 0) {
          this.ctx.fillStyle = '#FFD700';
        } else {
          this.ctx.fillStyle = '#FFA500';
        }
        this.ctx.fillRect(x + i, y + j, checkerSize, checkerSize);
      }
    }
    
    // Border
    this.ctx.strokeStyle = '#FF6B00';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, width, height);
    
    // Draw text
    this.ctx.fillStyle = '#FF0000';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('FINISH', x + width / 2, y + height / 2);
  }
  
  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Show game header only when gameScreen is active
    const gameHeader = document.querySelector('.game-header');
    if (screenId === 'gameScreen') {
      gameHeader.classList.add('show');
    } else {
      gameHeader.classList.remove('show');
    }
  }
  
  startGameLoop() {
    const gameLoop = () => {
      this.render();
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new PICOParkGame();
});
