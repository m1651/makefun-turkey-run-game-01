// Game state: one object holds everything the run needs, so every other
// module can read and update it without globals of its own.

export const ESCAPE_DISTANCE = 1000; // metres to the forest gate
export const GROUND_Y = 452;         // canvas y of the ground surface
export const TURKEY_X = 190;         // turkey stays near the left, world scrolls

export function createGame() {
  return {
    mode: 'title',           // 'title' | 'playing' | 'caught' | 'escaped'
    time: 0,                 // seconds since the page loaded
    runTime: 0,              // seconds since this run started
    distance: 0,             // metres fled
    score: 0,
    best: 0,
    hearts: 3,
    speed: 0,                // px per second of the scrolling world
    farmerGap: 150,          // px between turkey and farmer; 0 means caught
    invuln: 0,               // seconds of post-hit flashing
    shake: 0,                // screen-shake strength, decays to 0
    flash: 0,                // red flash alpha after a hit
    endAt: 0,                // time the run ended (restart guard)
    muted: false,
    turkey: {
      y: GROUND_Y,           // feet position
      vy: 0,
      grounded: true,
      ducking: false,
      runPhase: 0,
    },
    hazards: [],             // ovens, fences and swinging knives
    pickups: [],             // corn cobs
    particles: [],           // feathers, dust, sparkles
    spawnIn: 1.1,            // seconds until the next hazard spawns
    cornStreak: 0,
  };
}

export function startRun(g) {
  g.mode = 'playing';
  g.runTime = 0;
  g.distance = 0;
  g.score = 0;
  g.hearts = 3;
  g.speed = 270;
  g.farmerGap = 150;
  g.invuln = 0;
  g.shake = 0;
  g.flash = 0;
  g.turkey.y = GROUND_Y;
  g.turkey.vy = 0;
  g.turkey.grounded = true;
  g.turkey.ducking = false;
  g.hazards = [];
  g.pickups = [];
  g.particles = [];
  g.spawnIn = 1.1;
  g.cornStreak = 0;
}

export function endCaught(g) {
  g.mode = 'caught';
  g.endAt = g.time;
  g.best = Math.max(g.best, g.score);
}

export function endEscaped(g) {
  g.mode = 'escaped';
  g.endAt = g.time;
  g.best = Math.max(g.best, g.score);
}

// Difficulty ramps with distance: faster world, tighter spawns.
export function currentSpeed(g) {
  return Math.min(560, 270 + g.distance * 0.30);
}

export function stageOf(distance) {
  if (distance < 300) return 0; // farmyard
  if (distance < 650) return 1; // cornfield
  if (distance < 900) return 2; // kitchen yard
  return 3;                     // forest edge
}

export const STAGE_NAMES = ['Farmyard', 'Cornfield', 'Kitchen Yard', 'Forest Edge'];
