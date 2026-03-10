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
    <div>
      <p className="text-6xl font-bold tracking-tighter text-slate-950 tabular-nums sm:text-7xl">
        {count}
        <span className="text-slate-300">{stat.suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{stat.headline}</p>
      <p className="mt-0.5 text-xs text-slate-400">{stat.detail}</p>
    </div>
  );
}

/**
 * Bento J — Giant numbers left, image+quote right. Numbers dominate.
 */
export function Variation10() {
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

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left — giant stat numbers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: 0.06 }}
          className="flex flex-col gap-10"
        >
          {CASE.stats.map((stat) => (
            <Stat key={stat.headline} stat={stat} inView={inView} />
          ))}
        </motion.div>

        {/* Right — image + quote */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease, delay: 0.1 }}
            className="overflow-hidden rounded-2xl"
          >
            <img
              src={IMG}
              alt={CASE.company}
              className="h-64 w-full object-cover"
            />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.16 }}
            className="mt-8"
          >
            <p className="font-serif text-lg leading-relaxed text-slate-600 italic">
              "{CASE.quote}"
            </p>
            <footer className="mt-4">
              <p className="text-sm font-semibold text-slate-900">
                {CASE.company}
              </p>
              <p className="text-xs text-slate-400">{CASE.subtitle}</p>
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
