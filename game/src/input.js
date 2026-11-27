// Input: keyboard and mouse, with edge-triggered actions so one key press
// is exactly one jump, one start, one restart.

const keys = new Set();
const pressed = new Set(); // keys pressed since the last poll
let clickQueue = [];       // {x, y} in canvas coordinates, since last poll

export function installInput(canvas, onFirstGesture) {
  let gestured = false;
  const gesture = () => {
    if (!gestured) { gestured = true; onFirstGesture(); }
  };

  window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'KeyR', 'KeyM'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
    gesture();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    clickQueue.push({
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    });
    gesture();
  });
}

export function held(code) {
  return keys.has(code);
}

export function wasPressed(code) {
  return pressed.has(code);
}

export function takeClicks() {
  const out = clickQueue;
  clickQueue = [];
  return out;
}

// Call once per frame, after the game has read this frame's input.
export function endFrameInput() {
  pressed.clear();
}
