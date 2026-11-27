// Main: boots the game, runs the loop, and wires input, physics, hazards,
// the farmer chase and the screens together.
//
// Controls: SPACE / CLICK / W / UP jumps, DOWN / S ducks, R restarts after
// a run ends, M mutes. The farmer closes in when the turkey is hit and
// falls back while the turkey runs clean; three hits, or the farmer
// reaching the turkey, ends the run caught. Reaching 1000 m escapes.

import { createGame, startRun, endCaught, endEscaped, currentSpeed, ESCAPE_DISTANCE, GROUND_Y, TURKEY_X } from './state.js';
import { installInput, held, wasPressed, takeClicks, endFrameInput } from './input.js';
import { ensureAudio, sounds } from './audio.js';
import { drawWorld } from './world.js';
import { drawTurkey, drawFarmer } from './art.js';
import { spawnHazards, updateHazards, updateParticles, drawHazards } from './hazards.js';
import { drawHUD, drawTitle, drawCaught, drawEscaped, START_BUTTON, AGAIN_BUTTON, clickedButton } from './screens.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const g = createGame();

// Debug hook for automated play-tests: exposes the live game state.
window.__gobble = g;

installInput(canvas, () => ensureAudio());

// Screenshot hook: ?shot=play|caught|escaped renders a real game state
// straight from the game's own code, for the entry's screenshots.
const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'play') {
  startRun(g);
  g.distance = 412;
  g.score = 340;
  g.farmerGap = 78;
  g.hazards.push({ kind: 'oven', x: 660, w: 76, h: 72, hit: false });
  g.hazards.push({ kind: 'fence', x: 880, w: 44, h: 52, hit: false });
  g.hazards.push({ kind: 'knife', x: 520, pivotY: 0, len: 330, angle: -0.35, swing: 1.6, phase: 1.0, hit: false });
  g.pickups.push({ x: 420, y: GROUND_Y - 118, taken: false });
  g.pickups.push({ x: 464, y: GROUND_Y - 150, taken: false });
  g.pickups.push({ x: 508, y: GROUND_Y - 118, taken: false });
  g.turkey.y = GROUND_Y - 70;
  g.turkey.vy = -220;
  g.turkey.grounded = false;
} else if (shot === 'caught') {
  startRun(g);
  g.distance = 623;
  g.score = 512;
  g.hearts = 0;
  g.farmerGap = 0;
  endCaught(g);
} else if (shot === 'escaped') {
  startRun(g);
  g.distance = ESCAPE_DISTANCE;
  g.score = 1280;
  endEscaped(g);
}

function tryJump() {
  if (g.mode !== 'playing') return;
  const t = g.turkey;
  if (t.grounded) {
    t.vy = -830;
    t.grounded = false;
    t.ducking = false;
    if (!g.muted) sounds.jump();
  }
}

function update(dt) {
  g.time += dt;
  if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 30);
  if (g.flash > 0) g.flash = Math.max(0, g.flash - dt * 1.4);
  if (g.invuln > 0) g.invuln -= dt;

  if (g.mode === 'playing') {
    g.runTime += dt;
    g.speed = currentSpeed(g);
    g.distance += (g.speed * dt) / 55;
    g.score += (g.speed * dt) / 110;

    // The farmer falls back while the turkey runs clean.
    g.farmerGap = Math.min(170, g.farmerGap + dt * 5);

    // Turkey physics
    const t = g.turkey;
    t.ducking = held('ArrowDown') || held('KeyS');
    t.runPhase += dt;
    if (!t.grounded) {
      t.vy += 2400 * dt;
      t.y += t.vy * dt;
      if (t.y >= GROUND_Y) {
        t.y = GROUND_Y;
        t.vy = 0;
        t.grounded = true;
      }
    }

    spawnHazards(g, dt);
    updateHazards(g, dt);
    updateParticles(g, dt);

    // Caught: out of hearts, or the farmer closed the gap.
    if (g.hearts <= 0 || g.farmerGap <= 0) {
      g.farmerGap = Math.max(0, g.farmerGap);
      if (!g.muted) sounds.caught();
      endCaught(g);
    } else if (g.distance >= ESCAPE_DISTANCE) {
      g.distance = ESCAPE_DISTANCE;
      if (!g.muted) sounds.fanfare();
      endEscaped(g);
    }
  } else {
    updateParticles(g, dt);
  }
}

function render() {
  ctx.save();
  if (g.shake > 0) {
    ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
  }
  drawWorld(ctx, g, W, H);

  if (g.mode === 'title') {
    drawTitle(ctx, g, W, H);
  } else if (g.mode === 'playing') {
    drawHazards(ctx, g);
    // The farmer trails the turkey from the left.
    const farmerX = TURKEY_X - 96 - g.farmerGap;
    if (farmerX > -120) {
      drawFarmer(ctx, farmerX, GROUND_Y, g.runTime, g.farmerGap < 60);
    }
    drawTurkey(ctx, TURKEY_X, g.turkey.y, {
      ducking: g.turkey.ducking,
      runPhase: g.turkey.runPhase,
      vy: g.turkey.grounded ? 0 : g.turkey.vy,
      hurt: g.invuln > 0,
    });
    drawHUD(ctx, g, W);
  } else if (g.mode === 'caught') {
    drawCaught(ctx, g, W, H);
  } else if (g.mode === 'escaped') {
    drawEscaped(ctx, g, W, H);
  }

  if (g.flash > 0) {
    ctx.fillStyle = `rgba(210, 59, 46, ${g.flash * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function handleInput() {
  const clicks = takeClicks();

  if (wasPressed('KeyM')) {
    g.muted = !g.muted;
  }

  if (g.mode === 'title') {
    if (wasPressed('Space') || wasPressed('Enter') || clickedButton(clicks, START_BUTTON) || clicks.length > 0) {
      if (!g.muted) sounds.click();
      startRun(g);
      if (!g.muted) sounds.gobble();
    }
    return;
  }

  if (g.mode === 'playing') {
    if (wasPressed('Space') || wasPressed('ArrowUp') || wasPressed('KeyW') || clicks.length > 0) {
      tryJump();
    }
    return;
  }

  // Caught or escaped: restart, but not on the very first frames after the end.
  if (g.time - g.endAt > 0.6) {
    if (wasPressed('KeyR') || wasPressed('Space') || wasPressed('Enter') || clickedButton(clicks, AGAIN_BUTTON)) {
      if (!g.muted) sounds.click();
      startRun(g);
      if (!g.muted) sounds.gobble();
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleInput();
  update(dt);
  render();
  endFrameInput();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
