import { motion, AnimatePresence } from "motion/react";

const ease = [0.19, 1, 0.22, 1] as const;

export interface StepState {
  label: string;
  completed: boolean;
}

export default function ThinkingSteps({ steps }: { steps: StepState[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease }}
      style={{ transformOrigin: "bottom left" }}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm space-y-2.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease, delay: i * 0.05 }}
            className="flex items-center gap-2.5 text-[13px]"
          >
            <AnimatePresence mode="wait">
              {step.completed ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                  className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-100"
                >
                  <svg
                    className="h-3 w-3 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, ease }}
                    />
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.15 } }}
                  className="flex h-4.5 w-4.5 items-center justify-center"
                >
                  <motion.svg
                    className="h-3.5 w-3.5 text-brand-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-20"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>
            <span
              className={
                step.completed ? "text-slate-400" : "text-slate-600"
              }
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
