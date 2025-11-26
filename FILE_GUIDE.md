# PICO Park - Project Index & File Guide

## 📂 Project Structure

```
PICO Park/
├── 📄 Core Game Files
│   ├── server.js              # Backend game server (450+ lines)
│   ├── levels.js              # 5 level definitions (200+ lines)
│   └── package.json           # NPM configuration
│
├── 📁 public/                 # Frontend assets
│   ├── index.html             # Game UI and lobby
│   ├── game.js                # Client-side game logic (450+ lines)
│   └── style.css              # Game styling (350+ lines)
│
├── 🐳 Docker Files
│   ├── Dockerfile             # Production container config
│   ├── docker-compose.yml     # Local testing setup
│   └── .dockerignore          # Docker build exclusions
│
├── 📚 Documentation (Read First!)
│   ├── PROJECT_SUMMARY.md     # ⭐ START HERE - Complete overview
│   ├── QUICKSTART.md          # 5-minute setup guide
│   ├── README.md              # Full feature documentation
│   ├── ARCHITECTURE.md        # System design & internals
│   ├── DEPLOYMENT.md          # Oracle Cloud deployment
│   └── DEPENDENCIES.md        # NPM packages info
│
├── 🔧 Configuration Files
│   ├── .env.example           # Environment variables template
│   └── .gitignore             # Git exclusions
│
└── 📋 This File
    └── FILE_GUIDE.md          # Navigation guide
```

---

## 🎯 Quick Navigation

### First Time? Start Here 👇

1. **PROJECT_SUMMARY.md** ⭐
   - What is this project?
   - What features are included?
   - What files do I need?
   - How do I get started?

2. **QUICKSTART.md**
   - 5-minute setup
   - Local testing
   - Docker testing
   - Basic troubleshooting

### Running the Game?

3. **README.md**
   - Installation steps
   - Controls & gameplay
   - Configuration options
   - Troubleshooting
   - Future enhancements

### Deploying to Oracle Cloud?

4. **DEPLOYMENT.md**
   - Step-by-step Oracle Cloud setup
   - Docker image building
   - Container deployment
   - Monitoring & management
   - Scaling strategies

### Understanding the Code?

5. **ARCHITECTURE.md**
   - System design overview
   - Physics engine explanation
   - Network protocol details
   - Collision detection algorithm
   - Performance considerations

### Development Setup?

6. **DEPENDENCIES.md**
   - NPM packages required
   - Installation troubleshooting
   - Version compatibility
   - Optional enhancements

---

## 📄 File Descriptions

### Backend Files

#### `server.js` (450+ lines)
**Purpose**: Game server with physics and state management

**Key Sections**:
- Game class: Room and player management
- Physics engine: Gravity, collision, velocity
- AABB collision: Detection and response
- Button logic: Continuous overlap checking
- Socket.io handlers: Connection, input, level loading
- Game loop: 60 Hz state updates

**Key Functions**:
- `update()` - Main physics update
- `checkCollisions()` - AABB collision system
- `getAABBCollision()` - Collision detection
- `getStateUpdate()` - State serialization

#### `levels.js` (200+ lines)
**Purpose**: Level definitions for 5 game levels

**Contains**:
- Level 0: The Basics (simple jumps)
- Level 1: The Gate (button coordination)
- Level 2: The Stack (player stacking)
- Level 3: The Heavy Block (cooperative pushing)
- Level 4: The Exam (all mechanics combined)

**Each Level**:
- `platforms`: Array of static platforms
- `buttons`: Pressure sensitive buttons
- `gates`: Doors controlled by buttons
- `moveableBlocks`: Pushable objects with weight
- `finishLine`: Goal area

#### `package.json`
**Purpose**: NPM configuration

**Contains**:
- Project metadata
- Dependencies (express, socket.io)
- Scripts (npm start)

### Frontend Files

#### `public/index.html` (150+ lines)
**Purpose**: Game client HTML

**Contains**:
- Canvas element (1200x600)
- Join screen (room ID, max players)
- Game screen (header, overlay screens)
- Controls information
- Socket.io script inclusion

#### `public/game.js` (450+ lines)
**Purpose**: Client-side game logic

**Key Sections**:
- PICOParkGame class
- Canvas rendering
- Socket.io event handlers
- Input management
- Game state updates

**Key Functions**:
- `render()` - Main rendering loop
- `handleKeyDown/Up()` - Input handling
- `updateGameState()` - State synchronization
- `drawPlayer()` - Player rendering
- `drawButton()` - Button with squash animation

#### `public/style.css` (350+ lines)
**Purpose**: Game styling and UI

**Sections**:
- Canvas styling
- Screen transitions
- Form styling
- Game header
- Controls information
- Responsive design
- Animations

### Deployment Files

#### `Dockerfile`
**Purpose**: Production container configuration

**Features**:
- Multi-stage build (optimized size)
- Alpine Linux base (minimal)
- dumb-init process manager
- Health check included
- Node.js 18

#### `docker-compose.yml`
**Purpose**: Local testing with Docker

**Includes**:
- Service definition
- Port mapping (3000:3000)
- Environment variables
- Health check
- Volume mounting
- Network configuration

