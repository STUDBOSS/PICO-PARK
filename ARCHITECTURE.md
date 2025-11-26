# PICO Park Architecture Documentation

## System Overview

PICO Park is a server-authoritative multiplayer game using real-time synchronization via Socket.io. The server maintains the canonical game state, while clients render and accept input.

```
┌─────────────────────────────────────────────────────────┐
│                    Oracle Cloud                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Docker Container (Node.js)               │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Express.js + Socket.io Server (3000)      │  │  │
│  │  │  - Game State Management                    │  │  │
│  │  │  - Physics Engine                           │  │  │
│  │  │  - Collision Detection                      │  │  │
│  │  │  - Level Loading                            │  │  │
│  │  │  - Player Synchronization (60 Hz)          │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↕ Socket.io (WebSocket)
        ┌────────────────┬────────────────┬────────────────┐
        ↓                ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
    │Browser │      │Browser │      │Browser │      │Browser │
    │Client 1│      │Client 2│      │Client 3│      │Client 4│
    │        │      │        │      │        │      │        │
    │HTML5   │      │HTML5   │      │HTML5   │      │HTML5   │
    │Canvas  │      │Canvas  │      │Canvas  │      │Canvas  │
    │Game.js │      │Game.js │      │Game.js │      │Game.js │
    └────────┘      └────────┘      └────────┘      └────────┘
```

## Core Components

### 1. Server (server.js)

#### Game Class
Manages individual game room state:
- `players` Map: Tracks active players
- `gameObjects`: Static platforms
- `buttons`: Pressure buttons
- `gates`: Door/gate objects
- `moveableBlocks`: Pushable objects with weight

#### Game Loop (60 Hz)
```
Every 16.67ms:
1. Update player velocities
2. Apply gravity
3. Check collisions (AABB)
4. Update button states (continuous overlap)
5. Check win condition
6. Send state update to all clients
```

#### Physics Engine
**AABB Collision Detection:**
```javascript
getAABBCollision(rect1, rect2) {
  // Calculate center distance
  dx = (rect1.x + rect1.width/2) - (rect2.x + rect2.width/2)
  dy = (rect1.y + rect1.height/2) - (rect2.y + rect2.height/2)
  
  // Calculate minimum distance for collision
  minDistX = rect1.width/2 + rect2.width/2
  minDistY = rect1.height/2 + rect2.height/2
  
  // Return collision info with normal
  if (overlap detected) {
    return { normal: collision_direction, overlap: amount }
  }
}
```

**Collision Resolution:**
- Vertical collisions (normal.y ≠ 0): Landing/floor collision
- Horizontal collisions (normal.x ≠ 0): Wall collision
- Player stacking: `player.onTopOf = otherPlayerId`

#### Button Logic (Continuous Checking)
```javascript
updateButtonStates() {
  for each button:
    button.active = false
    for each player:
      if (playerRect.intersects(buttonRect)):
        button.active = true
        break
    
    // Open/close connected gates
    for each gate:
      if (gate.buttonId == button.id):
        gate.isOpen = button.active
}
```

### 2. Client (game.js)

#### Rendering Loop
```
Every frame (60+ fps):
1. Clear canvas
2. Draw background/sky
3. Draw game objects (platforms)
4. Draw buttons (with squash animation)
5. Draw gates (open/closed visual)
6. Draw moveable blocks
7. Draw players (highlight self)
8. Draw finish line
```

#### Input Handling
- Keyboard listeners (A, D, W, R)
- Send input updates to server every frame
- Local jump buffering for feel

#### State Updates
- Receive server state updates at 60 Hz
- Update player positions/velocities
- Re-render immediately

### 3. Level System (levels.js)

Each level contains:

```javascript
{
  name: string,
  platforms: [{ x, y, width, height }],
  buttons: [{ id, x, y, width, height }],
  gates: [{ id, x, y, width, height, buttonId }],
  moveableBlocks: [{ id, x, y, width, height, weight }],
  finishLine: { x, y, width, height }
}
```

## Network Protocol

### Socket.io Events

**Client → Server:**
```
joinGame({roomId, maxPlayers})
  └─ Join a game room

inputUpdate({roomId, input: {left, right, jump}})
  └─ Send player input (60 Hz)

loadLevel({roomId, levelId})
  └─ Request level load
```

**Server → Client:**
```
joinedGame({playerId, playerIndex, gameState, config})
  └─ Welcome message with initial state

stateUpdate(gameState)
  └─ Full game state (60 Hz)
  gameState: {
    players: [{id, x, y, vx, vy, color, stackedPlayers}],
    gameObjects: [{type, x, y, width, height}],
    buttons: [{id, x, y, active}],
    gates: [{id, x, y, isOpen}],
    moveableBlocks: [{id, x, y, weight}],
    levelId: number
  }

playerJoined({totalPlayers, maxPlayers})
  └─ Notify of new player

playerLeft({totalPlayers})
  └─ Notify of disconnect

levelLoaded({levelId, gameState})
  └─ Confirm level transition
```

## Player Mechanics

