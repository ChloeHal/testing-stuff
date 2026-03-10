import { useEffect, useRef, useState } from "react";
import { TESTIMONIALS, SECTION_TITLE, SECTION_HEADLINE } from "../data";
import { Avatar } from "./Avatar";

/** Vertical Ticker — défilement vertical automatique (PAS de marquee horizontal) */
export function Variation8() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.5;

    function tick() {
      if (!isPaused && el) {
        el.scrollTop += speed;
        if (el.scrollTop >= el.scrollHeight / 2) {
          el.scrollTop = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPaused]);

  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-500 mb-3">
        {SECTION_TITLE}
      </p>
      <h2 className="text-center text-3xl font-bold text-slate-900 mb-2 whitespace-pre-line">
        {SECTION_HEADLINE}
      </h2>
      <p className="text-center text-sm text-slate-500 mb-8">
        Hover to pause
      </p>

      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="h-[500px] overflow-hidden rounded-2xl"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="space-y-4 py-4">
          {items.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="rounded-xl bg-white p-4 shadow-sm border border-slate-100"
            >
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Avatar initials={t.avatar} index={t.id - 1} size="sm" />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
