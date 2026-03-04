import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.19, 1, 0.22, 1] as const;

/* ═══════════════════════════════════════════════
   Section wrapper: component + annotation
   ═══════════════════════════════════════════════ */

function Section({
  title,
  animation,
  reason,
  children,
}: {
  title: string;
  animation: string;
  reason: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-5 flex items-center justify-center min-h-[140px] bg-slate-50/50">
        {children}
      </div>
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold text-slate-950">{title}</p>
        <p className="mt-1 font-mono text-[11px] text-slate-500">{animation}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">{reason}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   1. Buttons — real click → scale press
   ═══════════════════════════════════════════════ */

function ButtonDemo() {
  return (
    <Section
      title="Button"
      animation="active:scale(0.97) · 150ms ease-out"
      reason="Les boutons 'pressent' — le scale communique l'interactivite sans mouvement spatial."
    >
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]">
          Enregistrer
        </button>
        <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-transform duration-150 active:scale-[0.97]">
          Annuler
        </button>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]">
          Supprimer
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   2. Toast — click to trigger, slides from bottom
   ═══════════════════════════════════════════════ */

function ToastDemo() {
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const counter = useRef(0);

  const addToast = () => {
    const id = ++counter.current;
    const texts = ["Modifications enregistrees", "Contact cree", "Email envoye", "Facture exportee"];
    setToasts((prev) => [...prev, { id, text: texts[id % texts.length] }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  };

  return (
    <Section
      title="Toast / Snackbar"
      animation="translateY(8px → 0) + opacity · 200ms"
      reason="Les toasts glissent depuis leur direction d'origine (bas). Pas de scale, pas de bounce."
    >
      <div className="relative w-full h-20">
        <button
          onClick={addToast}
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-transform duration-150 active:scale-[0.97]"
        >
          Declencher un toast
        </button>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1.5">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease }}
                className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 shadow-md"
              >
                ✓ {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   3. Modal — real open/close
   ═══════════════════════════════════════════════ */

function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Section
      title="Modal / Dialog"
      animation="scale(0.97 → 1) + opacity · 200ms centre"
      reason="Les modales emergent du centre — jamais par le cote. Le scale subtil evite un effet 'pop' agressif."
    >
      <div className="relative w-full h-24 flex items-center justify-center">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
        >
          Ouvrir la modale
        </button>
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/10 rounded-lg"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease }}
                className="absolute rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg"
              >
                <p className="text-xs font-semibold text-slate-950">Confirmer la suppression ?</p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-transform duration-150 active:scale-[0.97]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-white transition-transform duration-150 active:scale-[0.97]"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   4. Loader — always spinning
   ═══════════════════════════════════════════════ */

function LoaderDemo() {
  const [loading, setLoading] = useState(false);

  const simulate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Section
      title="Loader / Spinner"
      animation="rotate 360° linear infinite"
      reason="Les loaders tournent en lineaire infini. Pas de bounce, pas de spring — le mouvement continu signale un processus."
    >
      <div className="flex items-center gap-3">
        <button
          onClick={simulate}
          disabled={loading}
          className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </motion.svg>
              Chargement...
            </span>
          ) : (
            "Lancer"
          )}
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   5. Data Table — rows enter on mount
   ═══════════════════════════════════════════════ */

function TableRowDemo() {
  const [key, setKey] = useState(0);

  const data = [
    ["INV-001", "Globex SA", "24 500 €", "Payee"],
    ["INV-002", "Initech", "18 200 €", "En attente"],
    ["INV-003", "Acme Corp", "9 800 €", "Payee"],
    ["INV-004", "Stark Ind.", "67 000 €", "Retard"],
  ];

  const statusStyle = (s: string) =>
    s === "Payee" ? "bg-emerald-50 text-emerald-600" :
    s === "Retard" ? "bg-rose-50 text-rose-600" :
    "bg-amber-50 text-amber-600";

  return (
    <Section
      title="Data Table"
      animation="translateX(-8px → 0) + opacity · stagger 60ms"
      reason="Les lignes glissent horizontalement — elles sont des elements horizontaux. Le stagger cree un effet cascade."
    >
      <div className="w-full px-2">
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            Rejouer
          </button>
        </div>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="pb-1.5 font-medium">Ref</th>
              <th className="pb-1.5 font-medium">Client</th>
              <th className="pb-1.5 font-medium text-right">Montant</th>
              <th className="pb-1.5 font-medium text-right">Statut</th>
            </tr>
          </thead>
          <tbody key={key}>
            {data.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease, delay: i * 0.06 }}
                className="border-t border-slate-100"
              >
                <td className="py-1.5 text-slate-500">{row[0]}</td>
                <td className="py-1.5 font-medium text-slate-950">{row[1]}</td>
                <td className="py-1.5 text-right text-slate-600">{row[2]}</td>
                <td className="py-1.5 text-right">
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyle(row[3])}`}>
                    {row[3]}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   6. Badge — real data, spring pop on mount
   ═══════════════════════════════════════════════ */

function BadgeDemo() {
  const [tags, setTags] = useState(["Actif", "v2.4"]);
  const [input, setInput] = useState("");

  const addTag = () => {
    const t = input.trim();
    if (!t) return;
    setTags((prev) => [...prev, t]);
    setInput("");
  };

  const removeTag = (i: number) => setTags((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <Section
      title="Badge / Tag"
      animation="scale(0.5 → 1) spring bounce:0.25"
      reason="Les petits elements 'pop' en existence. Le spring vend la micro-taille du badge."
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap gap-1.5 justify-center">
          <AnimatePresence mode="popLayout">
            {tags.map((t, i) => (
              <motion.span
                key={`${t}-${i}`}
                layout
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                onClick={() => removeTag(i)}
                className="cursor-pointer rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition-colors duration-150"
              >
                {t} ×
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Ajouter..."
            className="h-7 w-24 rounded-md border border-slate-200 px-2 text-[11px] text-slate-950 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 placeholder:text-slate-300"
          />
          <button
            onClick={addTag}
            className="h-7 rounded-md bg-slate-950 px-2 text-[11px] font-medium text-white transition-transform duration-150 active:scale-[0.97]"
          >
            +
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   7. Toggle — real interactive switch
   ═══════════════════════════════════════════════ */

function ToggleDemo() {
  const [on, setOn] = useState(false);

  return (
    <Section
      title="Toggle / Switch"
      animation="spring translateX sur le thumb uniquement"
      reason="Seul le curseur bouge, pas le container. Le spring donne un retour physique naturel."
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOn(!on)}
          className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${on ? "bg-slate-950" : "bg-slate-200"}`}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ x: on ? 16 : 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          />
        </button>
        <span className="text-xs text-slate-500">{on ? "Actif" : "Inactif"}</span>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   8. Input — real focus, border + ring only
   ═══════════════════════════════════════════════ */

function InputDemo() {
  return (
    <Section
      title="Input Focus"
      animation="border-color + ring transition only (aucun transform)"
      reason="Les inputs ne bougent pas. Seul l'etat visuel change (bordure, ring). Deplacer un input serait desorientant."
    >
      <div className="flex flex-col gap-2 w-56">
        <input
          type="text"
          placeholder="Nom complet"
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-950 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 placeholder:text-slate-300"
        />
        <input
          type="email"
          placeholder="Email"
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-950 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 placeholder:text-slate-300"
        />
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   9. Dropdown — real click to open
   ═══════════════════════════════════════════════ */

function DropdownDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Modifier");

  return (
    <Section
      title="Dropdown / Menu"
      animation="scale(0.97 → 1) + opacity · origin-aware"
      reason="Le dropdown croit depuis son declencheur grace au transform-origin. Jamais depuis le centre."
    >
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-950 transition-transform duration-150 active:scale-[0.97]"
        >
          {selected}
          <svg className="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" stroke="currentColor" />
          </svg>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15, ease }}
              style={{ transformOrigin: "top left" }}
              className="absolute top-full mt-1 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-10"
            >
              {["Modifier", "Dupliquer", "Archiver", "Supprimer"].map((item) => (
                <button
                  key={item}
                  onClick={() => { setSelected(item); setOpen(false); }}
                  className={`block w-full px-3 py-1.5 text-left text-xs transition-colors duration-100 hover:bg-slate-50 ${
                    item === "Supprimer" ? "text-rose-600" : "text-slate-700"
                  } ${item === selected ? "font-medium bg-slate-50" : ""}`}
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   10. Progress — click to simulate fill
   ═══════════════════════════════════════════════ */

function ProgressDemo() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const simulate = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setRunning(false), 800);
      }
      setProgress(Math.min(Math.round(p), 100));
    }, 300);
  };

  return (
    <Section
      title="Progress Bar"
      animation="width: 0 → n% · ease-out (pas d'opacity, pas de translate)"
      reason="Les barres se remplissent. Seule la largeur anime — pas de translate, pas d'opacity."
    >
      <div className="w-full px-4">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">{running ? "Import en cours..." : progress === 100 ? "Termine" : "Pret"}</span>
          <span className="font-medium text-slate-950 tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-2.5">
          <motion.div
            className="h-full rounded-full bg-slate-900"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease }}
          />
        </div>
        <button
          onClick={simulate}
          disabled={running}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-transform duration-150 active:scale-[0.97] disabled:opacity-40"
        >
          Lancer l'import
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   11. Skeleton → Content transition
   ═══════════════════════════════════════════════ */

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);

  const toggle = () => {
    setLoaded(false);
    setTimeout(() => setLoaded(true), 1500);
  };

  return (
    <Section
      title="Skeleton"
      animation="shimmer pulse opacity ease-in-out infinite"
      reason="Les skeletons pulsent, jamais de translate ni de scale. Le mouvement subtil signale le chargement."
    >
      <div className="w-full px-4">
        {loaded ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-950">Rapport mensuel</p>
            <p className="text-[11px] text-slate-500">Le CA de fevrier est de 284 500 €, en hausse de 12%.</p>
            <p className="text-[11px] text-slate-400">Mis a jour il y a 3 min</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        )}
        <button
          onClick={toggle}
          className="mt-3 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-transform duration-150 active:scale-[0.97]"
        >
          {loaded ? "Recharger" : "Charger"}
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   12. Avatar group
   ═══════════════════════════════════════════════ */

function AvatarDemo() {
  const all = [
    { initials: "ML", hue: 210 },
    { initials: "AW", hue: 340 },
    { initials: "TS", hue: 0 },
    { initials: "KR", hue: 300 },
    { initials: "BW", hue: 260 },
  ];
  const [count, setCount] = useState(3);

  return (
    <Section
      title="Avatar"
      animation="scale(0.8 → 1) + opacity"
      reason="Les elements circulaires 'pop' en existence. Scale plus doux que les badges car les avatars sont plus grands."
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex -space-x-2">
          <AnimatePresence mode="popLayout">
            {all.slice(0, count).map((a) => (
              <motion.span
                key={a.initials}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25, ease }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                style={{ backgroundColor: `hsl(${a.hue}, 55%, 50%)` }}
              >
                {a.initials}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="h-6 w-6 rounded-md border border-slate-200 text-[11px] text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            -
          </button>
          <button
            onClick={() => setCount((c) => Math.min(all.length, c + 1))}
            className="h-6 w-6 rounded-md border border-slate-200 text-[11px] text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            +
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   13. Counter — click to increment
   ═══════════════════════════════════════════════ */

function CounterDemo() {
  const [value, setValue] = useState(284500);

  const bump = () => setValue((v) => v + Math.floor(Math.random() * 5000 + 1000));

  return (
    <Section
      title="Stat / Counter"
      animation="count-up interpole — aucun translate"
      reason="Les nombres s'incrementent, pas de mouvement spatial. Un translate sur un chiffre serait incoherent."
    >
      <div className="text-center">
        <motion.p
          key={value}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold text-slate-950 tabular-nums"
        >
          {value.toLocaleString("fr-FR")} €
        </motion.p>
        <p className="text-[11px] text-slate-400 mt-1 mb-2">Chiffre d'affaires</p>
        <button
          onClick={bump}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-transform duration-150 active:scale-[0.97]"
        >
          + Vente
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   14. Card — appear on action
   ═══════════════════════════════════════════════ */

function CardDemo() {
  const [cards, setCards] = useState([
    { id: 1, ref: "#4521", client: "Globex SA", amount: "2 450 €", status: "Payee" },
  ]);
  const counter = useRef(1);

  const add = () => {
    const id = ++counter.current;
    const clients = ["Initech", "Acme Corp", "Stark Ind.", "Wayne Ent."];
    setCards((prev) => [
      ...prev,
      {
        id,
        ref: `#${4520 + id}`,
        client: clients[id % clients.length],
        amount: `${(Math.random() * 10000 + 500).toFixed(0)} €`,
        status: id % 2 === 0 ? "Payee" : "En attente",
      },
    ]);
  };

  const remove = (id: number) => setCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <Section
      title="Card"
      animation="translateY(12px → 0) + opacity · 350ms"
      reason="Les cards se levent en position. Le mouvement vertical correspond a l'empilement naturel."
    >
      <div className="w-full px-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {cards.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              onClick={() => remove(c.id)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm hover:border-slate-300 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-950">Commande {c.ref}</p>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  c.status === "Payee" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>{c.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{c.client} · {c.amount}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          onClick={add}
          className="w-full rounded-md border border-dashed border-slate-300 py-1.5 text-[11px] font-medium text-slate-400 transition-colors duration-150 hover:border-slate-400 hover:text-slate-500"
        >
          + Ajouter une commande
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   15. Bar Chart — bars grow from baseline (SVG)
   ═══════════════════════════════════════════════ */

function BarChartDemo() {
  const [key, setKey] = useState(0);
  const data = [
    { label: "Jan", value: 42 },
    { label: "Fev", value: 68 },
    { label: "Mar", value: 55 },
    { label: "Avr", value: 91 },
    { label: "Mai", value: 78 },
    { label: "Jun", value: 85 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  const w = 200;
  const h = 80;
  const gap = 6;
  const barW = (w - gap * (data.length - 1)) / data.length;

  return (
    <Section
      title="Bar Chart"
      animation="scaleY(0 → 1) origin-bottom · stagger 40ms"
      reason="Les barres poussent depuis leur base. Le stagger cree une lecture de gauche a droite."
    >
      <div className="w-full px-4">
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            Rejouer
          </button>
        </div>
        <svg viewBox={`0 0 ${w} ${h + 14}`} className="w-full h-28" key={key}>
          {data.map((d, i) => {
            const barH = (d.value / max) * h;
            const x = i * (barW + gap);
            return (
              <g key={d.label}>
                <motion.rect
                  x={x}
                  width={barW}
                  rx={2}
                  fill="#1e293b"
                  initial={{ y: h, height: 0 }}
                  animate={{ y: h - barH, height: barH }}
                  transition={{ duration: 0.25, ease, delay: i * 0.04 }}
                />
                <text x={x + barW / 2} y={h + 11} textAnchor="middle" className="fill-slate-400 text-[7px]">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   16. Line Chart — path draws in via pathLength
   ═══════════════════════════════════════════════ */

function LineChartDemo() {
  const [key, setKey] = useState(0);
  const points = [18, 45, 32, 67, 54, 78, 62, 88];
  const w = 220;
  const h = 72;
  const pad = 6;
  const px = points.map((p, i) => ({
    x: pad + (i / (points.length - 1)) * (w - pad * 2),
    y: pad + (1 - p / 100) * (h - pad * 2),
  }));
  const d = px.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <Section
      title="Line Chart"
      animation="stroke-dashoffset trace · 500ms + points opacity stagger"
      reason="La ligne se dessine progressivement. Les points apparaissent une fois la ligne tracee."
    >
      <div className="w-full px-4">
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            Rejouer
          </button>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" key={key}>
          <motion.path
            d={d}
            fill="none"
            stroke="#1e293b"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.5, ease }}
          />
          {px.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="white"
              stroke="#1e293b"
              strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease, delay: 0.45 + i * 0.04 }}
            />
          ))}
        </svg>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   17. Donut Chart — segments appear with stagger
   ═══════════════════════════════════════════════ */

function DonutChartDemo() {
  const [key, setKey] = useState(0);
  const segments = [
    { label: "Produits", value: 42, color: "#1e293b" },
    { label: "Services", value: 28, color: "#64748b" },
    { label: "Licences", value: 18, color: "#94a3b8" },
    { label: "Support", value: 12, color: "#cbd5e1" },
  ];
  const total = segments.reduce((s, d) => s + d.value, 0);
  const r = 36;
  const circ = 2 * Math.PI * r;

  // Build one <circle> per segment with the correct dash positioning
  const segmentData = segments.map((seg, i) => {
    const fraction = seg.value / total;
    const segLen = fraction * circ;
    return { ...seg, segLen, fraction };
  });

  // Cumulative offset for positioning each segment
  let cumOffset = 0;
  const positioned = segmentData.map((seg) => {
    const result = { ...seg, offset: cumOffset };
    cumOffset += seg.segLen;
    return result;
  });

  return (
    <Section
      title="Donut Chart"
      animation="opacity + strokeDashoffset stagger 80ms"
      reason="Les segments se remplissent depuis le haut (12h). Pas de rotation du cercle entier."
    >
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24" key={key}>
          {positioned.map((seg, i) => (
            <motion.circle
              key={seg.label}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeLinecap="butt"
              strokeDasharray={`${seg.segLen} ${circ - seg.segLen}`}
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: seg.segLen - seg.offset, opacity: 0 }}
              animate={{ strokeDashoffset: -seg.offset, opacity: 1 }}
              transition={{ duration: 0.3, ease, delay: i * 0.08 }}
            />
          ))}
        </svg>
        <div className="flex flex-col gap-1">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[10px] text-slate-500">{seg.label}</span>
              <span className="text-[10px] font-medium text-slate-700 ml-auto tabular-nums">{seg.value}%</span>
            </div>
          ))}
          <button
            onClick={() => setKey((k) => k + 1)}
            className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            Rejouer
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   18. Area Chart — line draw + fill fade
   ═══════════════════════════════════════════════ */

function AreaChartDemo() {
  const [key, setKey] = useState(0);
  const points = [25, 38, 30, 55, 48, 72, 65, 82, 70, 90];
  const w = 220;
  const h = 72;
  const pad = 6;
  const px = points.map((p, i) => ({
    x: pad + (i / (points.length - 1)) * (w - pad * 2),
    y: pad + (1 - p / 100) * (h - pad * 2),
  }));
  const linePath = px.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${px[px.length - 1].x},${h} L${px[0].x},${h} Z`;

  return (
    <Section
      title="Area Chart"
      animation="stroke-dashoffset trace 500ms + fill opacity 200ms"
      reason="Comme le Line Chart, avec un remplissage en fondu sous la courbe apres le trace."
    >
      <div className="w-full px-4">
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 transition-transform duration-150 active:scale-[0.97]"
          >
            Rejouer
          </button>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" key={key}>
          <motion.path
            d={areaPath}
            fill="#1e293b"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            transition={{ duration: 0.25, ease, delay: 0.4 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.5, ease }}
          />
          {px.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="white"
              stroke="#1e293b"
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease, delay: 0.45 + i * 0.04 }}
            />
          ))}
        </svg>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════
   Showcase grid
   ═══════════════════════════════════════════════ */

export default function Showcase() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            ERP Design System
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Composants interactifs avec leur animation propre. Cliquez, tapez, interagissez.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ButtonDemo />
          <ToastDemo />
          <ModalDemo />
          <LoaderDemo />
          <TableRowDemo />
          <BadgeDemo />
          <ToggleDemo />
          <InputDemo />
          <DropdownDemo />
          <ProgressDemo />
          <SkeletonDemo />
          <AvatarDemo />
          <CounterDemo />
          <CardDemo />
          <BarChartDemo />
          <LineChartDemo />
          <DonutChartDemo />
          <AreaChartDemo />
        </div>
      </div>
    </div>
  );
}
