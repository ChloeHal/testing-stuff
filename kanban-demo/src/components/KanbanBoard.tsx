import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

/* ── Types ── */

type Priority = "haute" | "moyenne" | "basse";

type Deal = {
  id: string;
  company: string;
  amount: string;
  contact: string;
  hue: number;
  tag: string;
  priority: Priority;
  probability: number;       // 0-100
  nextAction: string;
  deadline: string;
  assignee: string;          // initials
  assigneeHue: number;
  tags: string[];
};

type Column = {
  id: string;
  label: string;
  color: string;
};

type DealOverrides = Record<string, Partial<Pick<Deal, "amount" | "probability">>>;

/* ── Data ── */

const COLUMNS: Column[] = [
  { id: "prospect", label: "Prospect", color: "bg-slate-400" },
  { id: "qualif", label: "Qualification", color: "bg-amber-400" },
  { id: "proposal", label: "Proposition", color: "bg-brand-400" },
  { id: "negoc", label: "Negociation", color: "bg-violet-400" },
  { id: "won", label: "Gagne", color: "bg-emerald-400" },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  haute: "bg-rose-50 text-rose-600",
  moyenne: "bg-amber-50 text-amber-600",
  basse: "bg-slate-100 text-slate-500",
};

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1", company: "Globex SA", amount: "24 500 €", contact: "ML", hue: 210,
    tag: "SaaS", priority: "haute", probability: 40, nextAction: "Appel decouverte",
    deadline: "12 Mar", assignee: "SL", assigneeHue: 180, tags: ["SaaS", "PME"],
  },
  {
    id: "d2", company: "Initech", amount: "18 200 €", contact: "PG", hue: 150,
    tag: "Licence", priority: "basse", probability: 25, nextAction: "Envoyer brochure",
    deadline: "18 Mar", assignee: "KR", assigneeHue: 300, tags: ["Licence"],
  },
  {
    id: "d3", company: "Umbrella Ltd", amount: "42 000 €", contact: "AW", hue: 340,
    tag: "Enterprise", priority: "haute", probability: 60, nextAction: "Demo technique",
    deadline: "8 Mar", assignee: "SL", assigneeHue: 180, tags: ["Enterprise", "Q1"],
  },
  {
    id: "d4", company: "Acme Corp", amount: "9 800 €", contact: "JD", hue: 30,
    tag: "PME", priority: "moyenne", probability: 35, nextAction: "Relance email",
    deadline: "20 Mar", assignee: "MF", assigneeHue: 60, tags: ["PME"],
  },
  {
    id: "d5", company: "Stark Ind.", amount: "67 000 €", contact: "TS", hue: 0,
    tag: "Enterprise", priority: "haute", probability: 75, nextAction: "Nego tarifaire",
    deadline: "5 Mar", assignee: "KR", assigneeHue: 300, tags: ["Enterprise", "Urgente"],
  },
  {
    id: "d6", company: "Wayne Ent.", amount: "31 400 €", contact: "BW", hue: 260,
    tag: "SaaS", priority: "moyenne", probability: 80, nextAction: "Signature contrat",
    deadline: "3 Mar", assignee: "SL", assigneeHue: 180, tags: ["SaaS", "Renouvellement"],
  },
];

type BoardState = Record<string, string>;

const INITIAL_BOARD: BoardState = {
  d1: "prospect",
  d2: "prospect",
  d3: "qualif",
  d4: "qualif",
  d5: "proposal",
  d6: "negoc",
};

/* ── Scripted edits ── */

type ScriptStep = {
  dealId: string;
  newAmount: string;
  newColumn: string;
  newProbability: number;
};

const SCRIPT: ScriptStep[] = [
  { dealId: "d1", newAmount: "32 000 €", newColumn: "qualif", newProbability: 55 },
  { dealId: "d3", newAmount: "45 500 €", newColumn: "proposal", newProbability: 70 },
  { dealId: "d5", newAmount: "72 000 €", newColumn: "negoc", newProbability: 85 },
  { dealId: "d6", newAmount: "31 400 €", newColumn: "won", newProbability: 100 },
];

