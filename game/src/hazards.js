// Hazards: ovens and fences to jump, swinging carving knives to duck,
// and corn to collect. Spawning, movement, drawing and collisions live here.

import { GROUND_Y, TURKEY_X, currentSpeed } from './state.js';
import { drawOven, drawKnife, drawCorn, drawFence } from './art.js';
import { sounds } from './audio.js';

const SPAWN_X = 1020;

function turkeyBox(g) {
  const t = g.turkey;
  const h = t.ducking ? 40 : 62;
  return { x: TURKEY_X - 26, y: t.y - h, w: 52, h };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function spawnHazards(g, dt) {
  g.spawnIn -= dt;
  if (g.spawnIn > 0) return;
  const speed = currentSpeed(g);
  // Gap shrinks as the run gets faster, never below a fair jump distance.
  const baseGap = Math.max(0.62, 1.25 - g.distance / 2200);
  g.spawnIn = baseGap * (0.85 + Math.random() * 0.5);

  const roll = Math.random();
  if (roll < 0.34) {
    g.hazards.push({ kind: 'oven', x: SPAWN_X, w: 76, h: 72, hit: false });
  } else if (roll < 0.58) {
    g.hazards.push({ kind: 'fence', x: SPAWN_X, w: 44, h: 52, hit: false });
  } else if (roll < 0.82) {
    g.hazards.push({
      kind: 'knife', x: SPAWN_X, pivotY: 0, len: 330 + Math.random() * 40,
      angle: -0.5, swing: 1.6 + Math.random() * 0.7, phase: Math.random() * 6, hit: false,
    });
  } else {
    // Double trouble: a fence with a knife right behind it.
    g.hazards.push({ kind: 'fence', x: SPAWN_X, w: 44, h: 52, hit: false });
    g.hazards.push({
      kind: 'knife', x: SPAWN_X + 150, pivotY: 0, len: 340,
      angle: 0.4, swing: 1.8, phase: 1.2, hit: false,
    });
  }

  // Corn: an arc the turkey jumps through, or a low row to run through.
  if (Math.random() < 0.75) {
    const arc = Math.random() < 0.5;
    for (let i = 0; i < 3; i++) {
      g.pickups.push({
        x: SPAWN_X + 60 + i * 44,
        y: arc ? GROUND_Y - 118 + Math.abs(i - 1) * 34 : GROUND_Y - 34,
        taken: false,
      });
    }
  }
  void speed;
}

export function updateHazards(g, dt) {
  const speed = currentSpeed(g);
  for (const h of g.hazards) {
    h.x -= speed * dt;
    if (h.kind === 'knife') {
      h.phase += dt;
      h.angle = Math.sin(h.phase * h.swing) * 0.55;
    }
  }
  g.hazards = g.hazards.filter((h) => h.x > -160);
  for (const p of g.pickups) p.x -= speed * dt;
  g.pickups = g.pickups.filter((p) => p.x > -60 && !p.taken);

  // Collisions
  const box = turkeyBox(g);
  for (const h of g.hazards) {
    if (h.hit || g.invuln > 0) continue;
    let hitBox;
    if (h.kind === 'knife') {
      const tipX = h.x + Math.sin(h.angle) * h.len;
      const tipY = h.pivotY + Math.cos(h.angle) * h.len;
      hitBox = { x: tipX - 12, y: tipY - 60, w: 24, h: 78 };
    } else {
      hitBox = { x: h.x - h.w / 2, y: GROUND_Y - h.h, w: h.w, h: h.h };
    }
    if (overlap(box, hitBox)) {
      h.hit = true;
      onHit(g);
    }
  }
  for (const p of g.pickups) {
    if (p.taken) continue;
    const cob = { x: p.x - 14, y: p.y - 18, w: 28, h: 36 };
    if (overlap(box, cob)) {
      p.taken = true;
      g.score += 25;
      g.cornStreak += 1;
      g.farmerGap = Math.min(170, g.farmerGap + 6);
      if (g.cornStreak % 5 === 0) g.score += 25; // every 5th cob is a bonus
      burst(g, p.x, p.y, '#f2c230', 8);
      if (!g.muted) sounds.chirp();
    }
  }
}

function onHit(g) {
  g.hearts -= 1;
  g.invuln = 1.4;
  g.farmerGap -= 55;
  g.shake = 14;
  g.flash = 0.55;
  g.cornStreak = 0;
  burst(g, TURKEY_X, g.turkey.y - 40, '#ffffff', 14);
  burst(g, TURKEY_X, g.turkey.y - 40, '#8a5a2b', 10);
  if (!g.muted) {
    sounds.thud();
    sounds.alarm();
  }
  if (g.hearts <= 0 || g.farmerGap <= 0) {
    g.hearts = Math.max(0, g.hearts);
  }
}

export function burst(g, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    g.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 320,
      vy: -Math.random() * 260 - 40,
      life: 0.7 + Math.random() * 0.4,
      age: 0,
      color,
      r: 2 + Math.random() * 4,
    });
  }
}

export function updateParticles(g, dt) {
  for (const p of g.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 700 * dt;
  }
  g.particles = g.particles.filter((p) => p.age < p.life);
}

export function drawHazards(ctx, g) {
  for (const p of g.pickups) drawCorn(ctx, p.x, p.y, g.time);
  for (const h of g.hazards) {
    if (h.kind === 'oven') drawOven(ctx, h.x, GROUND_Y);
    else if (h.kind === 'fence') drawFence(ctx, h.x, GROUND_Y);
    else if (h.kind === 'knife') drawKnife(ctx, h.x, h.pivotY, h.angle, h.len);
  }
  for (const p of g.particles) {
    ctx.globalAlpha = 1 - p.age / p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
