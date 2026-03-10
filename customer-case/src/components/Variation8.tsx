import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CASE } from "../data";
import { useCountUp } from "../useCountUp";

const ease = [0.19, 1, 0.22, 1] as const;
const IMG =
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop&q=80";

function Stat({ stat, inView }: { stat: (typeof CASE.stats)[number]; inView: boolean }) {
  const count = useCountUp(stat.value, inView, 0.6);
  return (
    <div className="flex-1">
      <p className="text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
        {count}
        <span className="text-slate-300">{stat.suffix}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{stat.headline}</p>
    </div>
  );
}

/**
 * Bento H — Big quote hero. Citation dominante, image petite, stats inline.
 */
export function Variation8() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-20">
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
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Quote — 2/3, big text */}
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.06 }}
          className="lg:col-span-2"
        >
          <p className="font-serif text-3xl leading-snug text-slate-800 italic sm:text-4xl">
            "{CASE.quote}"
          </p>
          <footer className="mt-6">
            <p className="text-sm font-semibold text-slate-900">{CASE.company}</p>
            <p className="text-xs text-slate-400">{CASE.subtitle}</p>
          </footer>
        </motion.blockquote>

        {/* Image — 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease, delay: 0.1 }}
          className="overflow-hidden rounded-2xl"
        >
          <img
            src={IMG}
            alt={CASE.company}
            className="h-full min-h-48 w-full object-cover"
          />
        </motion.div>
      </div>

      {/* Stats bar — dividers, no cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease, delay: 0.18 }}
        className="mt-12 flex flex-col gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:gap-0 sm:divide-x sm:divide-slate-200"
      >
        {CASE.stats.map((stat) => (
          <div key={stat.headline} className="flex-1 sm:px-6 sm:first:pl-0 sm:last:pr-0">
            <Stat stat={stat} inView={inView} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
