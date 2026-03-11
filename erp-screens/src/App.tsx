import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScreenOverview } from "./screens/ScreenOverview";
import { ScreenDevis } from "./screens/ScreenDevis";
import { ScreenProduction } from "./screens/ScreenProduction";
import { ScreenStaff } from "./screens/ScreenStaff";
import { ScreenMateriel } from "./screens/ScreenMateriel";
import { ScreenLogistique } from "./screens/ScreenLogistique";

const TABS = [
  { id: "overview", label: "Vue d'ensemble", component: ScreenOverview },
  { id: "devis", label: "Devis intelligents", component: ScreenDevis },
  { id: "production", label: "Production cuisine", component: ScreenProduction },
  { id: "staff", label: "Planning staff", component: ScreenStaff },
  { id: "materiel", label: "Gestion matériel", component: ScreenMateriel },
  { id: "logistique", label: "Logistique événement", component: ScreenLogistique },
];

export default function App() {
  const [active, setActive] = useState(0);
  const Component = TABS[active].component;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">
            enobase
          </h1>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActive(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active === i
                    ? "bg-brand-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Component />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
