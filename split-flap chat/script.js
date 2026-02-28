const PHRASES = [
  "Pulling at threads",
  "Sifting through noise",
  "Connecting fragments",
  "Weighing perspectives",
  "Tracing the outline",
  "Letting it crystallize",
  "Almost there",
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-!?";
const TICK_MS = 60;       // slower roll per tick
const STAGGER_MS = 55;    // more visible left-to-right wave
const SETTLE_TICKS = 5;   // number of ticks before a slot resolves
const PHRASE_HOLD_MS = 3500;

const statusLine = document.getElementById("status-line");

let slots = [];
let currentPhrase = "";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function createSlot() {
  const span = document.createElement("span");
  span.className = "flap-char rolling";
  span.textContent = randomChar();
  return { el: span, interval: null, resolved: false };
}

function transitionTo(phrase) {
  const target = phrase.split("");
  const prevLen = slots.length;
  const newLen = target.length;

  // Grow slots if needed
  while (slots.length < newLen) {
    const slot = createSlot();
    statusLine.appendChild(slot.el);
    slots.push(slot);
  }

  // Start rolling + resolve with stagger
  for (let i = 0; i < newLen; i++) {
    const slot = slots[i];
    const char = target[i];

    if (slot.interval) clearInterval(slot.interval);
    slot.resolved = false;
    slot.el.className = "flap-char rolling";

    if (char === " ") {
      slot.el.classList.add("space");
    } else {
      slot.el.classList.remove("space");
    }

    // Roll through random characters
    slot.interval = setInterval(() => {
      slot.el.textContent = randomChar();
    }, TICK_MS);

    // Resolve after stagger delay
    setTimeout(() => {
      clearInterval(slot.interval);
      slot.interval = null;
      slot.resolved = true;
      slot.el.textContent = char === " " ? "\u00A0" : char;
      slot.el.className = "flap-char resolved" + (char === " " ? " space" : "");
    }, STAGGER_MS * i + TICK_MS * SETTLE_TICKS);
  }

  // Shrink excess slots: flip to space then remove
  for (let i = newLen; i < prevLen; i++) {
    const slot = slots[i];
    if (slot.interval) clearInterval(slot.interval);

    slot.el.className = "flap-char rolling";
    slot.interval = setInterval(() => {
      slot.el.textContent = randomChar();
    }, TICK_MS);

    const removeDelay = STAGGER_MS * i + TICK_MS * SETTLE_TICKS;
    setTimeout(() => {
      clearInterval(slot.interval);
      slot.el.textContent = "\u00A0";
      slot.el.style.transition = "opacity 200ms ease, width 200ms ease";
      slot.el.style.opacity = "0";
      slot.el.style.width = "0";
      setTimeout(() => slot.el.remove(), 220);
    }, removeDelay);
  }

  if (newLen < prevLen) {
    slots.length = newLen;
  }

  currentPhrase = phrase;
}

// Cycle through phrases
let phraseIndex = 0;

function nextPhrase() {
  transitionTo(PHRASES[phraseIndex]);
  phraseIndex = (phraseIndex + 1) % PHRASES.length;
}

nextPhrase();
setInterval(nextPhrase, PHRASE_HOLD_MS);
