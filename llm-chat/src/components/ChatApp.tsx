import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/card";
import ChatBubble from "./ChatBubble";
import MarkdownText from "./MarkdownText";
import ThinkingSteps, { type StepState } from "./ThinkingSteps";
import QuickReplies from "./QuickReplies";

/* ── Types ── */

type ThinkingStep = { label: string; durationMs: number };
type QuickReply = { label: string; value: string };

type ScriptedMessage = {
  role: "user" | "ai";
  text: string;
  thinkingSteps?: ThinkingStep[];
  quickReplies?: QuickReply[];
};

/* ── Scripted conversation (plays automatically in a loop) ── */

const SCRIPT: ScriptedMessage[] = [
  {
    role: "ai",
    text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
    quickReplies: [
      { label: "Analyse des ventes", value: "analyse-ventes" },
      { label: "Resume du trimestre", value: "resume-trimestre" },
      { label: "Previsions 2026", value: "previsions" },
    ],
  },
  {
    role: "user",
    text: "Peux-tu analyser les ventes du mois ?",
  },
  {
    role: "ai",
    text: "**Rapport de ventes — Fevrier 2026**\n\nVoici les points cles de ce mois :\n\n- **Chiffre d'affaires** : 142 500 € (+12% vs janvier)\n- **Nombre de commandes** : 1 284 commandes traitees\n- **Panier moyen** : 111 € (stable)\n- **Meilleure categorie** : Logiciels SaaS (`+23%`)\n\nLa croissance est principalement portee par l'acquisition de nouveaux clients B2B dans le segment PME.",
    thinkingSteps: [
      { label: "Connexion a la base de donnees...", durationMs: 800 },
      { label: "Analyse des transactions...", durationMs: 1200 },
      { label: "Generation du rapport...", durationMs: 1000 },
    ],
    quickReplies: [
      { label: "Plus de details", value: "details-ventes" },
      { label: "Comparer avec Q4", value: "compare-q4" },
    ],
  },
  {
    role: "user",
    text: "Quelles sont les previsions pour 2026 ?",
  },
  {
    role: "ai",
    text: "**Previsions annuelles 2026**\n\nSur la base des tendances actuelles :\n\n- **CA previsionnel** : 1.8M € (+22% vs 2025)\n- **Objectif clients** : 350 nouveaux comptes\n- **Marge brute cible** : 68%\n\nLes principaux leviers identifies :\n- Expansion sur le marche DACH (`Allemagne, Autriche, Suisse`)\n- Lancement de l'offre **Enterprise** au S2\n- Partenariats strategiques avec 3 integrateurs",
    thinkingSteps: [
      { label: "Analyse des tendances historiques...", durationMs: 1000 },
      { label: "Modelisation predictive...", durationMs: 1400 },
      { label: "Compilation des previsions...", durationMs: 900 },
    ],
    quickReplies: [
      { label: "Risques identifies", value: "risques" },
      { label: "Plan d'action", value: "plan-action" },
    ],
  },
];

/* ── Timing ── */

const INITIAL_PAUSE = 600;
const USER_MSG_PAUSE = 800;
const AFTER_AI_PAUSE = 2400;
const AFTER_STEPS_PAUSE = 400;
const END_PAUSE = 3000;
const RESET_FADE = 500;

/* ── Easing ── */

const ease = [0.19, 1, 0.22, 1] as const;

/* ── Component ── */

type VisibleMsg = {
  id: string;
  role: "user" | "ai";
  text: string;
  quickReplies?: QuickReply[];
};

let counter = 0;

export default function ChatApp() {
  const [visible, setVisible] = useState<VisibleMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [activeSteps, setActiveSteps] = useState<StepState[]>([]);
  const [activeReplies, setActiveReplies] = useState<QuickReply[] | undefined>();
  const [fading, setFading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom on every state change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible, thinking, activeSteps, activeReplies]);

  const runCycle = useCallback(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(() => !cancelled && resolve(), ms));
      });

    (async () => {
      /* Reset */
      counter = 0;
      setVisible([]);
      setThinking(false);
      setActiveSteps([]);
      setActiveReplies(undefined);
      setFading(false);

      await wait(INITIAL_PAUSE);
      if (cancelled) return;

      for (const msg of SCRIPT) {
        if (cancelled) return;

        /* AI thinking phase */
        if (msg.role === "ai" && msg.thinkingSteps) {
          setActiveReplies(undefined);
          setThinking(true);
          setActiveSteps(
            msg.thinkingSteps.map((s) => ({ label: s.label, completed: false }))
          );

          for (let i = 0; i < msg.thinkingSteps.length; i++) {
            await wait(msg.thinkingSteps[i].durationMs);
            if (cancelled) return;
            setActiveSteps((prev) =>
              prev.map((s, idx) =>
                idx === i ? { ...s, completed: true } : s
              )
            );
          }

          await wait(AFTER_STEPS_PAUSE);
          if (cancelled) return;
          setThinking(false);
          setActiveSteps([]);
        }

        /* Show message */
        const id = `msg-${++counter}`;
        setVisible((prev) => [
          ...prev,
          { id, role: msg.role, text: msg.text, quickReplies: msg.quickReplies },
        ]);

        /* Show quick replies */
        if (msg.role === "ai" && msg.quickReplies) {
          setActiveReplies(msg.quickReplies);
        }

        /* Pause before next */
        const pause = msg.role === "user" ? USER_MSG_PAUSE : AFTER_AI_PAUSE;
        await wait(pause);
        if (cancelled) return;
      }

      /* End pause then fade and restart */
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
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="flex h-[640px] w-full max-w-md flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
            <svg
              className="h-4 w-4 text-brand-600"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Assistant IA
            </p>
            <p className="text-[11px] text-slate-400">En ligne</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
        </div>

        {/* Messages */}
        <motion.div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          animate={{ opacity: fading ? 0 : 1 }}
          transition={{ duration: 0.45, ease }}
        >
          <AnimatePresence mode="popLayout">
            {visible.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role}>
                {msg.role === "ai" ? (
                  <MarkdownText text={msg.text} />
                ) : (
                  msg.text
                )}
              </ChatBubble>
            ))}

            {thinking && activeSteps.length > 0 && (
              <ThinkingSteps key="thinking" steps={activeSteps} />
            )}
          </AnimatePresence>

          {/* Quick replies (decorative, auto-playing) */}
          <AnimatePresence>
            {activeReplies && !thinking && (
              <motion.div
                key="replies"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <QuickReplies
                  replies={activeReplies}
                  onSelect={() => {}}
                  disabled
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </motion.div>

        {/* Fake input bar (decorative) */}
        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-300">
            Ecrivez un message...
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/30 text-white">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}