/* ── Timing ── */

const INITIAL_PAUSE = 1000;
const HIGHLIGHT_PAUSE = 500;
const PRESS_PAUSE = 150;
const MODAL_OPEN_PAUSE = 400;
const FOCUS_PAUSE = 300;
const TYPE_CHAR_MS = 60;
const AFTER_TYPE_PAUSE = 400;
const DROPDOWN_OPEN_PAUSE = 300;
const DROPDOWN_SELECT_PAUSE = 500;
const DROPDOWN_CLOSE_PAUSE = 200;
const SAVE_PRESS_PAUSE = 150;
const AFTER_SAVE_PAUSE = 300;
const MOVE_SETTLE = 700;
const TOAST_PAUSE = 1800;
const BETWEEN_STEPS = 1000;
const END_PAUSE = 3000;
const RESET_FADE = 500;

const ease = [0.19, 1, 0.22, 1] as const;

/* ── Modal state ── */

type ModalState = {
  deal: Deal;
  currentColumn: string;
  amountTyped: string;
  focusedField: "amount" | "status" | null;
  dropdownOpen: boolean;
  selectedColumn: string;
  savePressed: boolean;
} | null;

/* ── Component ── */

export default function KanbanBoard() {
  const [board, setBoard] = useState<BoardState>({ ...INITIAL_BOARD });
  const [overrides, setOverrides] = useState<DealOverrides>({});
  const [highlightedDeal, setHighlightedDeal] = useState<string | null>(null);
  const [pressedDeal, setPressedDeal] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  const runCycle = useCallback(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(() => !cancelled && resolve(), ms));
      });

    (async () => {
      setBoard({ ...INITIAL_BOARD });
      setOverrides({});
      setHighlightedDeal(null);
      setPressedDeal(null);
      setModal(null);
      setToast(null);
      setFading(false);

      await wait(INITIAL_PAUSE);
      if (cancelled) return;

      for (const step of SCRIPT) {
        if (cancelled) return;
        const deal = INITIAL_DEALS.find((d) => d.id === step.dealId)!;
        const currentCol = board[step.dealId] ?? INITIAL_BOARD[step.dealId];

        setHighlightedDeal(step.dealId);
        await wait(HIGHLIGHT_PAUSE);
        if (cancelled) return;

        setPressedDeal(step.dealId);
        await wait(PRESS_PAUSE);
        if (cancelled) return;
        setPressedDeal(null);

        setHighlightedDeal(null);
        setModal({
          deal,
          currentColumn: currentCol,
          amountTyped: overrides[deal.id]?.amount ?? deal.amount,
          focusedField: null,
          dropdownOpen: false,
          selectedColumn: currentCol,
          savePressed: false,
        });
        await wait(MODAL_OPEN_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, focusedField: "amount" }));
        await wait(FOCUS_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, amountTyped: "" }));
        await wait(100);
        if (cancelled) return;

        for (let i = 0; i < step.newAmount.length; i++) {
          const partial = step.newAmount.slice(0, i + 1);
          setModal((m) => m && ({ ...m, amountTyped: partial }));
          await wait(TYPE_CHAR_MS);
          if (cancelled) return;
        }
        await wait(AFTER_TYPE_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, focusedField: "status" }));
        await wait(FOCUS_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, dropdownOpen: true }));
        await wait(DROPDOWN_OPEN_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, selectedColumn: step.newColumn }));
        await wait(DROPDOWN_SELECT_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, dropdownOpen: false }));
        await wait(DROPDOWN_CLOSE_PAUSE);
        if (cancelled) return;

        setModal((m) => m && ({ ...m, focusedField: null, savePressed: true }));
        await wait(SAVE_PRESS_PAUSE);
        if (cancelled) return;

        setModal(null);
        await wait(AFTER_SAVE_PAUSE);
        if (cancelled) return;

        setBoard((prev) => ({ ...prev, [step.dealId]: step.newColumn }));
        setOverrides((prev) => ({
          ...prev,
          [step.dealId]: { amount: step.newAmount, probability: step.newProbability },
        }));
        await wait(MOVE_SETTLE);
        if (cancelled) return;

        const targetLabel = COLUMNS.find((c) => c.id === step.newColumn)!.label;
        setToast(`${deal.company} → ${targetLabel}`);
        await wait(TOAST_PAUSE);
        if (cancelled) return;
        setToast(null);

        await wait(BETWEEN_STEPS);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return runCycle();
  }, [runCycle]);

  const getDeals = () =>
    INITIAL_DEALS.map((d) => ({
      ...d,
      amount: overrides[d.id]?.amount ?? d.amount,
      probability: overrides[d.id]?.probability ?? d.probability,
    }));

  const columnDeals = (colId: string) =>
    getDeals().filter((d) => board[d.id] === colId);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Pipeline commercial
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Suivi des opportunites en temps reel
          </p>
        </div>

        <Card className="relative overflow-hidden border-slate-200 bg-white p-4">
          <motion.div
            className="flex gap-3 overflow-x-auto"
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.45, ease }}
          >
            <LayoutGroup>
              {COLUMNS.map((col) => {
                const deals = columnDeals(col.id);
                const total = deals.reduce((s, d) => {
                  const num = parseInt(d.amount.replace(/\D/g, ""), 10) || 0;
                  return s + num;
                }, 0);
                return (
                  <div key={col.id} className="flex w-52 flex-shrink-0 flex-col">
                    <div className="mb-2.5 flex items-center gap-2 px-1">
                      <span className={`h-2 w-2 rounded-full ${col.color}`} />
                      <span className="text-xs font-semibold text-slate-950">
                        {col.label}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={deals.length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                        >
                          <Badge className="bg-slate-100 text-slate-500">
                            {deals.length}
                          </Badge>
                        </motion.span>
                      </AnimatePresence>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {total.toLocaleString("fr-FR")} €
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 rounded-xl bg-slate-50/50 p-2 min-h-[280px]">
                      <AnimatePresence mode="popLayout">
                        {deals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            isHighlighted={highlightedDeal === deal.id}
                            isPressed={pressedDeal === deal.id}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </LayoutGroup>
          </motion.div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-lg"
              >
                <span className="mr-1.5">✓</span>
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <DealModal modal={modal} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Deal Modal ── */

function DealModal({ modal }: { modal: NonNullable<ModalState> }) {
  const deal = modal.deal;
  const selectedCol = COLUMNS.find((c) => c.id === modal.selectedColumn);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: `hsl(${deal.hue}, 55%, 50%)` }}
        >
          {deal.contact}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-950">{deal.company}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {deal.tags.map((t) => (
              <Badge key={t} className="bg-slate-100 text-slate-500">{t}</Badge>
            ))}
          </div>
        </div>
        <Badge className={PRIORITY_STYLES[deal.priority]}>
          {deal.priority}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Amount + Probability row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Montant
            </label>
            <div
              className={`flex h-9 items-center rounded-lg border px-3 text-sm transition-all duration-200 ${
                modal.focusedField === "amount"
                  ? "border-slate-900 ring-2 ring-slate-200"
                  : "border-slate-200"
              }`}
            >
              <span className="text-slate-950">{modal.amountTyped}</span>
              {modal.focusedField === "amount" && (
                <motion.span
                  className="ml-px inline-block h-4 w-[1.5px] bg-slate-900"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                />
              )}
            </div>
          </div>

          {/* Probability (read-only display) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Probabilite
            </label>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm">
              <span className="text-slate-950 font-medium">{deal.probability}%</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-slate-900"
                  initial={{ width: 0 }}
                  animate={{ width: `${deal.probability}%` }}
                  transition={{ duration: 0.8, ease }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Statut
          </label>
          <div className="relative">
            <div
              className={`flex h-9 items-center justify-between rounded-lg border px-3 text-sm transition-all duration-200 ${
                modal.focusedField === "status"
                  ? "border-slate-900 ring-2 ring-slate-200"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${selectedCol?.color ?? "bg-slate-400"}`} />
                <span className="text-slate-950">{selectedCol?.label ?? ""}</span>
              </div>
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" stroke="currentColor" />
              </svg>
            </div>

            <AnimatePresence>
              {modal.dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -4 }}
                  transition={{ duration: 0.15, ease }}
                  className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                  style={{ transformOrigin: "top center" }}
                >
                  {COLUMNS.map((col) => (
                    <div
                      key={col.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${
                        col.id === modal.selectedColumn
                          ? "bg-slate-50 font-medium text-slate-950"
                          : "text-slate-600"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${col.color}`} />
                      {col.label}
                      {col.id === modal.selectedColumn && (
                        <svg className="ml-auto h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" />
                        </svg>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Next action + deadline row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Prochaine action
            </label>
            <div className="flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-950">
              {deal.nextAction}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Echeance
            </label>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-950">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" />
              </svg>
              {deal.deadline}
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Commercial assigne
          </label>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm">
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: `hsl(${deal.assigneeHue}, 55%, 50%)` }}
            >
              {deal.assignee}
            </span>
            <span className="text-slate-950">{deal.assignee}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 p-5">
        <motion.button
          animate={{ scale: modal.savePressed ? 0.97 : 1 }}
          transition={{ duration: 0.1 }}
          className="flex h-9 w-full items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
        >
          Enregistrer
        </motion.button>
      </div>
    </div>
  );
}

/* ── Deal Card ── */

function DealCard({
  deal,
  isHighlighted,
  isPressed,
}: {
  deal: Deal & { probability: number };
  isHighlighted: boolean;
  isPressed: boolean;
}) {
  return (
    <motion.div
      layoutId={deal.id}
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isPressed ? 0.97 : 1,
        boxShadow: isHighlighted
          ? "0 2px 8px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
      transition={{
        layout: { type: "spring", duration: 0.5, bounce: 0.15 },
        scale: { duration: 0.15, ease },
        boxShadow: { duration: 0.2 },
      }}
      className={`rounded-lg border bg-white p-3 transition-colors duration-200 ${
        isHighlighted
          ? "border-slate-900 ring-2 ring-slate-200"
          : "border-slate-200"
      }`}
    >
      {/* Row 1: Avatar + Company + Priority */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: `hsl(${deal.hue}, 55%, 50%)` }}
          >
            {deal.contact}
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-950 leading-tight">
              {deal.company}
            </p>
            <p className="text-[10px] text-slate-400">{deal.amount}</p>
          </div>
        </div>
        <Badge className={`${PRIORITY_STYLES[deal.priority]} flex-shrink-0`}>
          {deal.priority === "haute" ? "↑" : deal.priority === "moyenne" ? "→" : "↓"}
        </Badge>
      </div>

      {/* Row 2: Probability bar */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-slate-800"
            initial={{ width: 0 }}
            animate={{ width: `${deal.probability}%` }}
            transition={{ duration: 0.8, ease }}
          />
        </div>
        <span className="text-[10px] font-medium text-slate-500 w-7 text-right">
          {deal.probability}%
        </span>
      </div>

      {/* Row 3: Next action */}
      <div className="mt-2 flex items-center gap-1.5">
        <svg className="h-3 w-3 flex-shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" stroke="currentColor" />
          <path d="M12 6v6l4 2" stroke="currentColor" />
        </svg>
        <span className="text-[10px] text-slate-500 truncate">{deal.nextAction}</span>
      </div>

      {/* Row 4: Deadline + Assignee */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{deal.deadline}</span>
        <div className="flex items-center gap-1">
          {deal.tags.slice(0, 2).map((t) => (
            <Badge key={t} className="bg-slate-100 text-slate-400 text-[9px] px-1.5 py-0">
              {t}
            </Badge>
          ))}
          <span
            className="flex h-4.5 w-4.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: `hsl(${deal.assigneeHue}, 55%, 50%)` }}
          >
            {deal.assignee}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
