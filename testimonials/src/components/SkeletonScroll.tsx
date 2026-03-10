import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

// ── Skeleton lines ───────────────────────────────────────────────────────
const SKELETON_LINES = [
  "85%", "100%", "70%", "95%", "60%", "90%", "75%", "100%",
  "50%", "88%", "65%", "95%", "80%", "45%", "100%", "70%",
];

const LINE_H = 12;
const GAP = 12;
const SET_HEIGHT = SKELETON_LINES.length * LINE_H + (SKELETON_LINES.length - 1) * GAP;
const LINES = [...SKELETON_LINES, ...SKELETON_LINES];

// ── Typing bubble ────────────────────────────────────────────────────────
const QUESTIONS = [
  "Some clients never pay me on time. What can we do to improve this?",
  "I keep losing track of inventory across warehouses. How do I fix that?",
  "My team wastes hours on duplicate data entry every week. Any solution?",
  "We have no visibility on project profitability until it's too late.",
  "Customer complaints keep falling through the cracks. How do we stop that?",
];

const TYPE_SPEED = 55;
const PAUSE_AFTER = 2000;
const ERASE_SPEED = 30;

function TypingBubble() {
  const [text, setText] = useState("");
  const qIdx = useRef(0);
  const phase = useRef<"typing" | "pausing" | "erasing">("typing");
  const charIdx = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function tick() {
      const question = QUESTIONS[qIdx.current];

      if (phase.current === "typing") {
        charIdx.current++;
        setText(question.slice(0, charIdx.current));
        if (charIdx.current >= question.length) {
          phase.current = "pausing";
          timer.current = setTimeout(tick, PAUSE_AFTER);
        } else {
          const jitter = Math.random() * 60 - 30;
          timer.current = setTimeout(tick, TYPE_SPEED + jitter);
        }
      } else if (phase.current === "pausing") {
        phase.current = "erasing";
        timer.current = setTimeout(tick, ERASE_SPEED);
      } else {
        charIdx.current--;
        setText(question.slice(0, charIdx.current));
        if (charIdx.current <= 0) {
          qIdx.current = (qIdx.current + 1) % QUESTIONS.length;
          phase.current = "typing";
          timer.current = setTimeout(tick, 400);
        } else {
          timer.current = setTimeout(tick, ERASE_SPEED);
        }
      }
    }

    timer.current = setTimeout(tick, 600);
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <div className="absolute -top-6 -right-6 flex items-start gap-2.5">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md w-[320px]">
        <p className="text-sm text-slate-700 leading-relaxed">
          {text}
          <span className="inline-block w-[2px] h-[14px] bg-slate-400 ml-0.5 align-middle animate-pulse" />
        </p>
      </div>
      <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
        JD
      </div>
    </div>
  );
}

// ── AI response bubble (static) ──────────────────────────────────────────
function AiBubble() {
  return (
    <div className="absolute -bottom-6 -left-6 flex items-end gap-2.5">
      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white">
          <path d="M8 1L2 5v6l6 4 6-4V5L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-md">
        <p className="text-sm text-slate-700 leading-relaxed">
          Improve your workflow with enobase
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export function SkeletonScroll() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20">
      <div className="relative w-1/3">
        <div
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
          style={{ height: 320 }}
        >
          <motion.div
            className="flex flex-col gap-3 px-5 py-4"
            animate={{ y: [0, -(SET_HEIGHT + GAP)] }}
            transition={{
              y: {
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {LINES.map((w, i) => (
              <div
                key={i}
                className="h-3 rounded-full bg-slate-100"
                style={{ width: w }}
              />
            ))}
          </motion.div>
        </div>

        <TypingBubble />
        <AiBubble />

        {/* ── Floating management icons — bottom right inside frame ──── */}
        <div className="absolute bottom-12 right-4" style={{ width: 140, height: 80 }}>
          {/* Invoice / receipt */}
          <div className="absolute right-0 top-0 w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center rotate-5" style={{ animation: "float 4s ease-in-out infinite" }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-slate-400">
              <path d="M5 1h10a1 1 0 011 1v16l-2-1.5L12 18l-2-1.5L8 18l-2-1.5L4 18V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 6h6M7 9h4M7 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          {/* Database / table */}
          <div className="absolute right-14 bottom-0 w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center -rotate-3" style={{ animation: "float 4s ease-in-out infinite 0.8s" }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-slate-400">
              <ellipse cx="10" cy="5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3 5v10c0 1.66 3.13 3 7 3s7-1.34 7-3V5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3 10c0 1.66 3.13 3 7 3s7-1.34 7-3" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </div>
          {/* Bar chart / analytics */}
          <div className="absolute left-0 top-4 w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center rotate-2" style={{ animation: "float 4s ease-in-out infinite 1.5s" }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 text-slate-400">
              <rect x="2" y="10" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8.5" y="6" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="15" y="3" width="3" height="15" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
