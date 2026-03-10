import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { VariationSelector } from "./components/VariationSelector";
import { Variation1 } from "./components/Variation1";
import { Variation2 } from "./components/Variation2";
import { Variation3 } from "./components/Variation3";
import { Variation4 } from "./components/Variation4";
import { Variation5 } from "./components/Variation5";
import { Variation6 } from "./components/Variation6";
import { Variation7 } from "./components/Variation7";
import { Variation8 } from "./components/Variation8";
import { Variation9 } from "./components/Variation9";
import { Variation10 } from "./components/Variation10";

const VARIATIONS = [Variation1, Variation2, Variation3, Variation4, Variation5, Variation6, Variation7, Variation8, Variation9, Variation10];

export default function App() {
  const [active, setActive] = useState(0);
  const Component = VARIATIONS[active];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 flex justify-center py-4">
        <VariationSelector active={active} onChange={setActive} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
