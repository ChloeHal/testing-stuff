import { motion } from "motion/react";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.5 },
  },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 pt-32 pb-20">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={fadeUp}
          className="mb-4 text-sm font-semibold tracking-wide text-brand-600 uppercase"
        >
          ERP nouvelle génération
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl"
        >
          Simplifiez vos opérations métier
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-500"
        >
          Tableau de bord, facturation, inventaire et CRM — tout réuni dans une
          interface fluide et intuitive.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex justify-center gap-4">
          <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-700 active:scale-[0.97]">
            Essayer gratuitement
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 hover:bg-slate-50">
            Voir la démo
          </button>
        </motion.div>
      </motion.div>

      {/* Mock dashboard preview */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-16 max-w-4xl"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-200/60">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="ml-3 h-5 w-48 rounded bg-slate-100" />
          </div>
          <div className="rounded-lg bg-slate-50 p-6">
            <div className="grid grid-cols-3 gap-4">
              {["Revenus", "Commandes", "Clients"].map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <div className="mt-2 h-5 w-20 rounded bg-slate-100" />
                  <div className="mt-3 h-10 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-40 rounded-lg border border-slate-200 bg-white" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