### Movement
```
Left/Right Input:
  if (input.left):
    vx = max(vx - ACCELERATION, -PLAYER_SPEED)
  else if (input.right):
    vx = min(vx + ACCELERATION, PLAYER_SPEED)
  else:
    vx *= FRICTION

Vertical Movement:
  vy += GRAVITY
  y += vy
  
Jump:
  if (input.jump && isGrounded && !isJumping):
    vy = -PLAYER_JUMP_STRENGTH
    isJumping = true
    isGrounded = false
```

### Stacking
```
When player lands on another player:
  player.onTopOf = otherPlayerId
  player.vy = 0
  player.isGrounded = true
  
  otherPlayer.stackedPlayers.push(playerId)
  
This allows chain stacking for reaching high platforms
```

### Block Pushing
```
When player collides with block:
  if (block.weight == 1):
    block can be pushed by 1 player
  else if (block.weight == 2):
    block only pushes if 2+ players contact it
```

## Game States

### Per-Player State
```
{
  id: socket.id,
  playerIndex: 0-5,
  x, y: position,
  vx, vy: velocity,
  width: 32, height: 32,
  isJumping: boolean,
  isGrounded: boolean,
  onTopOf: playerId | null,
  stackedPlayers: [playerId],
  inputState: {left, right, jump},
  color: hex
}
```

### Per-Room State
```
{
  roomId: string,
  players: Map<socketId, PlayerState>,
  gameObjects: Platform[],
  buttons: Button[],
  gates: Gate[],
  moveableBlocks: Block[],
  levelId: number,
  isRunning: boolean,
  isPaused: boolean,
  finishLine: {x, y, width, height}
}
```

## Performance Considerations

### Server Optimization
- **Collision Early-Exit**: AABB check rejects instantly if no overlap
- **State Compression**: Only essential data sent (no full object clones)
- **Game Loop**: Fixed 60 Hz tick rate, independent of player count
- **Memory**: Games deleted when all players disconnect

### Client Optimization
- **Canvas Rendering**: Direct pixel operations, minimal DOM interaction
- **Input Buffering**: Store input for next frame send
- **Network**: Only receive state updates, not send own state

### Bandwidth
Per 60 Hz update (~16.67ms):
- 4 players × ~100 bytes = ~1.6 KB/s per player
- 4 players game = ~6.4 KB/s total
- Scales linearly with player count

## Collision Detection Algorithm

### AABB vs AABB
1. Calculate center-to-center distance
2. Calculate overlap on X and Y axes
3. Determine collision normal (primary axis)
4. Return overlap information

### Collision Resolution
1. Check world bounds
2. Check platform collisions (all objects)
3. Check player-player collisions
4. Check player-block collisions
5. Check block-platform collisions
6. Reset grounded state and update for next tick

## Deployment Architecture

### Docker Multi-Stage Build
```
Stage 1 (Builder):
  - Alpine Node 18
  - npm ci (install)
  
Stage 2 (Production):
  - Alpine Node 18
  - Copy deps from Stage 1
  - Add dumb-init
  - Health check
```

### Container Configuration
- **Base**: Alpine Linux (minimal size)
- **Init System**: dumb-init (signal handling)
- **Health Check**: HTTP endpoint check
- **Resources**: No explicit limits (adjust per Oracle Cloud)

### Network
- **Port**: 3000 (configurable via PORT env var)
- **CORS**: Enabled for all origins (restrict in production)
- **WebSocket**: Via Socket.io (automatic upgrade)

## Scalability

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Increase max players per room (up to 6)
- Increase game tick rate (but increases bandwidth)

### Horizontal Scaling
- Multiple server instances with load balancing
- Room distribution across instances
- Requires centralized session store (Redis recommended)

## Security Considerations

### Current Implementation
- Server-authoritative (can't cheat client-side)
- Input validation (jump only when grounded)
- Position validation (keep in bounds)

### Production Recommendations
- Restrict CORS origin to domain
- Implement rate limiting on socket events
- Add player authentication
- Validate all inputs server-side
- Implement anti-cheat detection
- Add bot protection (captcha)
- Use TLS/WSS for encrypted connections

## Debugging

### Server Debug
```javascript
// In server.js
console.log('Player input:', socket.id, input);
console.log('Collision detected:', collision);
```

### Client Debug
```javascript
// In browser console
socket.on('stateUpdate', (state) => {
  console.log('Received state:', state);
});
```

### Network Debug
```
// Chrome DevTools → Network → WS (WebSocket tab)
// View Socket.io frames being sent/received
```

## Future Architecture Improvements

1. **Physics Engine**: Consider Rapier.rs (WASM) for complex physics
2. **Level Editor**: Web-based level creation tool
3. **Matchmaking**: Separate matchmaking service
4. **Leaderboards**: Database integration
5. **Replays**: Record/replay system
6. **Regions**: Multi-region deployment
7. **Latency Compensation**: Client-side prediction
8. **CDN**: Serve static assets via CDN
9. **Analytics**: Track player metrics
10. **Monetization**: In-app purchases, cosmetics

---

**Architecture Version: 1.0**  
**Last Updated: 2025**