#### `.dockerignore`
**Purpose**: Optimize Docker build

**Excludes**:
- node_modules
- .git
- Documentation
- IDE files

### Configuration Files

#### `.env.example`
**Purpose**: Environment variable template

**Variables**:
- PORT: Server port (default 3000)
- NODE_ENV: Environment (development/production)
- GAME_TICK_RATE: Physics update rate
- MAX_PLAYERS_PER_ROOM: Player limit
- SOCKET_IO_CORS_ORIGIN: CORS settings

#### `.gitignore`
**Purpose**: Git exclusions

**Excludes**:
- node_modules
- .env files
- Logs
- IDE files
- Temporary files

---

## 📚 Documentation Files

### PROJECT_SUMMARY.md ⭐ START HERE
**Length**: ~400 lines  
**Time to Read**: 10-15 minutes

**Topics**:
- Completion status (all 20+ deliverables)
- Feature checklist (physics, stacking, etc.)
- Architecture overview
- Project statistics
- Getting started (local, Docker, cloud)
- Troubleshooting
- Next steps

**Best For**: Understanding the project at a glance

### QUICKSTART.md
**Length**: ~250 lines  
**Time to Read**: 5-10 minutes

**Topics**:
- 5-minute local setup
- Docker setup
- Game controls
- Basic configuration
- Common issues
- Tips & tricks

**Best For**: Getting running immediately

### README.md
**Length**: ~500 lines  
**Time to Read**: 20-30 minutes

**Topics**:
- Feature descriptions
- Tech stack details
- Installation instructions
- Controls & gameplay
- Server configuration
- Level design guide
- Physics system
- Network protocol
- Performance optimization
- Troubleshooting guide
- Future enhancements

**Best For**: Comprehensive reference

### ARCHITECTURE.md
**Length**: ~600 lines  
**Time to Read**: 30-40 minutes

**Topics**:
- System overview diagram
- Component descriptions
- Game loop explanation
- Physics engine details
- Network protocol specifics
- Player mechanics
- Game states
- Performance considerations
- Collision detection algorithm
- Deployment architecture
- Security considerations
- Debugging tips
- Scalability strategies

**Best For**: Understanding internals

### DEPLOYMENT.md
**Length**: ~550 lines  
**Time to Read**: 20-30 minutes

**Topics**:
- Prerequisites
- Docker image building
- Oracle Registry setup
- Container deployment
- Network configuration
- Accessing the game
- Monitoring & management
- Scaling strategies
- Cost optimization
- Troubleshooting
- Production checklist
- Advanced deployments
- Database integration

**Best For**: Oracle Cloud deployment

### DEPENDENCIES.md
**Length**: ~400 lines  
**Time to Read**: 10-15 minutes

**Topics**:
- Dependency list
- Package details
- Installation steps
- Platform compatibility
- Troubleshooting installation
- Performance notes
- Security audits
- Optional enhancements
- Containerization details
- License information
- Useful commands

**Best For**: Package management

---

## 🚀 Getting Started Routes

### Route 1: Local Development (5 min)
```
1. Read: QUICKSTART.md (Local Development section)
2. Run: npm install && npm start
3. Open: http://localhost:3000
4. Test: Join same room in 2 browser tabs
```

### Route 2: Docker Testing (10 min)
```
1. Read: QUICKSTART.md (Docker section)
2. Build: docker build -t pico-park .
3. Run: docker-compose up
4. Test: http://localhost:3000
```

### Route 3: Oracle Cloud Deploy (30 min)
```
1. Read: DEPLOYMENT.md (prerequisities section)
2. Build: docker build -t pico-park .
3. Follow: DEPLOYMENT.md step by step
4. Deploy: To Oracle Container Instance
5. Access: http://<public-ip>:3000
```

### Route 4: Understanding Code (60 min)
```
1. Read: ARCHITECTURE.md (overview)
2. Read: README.md (level design section)
3. Review: server.js (comments explain physics)
4. Review: public/game.js (comments explain rendering)
5. Study: levels.js (examine level structure)
```

---

## 🎯 Use Case to File Mapping

| I Want To... | Read This | Then Run This |
|---|---|---|
| Get started quickly | QUICKSTART.md | npm start |
| Understand the game | PROJECT_SUMMARY.md | Try playing! |
| Deploy to cloud | DEPLOYMENT.md | docker-compose up |
| Configure physics | README.md | Edit server.js |
| Add new level | README.md Level Design | Edit levels.js |
| Understand architecture | ARCHITECTURE.md | Review server.js |
| Fix an issue | README.md Troubleshooting | Follow steps |
| Change colors | README.md Customization | Edit game.js/style.css |
| Deploy on Docker | QUICKSTART.md Docker | docker-compose up |
| Install packages | DEPENDENCIES.md | npm install |

---

## 📊 File Statistics

### Code Files
| File | Lines | Language | Purpose |
|------|-------|----------|---------|
| server.js | 450+ | JavaScript | Backend logic |
| game.js | 450+ | JavaScript | Client logic |
| style.css | 350+ | CSS | Styling |
| levels.js | 200+ | JavaScript | Level data |
| index.html | 150+ | HTML | UI layout |
| **Total Code** | **2000+** | - | - |

