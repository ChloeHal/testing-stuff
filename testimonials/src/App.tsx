import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { VariationSelector } from "./components/VariationSelector";
import { Variation5 } from "./components/Variation5";
import { Variation7 } from "./components/Variation7";
import { Variation8 } from "./components/Variation8";
import { Variation9 } from "./components/Variation9";
import { Variation10 } from "./components/Variation10";
import { SkeletonScroll } from "./components/SkeletonScroll";

const VARIATIONS = [
  Variation5,
  Variation7,
  Variation8,
  Variation9,
  Variation10,
];

export default function App() {
  const [active, setActive] = useState(0);
  const Component = VARIATIONS[active];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-50 flex justify-center py-4 overflow-x-auto">
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
          <SkeletonScroll />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
