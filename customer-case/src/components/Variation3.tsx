import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CASE } from "../data";
import { useCountUp } from "../useCountUp";

const ease = [0.19, 1, 0.22, 1] as const;
const IMG =
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop&q=80";

const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

function Stat({
  stat,
  delay,
  inView,
}: {
  stat: (typeof CASE.stats)[number];
  delay: number;
  inView: boolean;
}) {
  const count = useCountUp(stat.value, inView, 0.6);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, ease, delay }}
      className={card}
    >
      <p className="text-4xl font-bold tracking-tight text-slate-950 tabular-nums">
        {count}
        <span className="text-slate-300">{stat.suffix}</span>
      </p>
      <p className="mt-1.5 text-sm font-medium text-slate-900">
        {stat.headline}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{stat.detail}</p>
    </motion.div>
  );
}

/**
 * Bento C — Image 1/3 + texte 2/3 en haut, stat cards en row dessous
 *
 * ┌────────┬────────────────────┐
 * │        │ label + tagline    │
 * │ image  │ company            │
 * │  1/3   │ quote              │
 * │        │                    │
 * └────────┴────────────────────┘
 * ┌──────┬──────┬───────────────┐
 * │  s1  │  s2  │      s3       │
 * └──────┴──────┴───────────────┘
 */
export function Variation3() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-20">
      {/* Top row — image 1/3 + text 2/3 */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Image — 1 col = 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease, delay: 0.04 }}
          className="overflow-hidden rounded-2xl"
        >
          <img
            src={IMG}
            alt={CASE.company}
            className="h-full min-h-56 w-full object-cover"
          />
        </motion.div>

        {/* Text — 2 cols = 2/3 */}
        <div className="flex flex-col justify-center lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, ease }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {CASE.label}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {CASE.headline1}
              <br />
              {CASE.headline2}
            </h2>
            <p className="mt-2 text-lg font-medium text-slate-700">
              {CASE.company}
            </p>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.08 }}
            className="mt-6"
          >
            <p className="font-serif text-lg leading-relaxed text-slate-600 italic">
              "{CASE.quote}"
            </p>
            <p className="mt-3 text-xs text-slate-400">{CASE.subtitle}</p>
          </motion.blockquote>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CASE.stats.map((stat, i) => (
          <Stat
            key={stat.headline}
            stat={stat}
            delay={0.16 + i * 0.06}
            inView={inView}
          />
        ))}
      </div>
    </section>
  );
}
