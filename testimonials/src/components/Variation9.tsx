import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "motion/react";
import { TESTIMONIALS, SECTION_TITLE, SECTION_HEADLINE } from "../data";
import { Avatar } from "./Avatar";

const COUNT = TESTIMONIALS.length;
const OFFSET = 14;
const SCALE_STEP = 0.02;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function Variation9() {
  const [current, setCurrent] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardHeights, setCardHeights] = useState<number[]>(
    () => Array(COUNT).fill(260)
  );

  // Measure all cards once on mount. Cards are rendered hidden off-screen
  // to get their natural heights.
  useLayoutEffect(() => {
    const h = cardRefs.current.map((el) => el?.offsetHeight ?? 260);
    setCardHeights(h);
  }, []);

  const goNext = () => setCurrent((c) => mod(c + 1, COUNT));
  const goPrev = () => setCurrent((c) => mod(c - 1, COUNT));

  const visible: { idx: number; offset: number }[] = [];
  for (let off = -3; off <= 3; off++) {
    visible.push({ idx: mod(current + off, COUNT), offset: off });
  }

  const frontH = cardHeights[current];
  const abovePeek = 3 * OFFSET;
  const belowPeek = 3 * OFFSET;

  const spring = { type: "spring" as const, stiffness: 280, damping: 28 };

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <div className="text-center mb-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500 mb-3">
          {SECTION_TITLE}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 whitespace-pre-line">
          {SECTION_HEADLINE}
        </h2>
      </div>

      {/* Hidden measuring area: render all cards invisibly to get natural heights */}
      <div
        aria-hidden
        className="absolute opacity-0 pointer-events-none"
        style={{ width: "min(100% - 3rem, 28rem)" }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={t.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="rounded-2xl p-6 bg-white border border-slate-200"
          >
            <p className="leading-relaxed text-slate-700">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
              <Avatar initials={t.avatar} index={i} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {t.name}
                </p>
                <p className="text-xs text-slate-500">
                  {t.role} @ {t.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 justify-center">
        {/* Stack */}
        <motion.div
          className="relative flex-1 max-w-md"
          animate={{ height: abovePeek + frontH + belowPeek }}
          transition={spring}
        >
          {visible.map(({ idx, offset }) => {
            const t = TESTIMONIALS[idx];
            const isFront = offset === 0;
            const distance = Math.abs(offset);

            const y = abovePeek + offset * OFFSET;
            const scale = 1 - distance * SCALE_STEP;
            const zIndex = 10 - distance;
            const opacity = isFront ? 1 : Math.max(0.3, 1 - distance * 0.2);

            return (
              <motion.div
                key={t.id}
                animate={{
                  y,
                  scale,
                  zIndex,
                  opacity,
                  boxShadow: isFront
                    ? "0 8px 32px -8px rgba(0,0,0,0.15)"
                    : `0 ${Math.max(0, 2 - distance)}px ${Math.max(1, 4 - distance)}px rgba(0,0,0,0.05)`,
                }}
                transition={spring}
                onClick={isFront ? goNext : undefined}
                className={`absolute inset-x-0 origin-top rounded-2xl p-6 bg-white border border-slate-200 ${
                  isFront ? "cursor-pointer" : "pointer-events-none"
                }`}
              >
                <p className="leading-relaxed text-slate-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Avatar initials={t.avatar} index={idx} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                      {t.badge && (
                        <span className="ml-1.5 inline-block text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          {t.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.role} @ {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Arrow buttons */}
        <motion.div
          className="flex flex-col gap-2 shrink-0"
          animate={{ marginTop: abovePeek }}
          transition={spring}
        >
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-400 active:scale-90 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-400 active:scale-90 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </div>

      <div className="flex justify-center gap-1.5 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              current === i ? "w-6 bg-brand-500" : "w-1.5 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
