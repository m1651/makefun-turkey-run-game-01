// Screens: the HUD during a run, and the title, caught and escaped screens.
// Buttons are drawn as rects and their hit areas are exported for clicks.

import { ESCAPE_DISTANCE, STAGE_NAMES, stageOf } from './state.js';
import { drawTurkey, drawFarmer, drawTree } from './art.js';

export const START_BUTTON = { x: 380, y: 400, w: 200, h: 56 };
export const AGAIN_BUTTON = { x: 380, y: 408, w: 200, h: 56 };

function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function clickedButton(clicks, rect) {
  return clicks.some((c) => inRect(c.x, c.y, rect));
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43, 26, 18, 0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#e8a13a';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function button(ctx, rect, label) {
  ctx.fillStyle = '#c94f1e';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#f2c230';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

export function drawHUD(ctx, g, width) {
  // Top bar
  ctx.fillStyle = 'rgba(43, 26, 18, 0.78)';
  ctx.beginPath();
  ctx.roundRect(12, 10, width - 24, 52, 10);
  ctx.fill();

  // Hearts
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, 40 + i * 34, 36, i < g.hearts);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`SCORE ${Math.floor(g.score)}`, 150, 44);
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#f2c230';
  ctx.fillText(`${Math.floor(g.distance)} m`, 365, 43);

  // Progress to the forest gate
  const px = 495, pw = 225;
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath(); ctx.roundRect(px, 26, pw, 16, 8); ctx.fill();
  ctx.fillStyle = '#7fb069';
  ctx.beginPath();
  ctx.roundRect(px, 26, Math.max(16, pw * (g.distance / ESCAPE_DISTANCE)), 16, 8);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(STAGE_NAMES[stageOf(g.distance)], px + 4, 58);

  // Farmer proximity: the closer the bar fills, the nearer the farmer.
  const fx = 740, fw = 180;
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('FARMER', fx, 24);
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath(); ctx.roundRect(fx, 30, fw, 12, 6); ctx.fill();
  const danger = 1 - Math.max(0, g.farmerGap) / 170;
  ctx.fillStyle = danger > 0.66 ? '#d23b2e' : danger > 0.33 ? '#e8a13a' : '#7fb069';
  ctx.beginPath();
  ctx.roundRect(fx, 30, Math.max(8, fw * danger), 12, 6);
  ctx.fill();
  if (danger > 0.66) {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText("HE'S CLOSE!", fx, 58);
  }
}

function drawHeart(ctx, x, y, full) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = full ? '#d23b2e' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 12, -4, 0, 8);
  ctx.fill();
  ctx.restore();
}

export function drawTitle(ctx, g, width, height) {
  ctx.fillStyle = 'rgba(43, 26, 18, 0.45)';
  ctx.fillRect(0, 0, width, height);

  // The turkey, front and centre, bobbing
  drawTurkey(ctx, 480, 300 + Math.sin(g.time * 2) * 6, { runPhase: g.time, vy: 0 });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 58px "Trebuchet MS", Verdana, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillText("GOBBLE'S GREAT ESCAPE", 480, 96);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#f2c230';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster. RUN.', 480, 136);

  panel(ctx, 250, 330, 460, 56);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Jump the ovens and fences  ·  Duck the carving knives', 480, 352);
  ctx.fillText('Grab the corn  ·  Reach the forest gate at 1000 m', 480, 374);

  button(ctx, START_BUTTON, 'START RUNNING');
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('SPACE or CLICK to jump  ·  DOWN or S to duck  ·  3 hits and the farmer grabs you', 480, 492);
  if (g.best > 0) {
    ctx.fillStyle = '#f2c230';
    ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(`Best score so far: ${g.best}`, 480, 516);
  }
}

function endStats(ctx, g, y) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Score ${Math.floor(g.score)}   ·   Distance ${Math.floor(g.distance)} m`, 480, y);
  ctx.font = '17px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillStyle = '#f2c230';
  ctx.fillText(`Best score: ${Math.floor(g.best)}`, 480, y + 28);
}

export function drawCaught(ctx, g, width, height) {
  ctx.fillStyle = 'rgba(60, 10, 8, 0.55)';
  ctx.fillRect(0, 0, width, height);
  // The farmer, looming over the turkey on the ground
  drawFarmer(ctx, 640, 452, g.time, true);
  drawTurkey(ctx, 280, 452, { runPhase: 0, vy: 0, hurt: false });

  panel(ctx, 230, 60, 500, 150);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff6b5e';
  ctx.font = 'bold 54px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('CAUGHT!', 480, 122);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('The farmer grabbed you before the forest.', 480, 158);
  ctx.fillText('Thanksgiving dinner is served… next time, run faster.', 480, 186);

  endStats(ctx, g, 352);
  button(ctx, AGAIN_BUTTON, 'RUN AGAIN');
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Press R or SPACE, or click the button', 480, 500);
}

export function drawEscaped(ctx, g, width, height) {
  ctx.fillStyle = 'rgba(20, 50, 25, 0.5)';
  ctx.fillRect(0, 0, width, height);
  // The turkey, safe among the trees, gobbling in triumph
  drawTree(ctx, 640, 452, 1.3, true);
  drawTree(ctx, 770, 452, 1.1, false);
  drawTurkey(ctx, 300, 452 + Math.sin(g.time * 3) * 5, { runPhase: g.time, vy: 0 });

  panel(ctx, 230, 60, 500, 150);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7fb069';
  ctx.font = 'bold 54px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('ESCAPED!', 480, 122);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('You made it to the forest. No dinner table for you!', 480, 158);
  ctx.fillText('The farmer is still looking. Enjoy the corn.', 480, 186);

  endStats(ctx, g, 352);
  button(ctx, AGAIN_BUTTON, 'RUN AGAIN');
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Press R or SPACE, or click the button', 480, 500);
}
