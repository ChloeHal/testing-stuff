import { motion, useInView } from "motion/react";
import { useRef } from "react";

const features = [
  {
    icon: "📊",
    title: "Tableau de bord",
    description:
      "Vue unifiée de vos KPIs avec graphiques interactifs et alertes intelligentes.",
  },
  {
    icon: "🧾",
    title: "Facturation",
    description:
      "Créez, envoyez et suivez vos factures avec relances automatiques.",
  },
  {
    icon: "📦",
    title: "Inventaire",
    description:
      "Gestion des stocks en temps réel avec alertes de seuil et prévisions.",
  },
  {
    icon: "👥",
    title: "CRM",
    description:
      "Pipeline commercial, fiches contacts et historique d'interactions.",
  },
  {
    icon: "📈",
    title: "Analytique",
    description:
      "Rapports personnalisés, exports et intégration comptable.",
  },
  {
    icon: "⚡",
    title: "Automatisations",
    description:
      "Workflows conditionnels pour éliminer les tâches répétitives.",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", duration: 0.45, bounce: 0 },
  },
};

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          Conçu pour les équipes modernes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number], delay: 0.08 }}
          className="mx-auto mt-3 max-w-lg text-center text-slate-500"
        >
          Tous les modules dont vous avez besoin, sans la complexité.
        </motion.p>

        <motion.div
          ref={ref}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={card}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
