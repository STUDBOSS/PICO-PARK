// Level data for PICO Park
// Each level contains platforms, buttons, gates, moveable blocks, and finish line

module.exports = [
  // Level 0: The Basics
  {
    name: 'The Basics',
    description: 'Simple jumps and a door',
    platforms: [
      // Ground
      { x: 0, y: 550, width: 1200, height: 50 },
      // First jump platform
      { x: 150, y: 450, width: 150, height: 20 },
      // Second jump platform
      { x: 400, y: 400, width: 150, height: 20 },
      // Third platform
      { x: 650, y: 350, width: 150, height: 20 },
      // Final platform before finish
      { x: 900, y: 300, width: 150, height: 20 }
    ],
    buttons: [
      { id: 'btn1', x: 950, y: 260, width: 50, height: 30 }
    ],
    gates: [
      { id: 'gate1', x: 1050, y: 280, width: 30, height: 100, buttonId: 'btn1' }
    ],
    moveableBlocks: [],
    finishLine: { x: 1100, y: 200, width: 80, height: 150 }
  },

  // Level 1: The Gate
  {
    name: 'The Gate',
    description: 'Button hold mechanic - P1 holds button while P2 passes',
    platforms: [
      // Ground
      { x: 0, y: 550, width: 1200, height: 50 },
      // Platform for button area
      { x: 50, y: 450, width: 200, height: 20 },
      // Path across
      { x: 300, y: 400, width: 200, height: 20 },
      { x: 550, y: 350, width: 200, height: 20 },
      { x: 800, y: 300, width: 200, height: 20 }
    ],
    buttons: [
      { id: 'btn1', x: 80, y: 410, width: 50, height: 30 },
      { id: 'btn2', x: 830, y: 260, width: 50, height: 30 }
    ],
    gates: [
      { id: 'gate1', x: 280, y: 320, width: 30, height: 150, buttonId: 'btn1' },
      { id: 'gate2', x: 1050, y: 220, width: 30, height: 150, buttonId: 'btn2' }
    ],
    moveableBlocks: [],
    finishLine: { x: 1100, y: 200, width: 80, height: 150 }
  },

  // Level 2: The Stack
  {
    name: 'The Stack',
    description: 'Player stacking - jump on another player to reach high ledges',
    platforms: [
      // Ground
      { x: 0, y: 550, width: 1200, height: 50 },
      // Initial platform
      { x: 50, y: 450, width: 150, height: 20 },
      // Platform for stacking
      { x: 250, y: 450, width: 200, height: 20 },
      // High wall (can't jump directly)
      { x: 500, y: 350, width: 30, height: 150 },
      // Ledge above wall
      { x: 480, y: 280, width: 100, height: 20 },
      // Platform to finish
      { x: 700, y: 300, width: 200, height: 20 }
    ],
    buttons: [],
    gates: [],
    moveableBlocks: [],
    finishLine: { x: 850, y: 200, width: 150, height: 100 }
  },

  // Level 3: The Heavy Block
  {
    name: 'The Heavy Block',
    description: 'Push a heavy block that requires both players',
    platforms: [
      // Ground
      { x: 0, y: 550, width: 1200, height: 50 },
      // Starting platform
      { x: 50, y: 450, width: 150, height: 20 },
      // Platform with heavy block
      { x: 250, y: 430, width: 300, height: 20 },
      // Goal platform
      { x: 600, y: 350, width: 200, height: 20 }
    ],
    buttons: [],
    gates: [],
    moveableBlocks: [
      { 
        id: 'block1',
        x: 350,
        y: 390,
        width: 60,
        height: 60,
        weight: 2  // Requires 2 players to push
      }
    ],
    finishLine: { x: 650, y: 250, width: 150, height: 100 }
  },

  // Level 4: The Exam
  {
    name: 'The Exam',
    description: 'Combine all mechanics: buttons, stacking, and pushing',
    platforms: [
      // Ground
      { x: 0, y: 550, width: 1200, height: 50 },
      // Start
      { x: 50, y: 450, width: 150, height: 20 },
      // First button platform
      { x: 250, y: 450, width: 120, height: 20 },
      // Gate path
      { x: 420, y: 400, width: 120, height: 20 },
      // Stacking area
      { x: 600, y: 400, width: 150, height: 20 },
      // High ledge (needs stacking)
      { x: 750, y: 280, width: 120, height: 20 },
      // Heavy block area
      { x: 900, y: 350, width: 200, height: 20 },
      // Final platforms
      { x: 1050, y: 280, width: 150, height: 20 }
    ],
    buttons: [
      { id: 'btn1', x: 270, y: 410, width: 50, height: 30 },
      { id: 'btn2', x: 1080, y: 240, width: 50, height: 30 }
    ],
    gates: [
      { id: 'gate1', x: 400, y: 320, width: 30, height: 130, buttonId: 'btn1' },
      { id: 'gate2', x: 1030, y: 200, width: 30, height: 130, buttonId: 'btn2' }
    ],
    moveableBlocks: [
      {
        id: 'block1',
        x: 920,
        y: 310,
        width: 50,
        height: 50,
        weight: 2
      }
    ],
    finishLine: { x: 1100, y: 180, width: 80, height: 150 }
  }
];
