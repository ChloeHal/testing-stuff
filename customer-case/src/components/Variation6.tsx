import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CASE } from "../data";
import { useCountUp } from "../useCountUp";

const ease = [0.19, 1, 0.22, 1] as const;
const IMG =
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop&q=80";

function Stat({
  stat,
  inView,
}: {
  stat: (typeof CASE.stats)[number];
  inView: boolean;
}) {
  const count = useCountUp(stat.value, inView, 0.6);
  return (
    <div className="flex-1 py-5">
      <p className="text-4xl font-bold tracking-tight text-slate-950 tabular-nums">
        {count}
        <span className="text-slate-300">{stat.suffix}</span>
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-900">
        {stat.headline}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{stat.detail}</p>
    </div>
  );
}

/**
 * Bento F — Toute la section dans une seule card.
 * Image 1/3 + texte 2/3 en haut, divider, stats en row séparés par des dividers.
 *
 * ┌─────────────────────────────────────┐
 * │ ┌────────┬────────────────────┐     │
 * │ │        │ label + company    │     │
 * │ │ image  │ tagline            │     │
 * │ │  1/3   │ quote              │     │
 * │ │        │                    │     │
 * │ └────────┴────────────────────┘     │
 * │─────────────────────────────────────│
 * │   s1     │     s2     │     s3      │
 * └─────────────────────────────────────┘
 */
export function Variation6() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Top — image 1/3 + text 2/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Image */}
          <div className="overflow-hidden">
            <img
              src={IMG}
              alt={CASE.company}
              className="h-full min-h-56 w-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center px-8 py-8 lg:col-span-2 lg:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {CASE.label}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {CASE.headline1} {CASE.headline2}
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-700">
              {CASE.company}
            </p>

            <blockquote className="mt-6">
              <p className="font-serif text-lg leading-relaxed text-slate-600 italic">
                "{CASE.quote}"
              </p>
              <p className="mt-3 text-xs text-slate-400">{CASE.subtitle}</p>
            </blockquote>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200" />

        {/* Stats row — separated by dividers */}
        <div className="flex flex-col divide-y divide-slate-200 sm:flex-row sm:divide-x sm:divide-y-0">
          {CASE.stats.map((stat) => (
            <div key={stat.headline} className="flex-1 px-8">
              <Stat stat={stat} inView={inView} />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
