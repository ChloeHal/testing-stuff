import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { label: "Chiffre d'affaires", value: "€2.4M", delta: "+12.5%", up: true },
  { label: "Commandes", value: "1,842", delta: "+8.2%", up: true },
  { label: "Clients actifs", value: "364", delta: "+23", up: true },
  { label: "Taux de conversion", value: "3.2%", delta: "-0.4%", up: false },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", duration: 0.5, bounce: 0.15 },
  },
};

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          Tout en un coup d'œil
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: 0.5,
            ease: [0.19, 1, 0.22, 1],
            delay: 0.08,
          }}
          className="mx-auto mt-3 max-w-lg text-center text-slate-500"
        >
          Les indicateurs clés de votre activité, actualisés en temps réel.
        </motion.p>

        <motion.div
          ref={ref}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={card}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-400">{s.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">
                {s.value}
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${s.up ? "text-emerald-600" : "text-red-500"}`}
              >
                {s.delta}
              </p>
              {/* Mini sparkline placeholder */}
              <div className="mt-3 flex items-end gap-[3px]">
                {[35, 50, 40, 65, 55, 70, 60, 80, 72, 90].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full ${s.up ? "bg-emerald-200" : "bg-red-200"}`}
                    style={{ height: `${h * 0.28}px` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
