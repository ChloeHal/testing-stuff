const island = document.getElementById("island");
const inner = document.getElementById("island-inner");
const emojiGrid = document.getElementById("emoji-grid");
const phraseBox = document.getElementById("phrase-box");

let busy = false;

// Start idle
island.classList.add("idle");

/* ─── Random data ─────────────────────────────────────── */

const NAMES = [
  "Lea", "Hugo", "Emma", "Louis", "Chloe", "Lucas",
  "Jade", "Nathan", "Lily", "Raphael", "Camille", "Theo",
  "Ines", "Jules", "Sarah", "Matt", "Zoe", "Axel",
  "Lina", "Tom", "Clara", "Enzo", "Alice", "Noah"
];

const PHRASES = {
  "love": [
    "Love makes everything better",
    "Your heart shines bright",
    "Because you deserve it",
    "With all my heart",
    "Love is in the air"
  ],
  "strength": [
    "You're stronger than you think",
    "Nothing can stop you",
    "The force is within you",
    "Go go go!",
    "You're gonna crush it"
  ],
  "luck": [
    "May fortune smile on you",
    "The stars are aligned",
    "Fingers crossed",
    "It's your lucky day",
    "Fortune favors the bold"
  ],
  "fire": [
    "You're on fire today",
    "It's lit!",
    "On fire!",
    "Nothing stops you",
    "Hot hot hot"
  ],
  "stars": [
    "You shine like a star",
    "Aim for the stars",
    "Reach for the stars",
    "The sky is your limit",
    "Shine bright"
  ]
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── Click emoji button ─────────────────────────────── */

emojiGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".emoji-btn");
  if (!btn || busy) return;
  busy = true;

  const emoji = btn.dataset.emoji;
  const msg = btn.dataset.msg;

  // Button launch effect
  btn.classList.add("launched");
  setTimeout(() => btn.classList.remove("launched"), 350);

  // Emoji arrives directly in island (sent from another phone)
  receiveEmoji(emoji, msg);
});

/* ─── Island receives emoji ──────────────────────────── */

function receiveEmoji(emoji, msg) {
  const name = pickRandom(NAMES);
  const phrases = PHRASES[msg] || ["✨"];
  const phrase = pickRandom(phrases);

  // Stop idle
  island.classList.remove("idle", "settle");

  // ── Phase 1: EXPAND — show emoji + name + message directly ──
  island.classList.add("show");
  const label = msg ? `${name} sends you ${msg}` : "Received!";
  inner.innerHTML =
    `<span class="i-emoji pop">${emoji}</span>` +
    `<span class="i-label enter">${label}</span>` +
    `<div class="i-progress run"></div>`;

  // ── Phase 1b: Phrase box emerges below island with gooey ──
  setTimeout(() => {
    phraseBox.textContent = `"${phrase}"`;
    phraseBox.classList.add("visible", "spring");
  }, 600);

  // ── Phase 3: COLLAPSE back to compact ──
  setTimeout(() => {
    phraseBox.classList.remove("spring");
    phraseBox.classList.remove("visible");

    inner.style.opacity = "0";

    setTimeout(() => {
      island.classList.remove("show");
      inner.innerHTML = "";
      inner.style.opacity = "";
      phraseBox.textContent = "";

      // Settle spring
      island.classList.add("settle");
      setTimeout(() => {
        island.classList.remove("settle");
        island.classList.add("idle");
      }, 700);

      busy = false;
    }, 400);
  }, 2800);
}

