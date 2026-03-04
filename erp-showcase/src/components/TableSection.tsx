import { motion, useInView } from "motion/react";
import { useRef } from "react";

const orders = [
  { id: "INV-2401", client: "Acme Corp", amount: "€4,200", status: "Payée", date: "28 fév" },
  { id: "INV-2400", client: "Globex SA", amount: "€1,850", status: "En attente", date: "27 fév" },
  { id: "INV-2399", client: "Initech", amount: "€7,300", status: "Payée", date: "26 fév" },
  { id: "INV-2398", client: "Umbrella Ltd", amount: "€3,120", status: "En retard", date: "24 fév" },
  { id: "INV-2397", client: "Stark Ind.", amount: "€9,500", status: "Payée", date: "23 fév" },
  { id: "INV-2396", client: "Wayne Ent.", amount: "€2,640", status: "Payée", date: "22 fév" },
];

const statusColors: Record<string, string> = {
  "Payée": "bg-emerald-50 text-emerald-700",
  "En attente": "bg-amber-50 text-amber-700",
  "En retard": "bg-red-50 text-red-700",
};

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const row = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
};

export default function TableSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          Suivez chaque transaction
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1], delay: 0.08 }}
          className="mx-auto mt-3 max-w-lg text-center text-slate-500"
        >
          Historique complet, filtres avancés et export en un clic.
        </motion.p>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
          className="mt-12 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 font-semibold text-slate-500">Facture</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Client</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Montant</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Statut</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Date</th>
              </tr>
            </thead>
            <motion.tbody
              variants={container}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {orders.map((o) => (
                <motion.tr
                  key={o.id}
                  variants={row}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900">{o.id}</td>
                  <td className="px-5 py-3.5 text-slate-600">{o.client}</td>
                  <td className="px-5 py-3.5 font-medium tabular-nums">{o.amount}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{o.date}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