### Documentation Files
| File | Lines | Read Time |
|------|-------|-----------|
| PROJECT_SUMMARY.md | 400+ | 10-15 min |
| README.md | 500+ | 20-30 min |
| ARCHITECTURE.md | 600+ | 30-40 min |
| DEPLOYMENT.md | 550+ | 20-30 min |
| QUICKSTART.md | 250+ | 5-10 min |
| DEPENDENCIES.md | 400+ | 10-15 min |
| FILE_GUIDE.md | 300+ | 10-15 min |
| **Total Docs** | **3000+** | **2-3 hours** |

### Configuration Files
- package.json
- Dockerfile
- docker-compose.yml
- .env.example
- .gitignore
- .dockerignore

---

## ✅ Completion Checklist

### Code Files
- ✅ server.js - Backend complete
- ✅ levels.js - 5 levels complete
- ✅ game.js - Client complete
- ✅ index.html - UI complete
- ✅ style.css - Styling complete
- ✅ package.json - Dependencies configured

### Deployment Files
- ✅ Dockerfile - Production ready
- ✅ docker-compose.yml - Testing ready
- ✅ .dockerignore - Optimized

### Documentation Files
- ✅ PROJECT_SUMMARY.md - Overview
- ✅ QUICKSTART.md - Quick reference
- ✅ README.md - Full documentation
- ✅ ARCHITECTURE.md - Design details
- ✅ DEPLOYMENT.md - Cloud deployment
- ✅ DEPENDENCIES.md - Package info
- ✅ FILE_GUIDE.md - This file

### Configuration Files
- ✅ .env.example - Environment template
- ✅ .gitignore - Git configuration

---

## 🔗 Cross-References

### If You're Reading... | Also See
|---|---|
| PROJECT_SUMMARY.md | QUICKSTART.md, README.md |
| QUICKSTART.md | README.md for more details |
| README.md | ARCHITECTURE.md for internals |
| ARCHITECTURE.md | server.js code comments |
| DEPLOYMENT.md | docker-compose.yml example |
| DEPENDENCIES.md | package.json actual deps |

---

## 🎓 Learning Path

### Beginner (Want to Play)
1. QUICKSTART.md
2. Start with `npm start`
3. Open http://localhost:3000
4. Invite friends to join

### Intermediate (Want to Customize)
1. README.md (full features)
2. QUICKSTART.md (setup)
3. Edit levels.js or style.css
4. Test locally

### Advanced (Want to Deploy)
1. DEPLOYMENT.md
2. Follow step-by-step
3. Deploy to Oracle Cloud
4. Monitor in cloud console

### Expert (Want to Modify Code)
1. ARCHITECTURE.md (system design)
2. Review server.js (physics engine)
3. Review game.js (client rendering)
4. Make code changes
5. Test thoroughly
6. Redeploy

---

## 📞 Quick References

### Commands
```bash
npm install              # Install dependencies
npm start                # Start local server
docker-compose up        # Local testing
docker build -t pico-park .  # Build Docker image
npm audit                # Check security
```

### URLs
- Local: http://localhost:3000
- Production: http://<server-ip>:3000

### File Locations
- Backend: `server.js` & `levels.js`
- Frontend: `public/` directory
- Config: `package.json` & `.env.example`
- Docs: `*.md` files in root

### Key Variables (server.js)
- GRAVITY = 0.6
- PLAYER_SPEED = 5
- PLAYER_JUMP_STRENGTH = 12
- TICK_RATE = 60

---

## 🆘 Stuck? Here's What To Do

### Problem | Solution | File
|---|---|---|
| Won't start | Check server.js syntax | QUICKSTART.md |
| Docker fails | Check Dockerfile | QUICKSTART.md Docker section |
| Can't deploy | Follow DEPLOYMENT.md | DEPLOYMENT.md step-by-step |
| Physics wrong | Edit GAME_CONFIG | README.md Configuration |
| Don't understand code | Read ARCHITECTURE.md | ARCHITECTURE.md |
| Need more details | Read README.md | README.md |

---

## 📈 Version Info

| Component | Version | Status |
|---|---|---|
| Project | 1.0 | ✅ Complete |
| Documentation | 1.0 | ✅ Complete |
| Deployment | 1.0 | ✅ Ready |
| Dockerfile | 1.0 | ✅ Production |
| Node.js | 18+ | ✅ Tested |
| Socket.io | 4.5.4 | ✅ Stable |

---

## 🎉 Ready to Go!

You have everything you need:
- ✅ Complete game code
- ✅ 5 fully designed levels
- ✅ Production Docker setup
- ✅ Comprehensive documentation
- ✅ Oracle Cloud deployment guide

**Next Step**: Read PROJECT_SUMMARY.md or QUICKSTART.md to get started!

---

**File Guide Version: 1.0**  
**Total Project Files: 16**  
**Total Lines of Code: 2000+**  
**Total Documentation: 3000+ lines**  
**Total Size: ~5MB (code + docs)**  
**Status: ✅ Complete & Production Ready**
