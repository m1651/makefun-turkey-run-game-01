// Art: every sprite is drawn with canvas paths — original vector art, no
// image files. Each function draws one thing at (x, y), the turkey's feet
// or an object's base.

export function drawTurkey(ctx, x, feetY, opts = {}) {
  const { ducking = false, runPhase = 0, vy = 0, hurt = false } = opts;
  const air = vy !== 0;
  const legSwing = air ? 0.5 : Math.sin(runPhase * 10) * 0.6;
  const squash = ducking ? 0.62 : 1;
  ctx.save();
  ctx.translate(x, feetY);
  if (hurt && Math.floor(runPhase * 20) % 2 === 0) ctx.globalAlpha = 0.45;

  // Legs
  ctx.strokeStyle = '#e08a2e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -14 * squash); ctx.lineTo(-6 + legSwing * 12, 0);
  ctx.moveTo(6, -14 * squash); ctx.lineTo(6 - legSwing * 12, 0);
  ctx.stroke();

  // Tail fan: five fanned feathers behind the body
  for (let i = -2; i <= 2; i++) {
    const a = -Math.PI / 2 + i * 0.38;
    const len = 34;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#6e4520';
    ctx.beginPath();
    ctx.ellipse(-16, -len / 2 - 12, 7, len / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98f3d';
    ctx.beginPath();
    ctx.ellipse(-16, -len - 8, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Body
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(0, -26 * squash, 26, 22 * squash, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly patch
  ctx.fillStyle = '#a06a35';
  ctx.beginPath();
  ctx.ellipse(2, -20 * squash, 16, 13 * squash, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, flapping a little while running
  const flap = air ? -0.5 : Math.sin(runPhase * 10) * 0.15;
  ctx.save();
  ctx.translate(-2, -28 * squash);
  ctx.rotate(flap);
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Neck and head
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(16, -40 * squash);
  ctx.quadraticCurveTo(24, -52 * squash, 22, -60 * squash);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.arc(23, -62 * squash, 11, 0, Math.PI * 2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#e8a13a';
  ctx.beginPath();
  ctx.moveTo(32, -64 * squash);
  ctx.lineTo(44, -60 * squash);
  ctx.lineTo(32, -57 * squash);
  ctx.closePath();
  ctx.fill();
  // Wattle
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.ellipse(34, -54 * squash, 3.5, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(26, -65 * squash, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(27, -65 * squash, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawFarmer(ctx, x, feetY, runPhase, close) {
  ctx.save();
  ctx.translate(x, feetY);
  const swing = Math.sin(runPhase * 11) * 0.7;
  // Legs: blue overalls
  ctx.strokeStyle = '#2f4d7a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -30); ctx.lineTo(-5 + swing * 14, 0);
  ctx.moveTo(5, -30); ctx.lineTo(5 - swing * 14, 0);
  ctx.stroke();
  // Body: red plaid shirt
  ctx.fillStyle = '#b03a2e';
  ctx.beginPath();
  ctx.roundRect(-16, -62, 32, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#7d241c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, -50); ctx.lineTo(16, -50);
  ctx.moveTo(-16, -40); ctx.lineTo(16, -40);
  ctx.moveTo(0, -62); ctx.lineTo(0, -28);
  ctx.stroke();
  // Overall straps
  ctx.strokeStyle = '#2f4d7a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-9, -62); ctx.lineTo(-9, -44);
  ctx.moveTo(9, -62); ctx.lineTo(9, -44);
  ctx.stroke();
  // Arms reaching forward, one gripping the pitchfork
  ctx.strokeStyle = '#e8b98a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(12, -56); ctx.lineTo(30, -44 + swing * 4);
  ctx.moveTo(-12, -56); ctx.lineTo(-24, -40 - swing * 4);
  ctx.stroke();
  // Pitchfork
  ctx.save();
  ctx.translate(34, -52);
  ctx.rotate(0.5);
  ctx.strokeStyle = '#8a6b3f';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, -22); ctx.stroke();
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 3;
  for (const dx of [-7, 0, 7]) {
    ctx.beginPath(); ctx.moveTo(dx, -22); ctx.lineTo(dx, -34); ctx.stroke();
  }
  ctx.restore();
  // Head with beard
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath(); ctx.arc(0, -72, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath(); ctx.ellipse(0, -63, 10, 7, 0, 0, Math.PI); ctx.fill();
  // Straw hat
  ctx.fillStyle = '#d9b45b';
  ctx.beginPath(); ctx.ellipse(0, -80, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -81, 10, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(-10, -84, 20, 3);
  // Angry eyes when close
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath(); ctx.arc(-4, -74, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -74, 1.8, 0, Math.PI * 2); ctx.fill();
  if (close) {
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-7, -79); ctx.lineTo(-1, -77); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -79); ctx.lineTo(2, -77); ctx.stroke();
  }
  ctx.restore();
}

export function drawOven(ctx, x, baseY) {
  ctx.save();
  ctx.translate(x, baseY);
  // Body
  ctx.fillStyle = '#2b2b30';
  ctx.beginPath(); ctx.roundRect(-38, -72, 76, 72, 6); ctx.fill();
  // Hot door glow
  const glow = ctx.createLinearGradient(0, -58, 0, -18);
  glow.addColorStop(0, '#ff7a1a');
  glow.addColorStop(1, '#c81e0e');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.roundRect(-26, -58, 52, 40, 4); ctx.fill();
  ctx.strokeStyle = '#0f0f12';
  ctx.lineWidth = 3;
  ctx.strokeRect(-26, -58, 52, 40);
  ctx.beginPath(); ctx.moveTo(-26, -38); ctx.lineTo(26, -38); ctx.stroke();
  // Handle + knobs
  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-22, -64); ctx.lineTo(22, -64); ctx.stroke();
  ctx.fillStyle = '#e8e8e8';
  for (const kx of [-14, 0, 14]) {
    ctx.beginPath(); ctx.arc(kx, -10, 3, 0, Math.PI * 2); ctx.fill();
  }
  // Chimney with smoke puffs
  ctx.fillStyle = '#1e1e22';
  ctx.fillRect(18, -92, 14, 22);
  ctx.fillStyle = 'rgba(220,220,220,0.75)';
  ctx.beginPath(); ctx.arc(25, -100, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(31, -112, 8, 0, Math.PI * 2); ctx.fill();
  // Little legs and a warning sign
  ctx.fillStyle = '#111';
  ctx.fillRect(-34, 0, 8, 5);
  ctx.fillRect(26, 0, 8, 5);
  ctx.restore();
}

export function drawKnife(ctx, pivotX, pivotY, angle, len) {
  const tipX = pivotX + Math.sin(angle) * len;
  const tipY = pivotY + Math.cos(angle) * len;
  ctx.save();
  // String from the top
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(tipX, tipY - 26); ctx.stroke();
  ctx.translate(tipX, tipY - 26);
  ctx.rotate(angle + Math.PI);
  // Handle
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath(); ctx.roundRect(-6, 0, 12, 26, 4); ctx.fill();
  // Blade
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath();
  ctx.moveTo(-7, 26);
  ctx.lineTo(7, 26);
  ctx.lineTo(0, 66);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5ab';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(0, 60); ctx.stroke();
  ctx.restore();
}

export function drawCorn(ctx, x, y, phase) {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * 3) * 3);
  ctx.rotate(Math.sin(phase * 2) * 0.15);
  // Husk leaves
  ctx.fillStyle = '#4e8a2f';
  ctx.beginPath(); ctx.ellipse(-10, 6, 6, 14, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, 6, 6, 14, -0.5, 0, Math.PI * 2); ctx.fill();
  // Cob
  ctx.fillStyle = '#f2c230';
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9a41f';
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath(); ctx.arc(c * 6, r * 8, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawFence(ctx, x, baseY) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = '#8a6b3f';
  ctx.fillRect(-16, -52, 7, 52);
  ctx.fillRect(9, -52, 7, 52);
  ctx.fillStyle = '#a5814d';
  ctx.fillRect(-22, -50, 44, 7);
  ctx.fillRect(-22, -30, 44, 7);
  ctx.restore();
}

export function drawPumpkin(ctx, x, baseY, s = 1) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(s, s);
  ctx.fillStyle = '#e07b1f';
  ctx.beginPath(); ctx.ellipse(0, -12, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b85c10';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, -12, 10, 13, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#4e8a2f';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(4, -32, 10, -30); ctx.stroke();
  ctx.restore();
}

export function drawBarn(ctx, x, baseY, s = 1) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(s, s);
  ctx.fillStyle = '#a83226';
  ctx.fillRect(-90, -120, 180, 120);
  ctx.fillStyle = '#7d241c';
  ctx.beginPath();
  ctx.moveTo(-100, -120); ctx.lineTo(0, -170); ctx.lineTo(100, -120);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8e0cc';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-40, -120); ctx.lineTo(40, -120); ctx.lineTo(40, -40); ctx.lineTo(-40, -40);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, -80); ctx.lineTo(40, -80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -40); ctx.stroke();
  ctx.fillStyle = '#f2e6c8';
  ctx.beginPath(); ctx.arc(0, -140, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawTree(ctx, x, baseY, s = 1, autumn = true) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(s, s);
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(-5, -46, 10, 46);
  const cols = autumn ? ['#d97b1f', '#c94f1e', '#e8a13a'] : ['#3f7a2e', '#4e8a2f', '#5d9a3a'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i % 3];
    ctx.beginPath();
    ctx.arc((i - 1) * 14, -58 - (i % 2) * 10, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
