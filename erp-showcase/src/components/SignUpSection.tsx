import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";

const DEMO_DATA = {
  name: "Marie Dupont",
  email: "marie@acme.fr",
  company: "Acme Corp",
};

const FIELD_META = [
  { key: "name" as const, label: "Nom complet" },
  { key: "email" as const, label: "Adresse e-mail" },
  { key: "company" as const, label: "Entreprise" },
];

/**
 * Infinite-loop sign-up form demo.
 * Phases: enter → fill fields one-by-one → submit → success → fade → restart
 */
export default function SignUpSection() {
  const [phase, setPhase] = useState(-1); // -1 = not started
  const [fading, setFading] = useState(false);

  // phase 0 : form visible, fields empty
  // phase 1 : name filled
  // phase 2 : email filled
  // phase 3 : company filled
  // phase 4 : submitting
  // phase 5 : success

  const runCycle = useCallback(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        timers.push(setTimeout(() => !cancelled && r(), ms));
      });

    (async () => {
      setPhase(0);
      setFading(false);

      await wait(900); // pause before first fill

      for (let i = 1; i <= 3; i++) {
        if (cancelled) return;
        setPhase(i);
        await wait(550);
      }

      if (cancelled) return;
      setPhase(4); // submitting
      await wait(1200);

      if (cancelled) return;
      setPhase(5); // success
      await wait(2800);

      if (cancelled) return;
      setFading(true);
      await wait(700);

      if (cancelled) return;
      runCycle();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => runCycle(), [runCycle]);

  const isFilled = (index: number) => phase >= index + 1;
  const isSubmitting = phase === 4;
  const isSuccess = phase === 5;

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Prêt à simplifier votre gestion ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-slate-500">
          Rejoignez la liste d'attente et soyez parmi les premiers à essayer
          FlowERP.
        </p>

        {/* Card */}
        <motion.div
          className="mx-auto mt-14 max-w-sm"
          animate={{ opacity: fading ? 0 : 1, scale: fading ? 0.97 : 1 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }}
                  className="p-6"
                >
                  {/* Fields */}
                  <div className="flex flex-col gap-4">
                    {FIELD_META.map((field, i) => (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                          delay: i * 0.08,
                        }}
                      >
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          {field.label}
                        </label>
                        <div
                          className={`relative h-10 rounded-lg border bg-white px-3 transition-colors duration-200 ${
                            isFilled(i)
                              ? "border-brand-300 ring-2 ring-brand-100"
                              : "border-slate-200"
                          } flex items-center`}
                        >
                          <AnimatePresence>
                            {isFilled(i) && (
                              <motion.span
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                                }}
                                className="text-sm text-slate-800"
                              >
                                {DEMO_DATA[field.key]}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {!isFilled(i) && (
                            <span className="text-sm text-slate-300">
                              {field.key === "email"
                                ? "vous@exemple.fr"
                                : field.key === "company"
                                  ? "Nom de votre entreprise"
                                  : "Jean Dupont"}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Button */}
                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                      delay: 0.24,
                    }}
                  >
                    <motion.div
                      className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm ${
                        isSubmitting ? "bg-brand-700" : "bg-brand-600"
                      }`}
                      animate={
                        isSubmitting
                          ? { scale: [0.97, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              className="opacity-25"
                            />
                            <path
                              d="M4 12a8 8 0 018-8"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>Inscription...</span>
                        </motion.div>
                      ) : (
                        "S'inscrire gratuitement"
                      )}
                    </motion.div>
                  </motion.div>

                  <p className="mt-4 text-center text-[11px] text-slate-400">
                    Aucune carte requise. Annulable à tout moment.
                  </p>
                </motion.div>
              ) : (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                  }}
                  className="flex flex-col items-center justify-center p-10"
                >
                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      duration: 0.5,
                      bounce: 0.25,
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100"
                  >
                    <svg
                      className="h-7 w-7 text-emerald-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                          delay: 0.15,
                        }}
                      />
                    </svg>
                  </motion.div>

                  <motion.p
                    className="mt-4 text-base font-semibold text-slate-800"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                      delay: 0.2,
                    }}
                  >
                    Vous êtes inscrit !
                  </motion.p>
                  <motion.p
                    className="mt-1.5 text-center text-sm text-slate-500"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
                      delay: 0.3,
                    }}
                  >
                    On vous envoie un e-mail très vite.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
