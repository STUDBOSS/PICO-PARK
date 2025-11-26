# PICO Park - Multiplayer Cooperative Platformer

A 4-6 player cooperative puzzle platformer built with Node.js, Socket.io, and HTML5 Canvas. Inspired by the hit game PICO Park.

## Features

### Core Mechanics
- **Player Physics**: Gravity-based movement with AABB collision detection
- **Player Stacking**: Players can jump on other players' heads to reach high platforms
- **Pushing Mechanics**: Moveable blocks with weight properties requiring cooperative effort
- **Button & Gate System**: Continuous overlap checking for reliable button detection
- **Level Progression**: 5 designed levels from basic to advanced

### Multiplayer
- Real-time synchronization via Socket.io
- Server-authoritative game state
- Support for 4-6 players per room
- Seamless player joining/disconnection handling

### Levels
1. **The Basics**: Simple jumps and door mechanics
2. **The Gate**: Button hold mechanics requiring coordination
3. **The Stack**: Player stacking to reach high ledges
4. **The Heavy Block**: Cooperative pushing of heavy objects
5. **The Exam**: Combined mechanics in a complex maze

## Tech Stack

- **Frontend**: HTML5 Canvas, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Communication**: Socket.io
- **Deployment**: Docker (Oracle Cloud compatible)
- **Physics**: Custom AABB collision system

## Project Structure

```
pico-park/
├── server.js              # Backend game logic and physics
├── levels.js              # Level definitions
├── package.json           # Dependencies
├── Dockerfile             # Container configuration
├── .dockerignore           # Docker build exclusions
├── public/
│   ├── index.html         # Game client HTML
│   ├── style.css          # UI styling
│   └── game.js            # Client-side game loop
└── README.md              # This file
```

## Installation

### Local Development

1. **Prerequisites**
   - Node.js 14+ installed
   - npm or yarn

2. **Setup**
   ```bash
   # Clone or download the project
   cd pico-park

   # Install dependencies
   npm install

   # Start the server
   npm start
   ```

3. **Access the Game**
   - Open your browser to `http://localhost:3000`
   - Create or join a room
   - Invite friends to join the same room

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t pico-park:latest .
   ```

2. **Run Container Locally**
   ```bash
   docker run -p 3000:3000 pico-park:latest
   ```

3. **Deploy to Oracle Cloud**
   - Push image to Oracle Container Registry
   - Deploy to Oracle Container Instances or Oracle Kubernetes Engine
   - Configure security groups to allow port 3000

## Game Controls

| Key | Action |
|-----|--------|
| **A** | Move Left |
| **D** | Move Right |
| **W** / **Space** | Jump |
| **R** | Restart Level |

## Server Configuration

### Game Constants
Located in `server.js`:

```javascript
GAME_CONFIG = {
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
```

Modify these values to tweak gameplay feel.

## Level Design

Levels are defined in `levels.js` as JSON objects with:

- **platforms**: Array of static platforms
- **buttons**: Array of pressure buttons
- **gates**: Array of gates controlled by buttons
- **moveableBlocks**: Array of pushable objects with weight
- **finishLine**: Goal area for level completion

### Example Level Structure
```javascript
{
  name: 'Level Name',
  platforms: [
    { x: 0, y: 550, width: 1200, height: 50 }
  ],
  buttons: [
    { id: 'btn1', x: 100, y: 400, width: 50, height: 30 }
  ],
  gates: [
    { id: 'gate1', x: 200, y: 300, width: 30, height: 100, buttonId: 'btn1' }
  ],
  moveableBlocks: [
    { id: 'block1', x: 400, y: 400, width: 60, height: 60, weight: 2 }
  ],
  finishLine: { x: 1100, y: 200, width: 80, height: 150 }
}
```

## Physics System

### AABB Collision Detection
The game uses Axis-Aligned Bounding Box (AABB) collision:
- Detects overlaps between all entities
- Returns collision normal and overlap depth
- Supports player stacking with `onTopOf` tracking
- Continuous button overlap checking (no "OnEnter" events)

### Player Movement
- Horizontal: Acceleration-based with friction
- Vertical: Gravity-based jumping
- Can be stacked on other players
- Can push moveable blocks

### Button Logic
Buttons use continuous overlap checking:
```javascript
// Every game tick
button.active = (playerRect.intersects(buttonRect)) ? true : false;
```

## Network Protocol

### Client → Server
- `joinGame`: Join a room
- `inputUpdate`: Send player input (left, right, jump)
- `loadLevel`: Load a specific level

### Server → Client
- `joinedGame`: Confirm join, send initial state
- `stateUpdate`: Continuous game state updates (60 Hz)
- `playerJoined`: Notify of new player
- `playerLeft`: Notify of disconnection
- `levelLoaded`: Confirm level load

## Performance Optimization

- **Tick Rate**: 60 Hz server updates
- **State Compression**: Only essential player data sent
- **Collision Optimization**: Early-exit AABB checks
- **Canvas Rendering**: Efficient rect drawing and layer ordering

## Troubleshooting

### Players Not Syncing
- Check server logs for tick rate issues
- Verify Socket.io connection (check browser console)
- Ensure all clients have same game config

### Physics Issues
- Adjust `GRAVITY` and `PLAYER_JUMP_STRENGTH`
- Check collision detection in `checkCollisions()`
- Verify platform positions in level definitions

### Button Not Detecting Players
- Confirm continuous overlap checking (not event-based)
- Check button and player rectangles in render debug
- Verify button dimensions in level definition

## Future Enhancements

- [ ] Lobby system with player readiness
- [ ] Score/time tracking
- [ ] Powerups and special items
- [ ] Sound effects and background music
- [ ] Mobile touch controls
- [ ] Replay system
- [ ] Custom level editor
- [ ] Matchmaking for random rooms
- [ ] Player profiles and statistics
- [ ] Different player models/skins

## Development Notes

### Adding New Levels
1. Add new level object to `levels.js` array
2. Ensure all x, y coordinates are within canvas bounds
3. Test locally by emitting `loadLevel` socket event
4. Validate button-gate connections

### Modifying Physics
Physics parameters in `server.js`:
- Gravity affects fall speed
- Friction affects sliding/momentum
- Player speed affects horizontal movement
- Jump strength determines max height

### Debugging
Enable debug logs:
```javascript
// In server.js
console.log('Debug info:', data);

// In game.js browser console
localStorage.debug = '*';
```

## Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Test locally: `npm start`
- [ ] Build Docker image: `docker build -t pico-park .`
- [ ] Test Docker container locally
- [ ] Push to container registry
- [ ] Configure Oracle Cloud networking
- [ ] Deploy container instance
- [ ] Test with multiple players
- [ ] Monitor logs in Oracle Cloud Console

## License

MIT License - Feel free to modify and distribute

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs: `docker logs <container_id>`
3. Check browser console for client errors
4. Verify network connectivity

---

**Built with ❤️ for cooperative gaming**
