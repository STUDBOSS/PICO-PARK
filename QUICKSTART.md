# PICO Park - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Option 1: Local Development

1. **Install Node.js**
   - Download from https://nodejs.org (v14 or higher)

2. **Navigate to project**
   ```bash
   cd "d:\Mohit\VS Code\PICO Park"
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start server**
   ```bash
   npm start
   ```

5. **Open browser**
   - Go to `http://localhost:3000`
   - Enter a room ID (e.g., "room1")
   - Click "Join Game"
   - Open another browser tab/window and join the same room

### Option 2: Docker (Local Testing)

1. **Build image**
   ```bash
   docker build -t pico-park:latest .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 pico-park:latest
   ```

3. **Access game**
   - Open `http://localhost:3000`

### Option 3: Docker Compose (Recommended for Testing)

1. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

2. **Access game**
   - Open `http://localhost:3000`

3. **Stop**
   ```bash
   docker-compose down
   ```

## 🎮 How to Play

### Solo/Local Testing
1. Open browser window 1 → Join "room1"
2. Open browser window 2 → Join "room1"
3. Both players now control characters (use A/D/W to move)

### Multi-Player (Network)
1. Share your server IP/URL with friends
2. They join with the same room ID
3. Game starts when all players are ready

### Controls
- **A** - Move Left
- **D** - Move Right  
- **W** - Jump
- **Space** - Jump (alternative)
- **R** - Restart Level

## 🎯 Game Objectives

Each level has specific mechanics:

1. **Level 1**: Reach the finish line with basic jumping
2. **Level 2**: One player stands on button while other passes through gate
3. **Level 3**: Stack on another player to reach high platforms
4. **Level 4**: Both players push a heavy block together
5. **Level 5**: Combine all mechanics in the final challenge

## 🔧 Configuration

### Adjust Difficulty
Edit `server.js` and change:

```javascript
GRAVITY: 0.6        // Higher = faster falling
PLAYER_SPEED: 5     // Higher = faster movement
PLAYER_JUMP_STRENGTH: 12  // Higher = higher jumps
```

Then restart server and reload browser.

### Change Max Players
In `package.json` or when joining, select max players (4-6).

## 📊 Troubleshooting

### Game won't load
- Check if server is running (`npm start` shows "Server running on port 3000")
- Try `http://localhost:3000` in browser
- Check browser console (F12) for errors

### Players not appearing
- Both players must join the same room ID
- Check network connectivity
- Look at server console for connection logs

### Physics feels off
- Adjust GRAVITY and PLAYER_JUMP_STRENGTH in server.js
- Must restart server for changes to take effect

### Can't push block
- Both players must push block at same time
- Block must be on a platform (not falling)

## 📦 Deployment to Oracle Cloud

1. **Create Oracle Cloud Account**
   - https://www.oracle.com/cloud/free/

2. **Build and Push Docker Image**
   ```bash
   # Build
   docker build -t pico-park:latest .
   
   # Tag for Oracle Registry
   docker tag pico-park:latest <registry>/<repo>/pico-park:latest
   
   # Push
   docker push <registry>/<repo>/pico-park:latest
   ```

3. **Deploy Container**
   - Use Oracle Container Instances or Kubernetes Engine
   - Set PORT=3000
   - Open port 3000 in security groups

4. **Access Game**
   - `http://<server-ip>:3000`

## 📚 File Structure

```
project/
├── server.js           ← Server-side game logic
├── levels.js           ← Level definitions (5 levels)
├── package.json        ← Dependencies
├── Dockerfile          ← Container config
├── docker-compose.yml  ← Local testing
├── README.md           ← Full documentation
├── QUICKSTART.md       ← This file
└── public/
    ├── index.html      ← Main page
    ├── game.js         ← Client-side logic
    └── style.css       ← Styling
```

## 🎨 Customization

### Change Colors
Edit `public/style.css` and `public/game.js`:
- Background gradient
- Player colors
- Platform colors
- Button colors

### Add New Levels
1. Add level object to `levels.js`
2. Define platforms, buttons, gates, etc.
3. Reload game to test

### Change Game Title
Edit `public/index.html`:
```html
<title>Your Game Name</title>
```

## 💡 Tips

- **Test Locally First**: Always test with `npm start` before Docker
- **Multiple Browsers**: Open same URL in multiple browser tabs on same machine for local 2-player testing
- **Network Testing**: Deploy to Oracle Cloud to test network play
- **Monitor Performance**: Check browser console (F12) for lag/errors
- **Debug Mode**: Add console.logs in server.js to see what's happening

## 🆘 Need Help?

1. Check README.md for detailed documentation
2. Review server logs: `docker logs <container-id>`
3. Check browser console: F12 → Console tab
4. Test with `npm start` first (easier debugging)

---

**Happy Gaming! 🎮**
