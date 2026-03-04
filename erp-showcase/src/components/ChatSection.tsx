import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";

type Message = { role: "user" | "ai"; text: string };

const CONVERSATION: Message[] = [
  { role: "user", text: "Quel est le CA de ce mois ?" },
  {
    role: "ai",
    text: "Le CA de février est de €284 500, en hausse de 12 % par rapport à janvier. Les ventes en ligne représentent 63 % du total.",
  },
  { role: "user", text: "Quels clients ont des factures en retard ?" },
  {
    role: "ai",
    text: "3 factures en retard : Globex SA (€1 850, 14j), Umbrella Ltd (€3 120, 7j) et Initech (€960, 3j). Voulez-vous envoyer une relance ?",
  },
];

/** Delays in ms for each step of the loop */
const INITIAL_PAUSE = 800;
const TYPING_DURATION = 1400;
const BETWEEN_MESSAGES = 600;
const END_PAUSE = 2500;
const RESET_FADE = 600;

export default function ChatSection() {
  const [visible, setVisible] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [fading, setFading] = useState(false);

  const runCycle = useCallback(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(() => !cancelled && resolve(), ms));
      });

    (async () => {
      setVisible([]);
      setTyping(false);
      setFading(false);
      await wait(INITIAL_PAUSE);

      for (const msg of CONVERSATION) {
        if (cancelled) return;

        if (msg.role === "ai") {
          setTyping(true);
          await wait(TYPING_DURATION);
          if (cancelled) return;
          setTyping(false);
        }

        setVisible((prev) => [...prev, msg]);
        await wait(msg.role === "user" ? BETWEEN_MESSAGES : BETWEEN_MESSAGES + 200);
        if (cancelled) return;
      }

      await wait(END_PAUSE);
      if (cancelled) return;
      setFading(true);
      await wait(RESET_FADE);
      if (cancelled) return;

      runCycle();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    return runCycle();
  }, [runCycle]);

  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Un assistant IA intégré
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-slate-500">
          Interrogez vos données en langage naturel, directement depuis l'ERP.
        </p>

        <div className="mx-auto mt-14 max-w-md">
          {/* Chat window */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                IA
              </span>
              <span className="text-sm font-semibold text-slate-700">
                FlowERP Assistant
              </span>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
            </div>

            {/* Messages area */}
            <motion.div
              className="flex h-80 flex-col gap-3 overflow-hidden p-4"
              animate={{ opacity: fading ? 0 : 1 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <AnimatePresence mode="popLayout">
                {visible.map((msg, i) => (
                  <motion.div
                    key={`${i}-${msg.text.slice(0, 10)}`}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md bg-brand-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
