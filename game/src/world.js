// World: the scrolling autumn scenery. The ground scrolls with distance;
// scenery is placed deterministically per 160px segment so the farmyard,
// cornfield, kitchen yard and forest edge each read differently.

import { GROUND_Y, stageOf } from './state.js';
import { drawBarn, drawTree, drawPumpkin, drawFence } from './art.js';

// Small deterministic hash: same segment always grows the same scenery.
function hash(n) {
  let h = (n * 2654435761) >>> 0;
  h ^= h >>> 13;
  h = (h * 2246822519) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

const SKIES = [
  ['#f7c873', '#f2a65a'], // farmyard: late-afternoon gold
  ['#f2b25c', '#e08a3e'], // cornfield: deeper amber
  ['#e89a4e', '#c96a35'], // kitchen yard: dusk orange
  ['#d98a4e', '#a85a30'], // forest edge: smoky dusk
];

export function drawWorld(ctx, g, width, height) {
  const stage = stageOf(g.distance);
  const sky = SKIES[stage];
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, sky[0]);
  grad.addColorStop(1, sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, GROUND_Y + 2);

  // Sun, low and warm
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(830, 84, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(830, 84, 52, 0, Math.PI * 2);
  ctx.fill();

  // Drifting clouds (two parallax layers)
  ctx.fillStyle = 'rgba(255, 250, 235, 0.85)';
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 260 - g.distance * 12 - g.time * 6) % 1100 + 1100) % 1100 - 70;
    const cy = 46 + (i % 3) * 34;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 46, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy + 4, 30, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant hills
  ctx.fillStyle = stage === 3 ? '#7a5a3a' : '#b98a4a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= width; x += 60) {
    const wx = x + g.distance * 30;
    ctx.lineTo(x, GROUND_Y - 46 - Math.sin(wx * 0.008) * 22);
  }
  ctx.lineTo(width, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  drawScenery(ctx, g, stage, width);

  // Ground: dirt track with grassy edges
  ctx.fillStyle = '#8a6b3f';
  ctx.fillRect(0, GROUND_Y, width, height - GROUND_Y);
  ctx.fillStyle = '#a5814d';
  ctx.fillRect(0, GROUND_Y, width, 10);
  ctx.fillStyle = '#6e8a3a';
  ctx.fillRect(0, GROUND_Y, width, 4);
  // Speed streaks on the dirt
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.25)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const sx = ((i * 173 - g.distance * 55) % 1100 + 1100) % 1100 - 70;
    const sy = GROUND_Y + 22 + (i % 4) * 16;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 34, sy);
    ctx.stroke();
  }
}

function drawScenery(ctx, g, stage, width) {
  const pxPerM = 55; // world scroll: 55px per metre fled
  const offset = g.distance * pxPerM;
  const segW = 160;
  const first = Math.floor(offset / segW) - 1;
  const last = first + Math.ceil(width / segW) + 2;

  for (let seg = first; seg <= last; seg++) {
    const x = seg * segW - offset + 80;
    const r = hash(seg);
    if (stage === 0) {
      if (seg % 9 === 4) drawBarn(ctx, x, GROUND_Y, 0.85);
      else if (r < 0.45) drawTree(ctx, x, GROUND_Y, 0.9 + r * 0.5);
      else if (r < 0.7) drawPumpkin(ctx, x, GROUND_Y, 0.8 + r * 0.5);
      else drawFence(ctx, x, GROUND_Y);
    } else if (stage === 1) {
      // Cornfield: tall stalks in rows
      drawCornRow(ctx, x, r);
      if (r < 0.25) drawPumpkin(ctx, x + 40, GROUND_Y, 0.9);
    } else if (stage === 2) {
      if (seg % 8 === 3) drawHouse(ctx, x);
      else if (r < 0.4) drawTree(ctx, x, GROUND_Y, 0.8 + r * 0.4);
      else if (r < 0.65) drawPumpkin(ctx, x, GROUND_Y, 1);
      else drawFence(ctx, x, GROUND_Y);
    } else {
      // Forest edge: dense trees and the gate posts ahead
      drawTree(ctx, x, GROUND_Y, 1.1 + r * 0.6, r < 0.5);
      drawTree(ctx, x + 60, GROUND_Y, 0.9 + r * 0.4, r >= 0.5);
    }
  }

  // The forest gate: the finish line, drawn once near the end of the run
  if (stage === 3) {
    const remain = 1000 - g.distance;
    const gateX = 190 + remain * pxPerM;
    if (gateX < width + 200) drawGate(ctx, gateX);
  }
}

function drawCornRow(ctx, x, r) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  for (let i = 0; i < 4; i++) {
    const sx = i * 22 - 30;
    const h = 90 + ((r * 97 + i * 31) % 40);
    ctx.strokeStyle = '#4e7a26';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + 4, -h);
    ctx.stroke();
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.ellipse(sx + 8, -h * 0.6, 6, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d9a3a';
    ctx.beginPath();
    ctx.ellipse(sx - 4, -h * 0.45, 12, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHouse(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(-70, -110, 140, 110);
  ctx.fillStyle = '#8a3a2e';
  ctx.beginPath();
  ctx.moveTo(-80, -110); ctx.lineTo(0, -155); ctx.lineTo(80, -110);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-16, -62, 32, 62);
  ctx.fillStyle = '#7fb2d9';
  ctx.fillRect(-56, -92, 26, 26);
  ctx.fillRect(30, -92, 26, 26);
  // Chimney smoke
  ctx.fillStyle = 'rgba(220,220,220,0.7)';
  ctx.beginPath(); ctx.arc(52, -168, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(58, -182, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawGate(ctx, x) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-8, -150, 14, 150);
  ctx.fillRect(58, -150, 14, 150);
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.moveTo(-14, -150); ctx.lineTo(78, -150); ctx.lineTo(32, -178); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2e6c8';
  ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FOREST', 32, -128);
  ctx.restore();
}
