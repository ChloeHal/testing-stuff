import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  ArrowUpDown,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Tags,
  Link,
  Phone,
  Mail,
  MapPin,
  GitBranch,
  FunctionSquare,
  User,
  FileText,
  Activity,
  Smile,
  Database,
  Clock,
  Key,
  ChevronDown,
  ChevronRight,
  Check,
  Lock,
  Filter,
  Circle,
  Loader,
  Eye,
  CheckCircle,
  Ban,
  AlertTriangle,
  ChevronsUp,
  Minus,
  ChevronsDown,
  Sun,
  Moon,
  ListOrdered,
  EyeOff,
  Columns2,
  Save,
  Users,
  Pencil,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   POPOVER HOOK
   ═══════════════════════════════════════════════════════ */
function usePopover() {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const open = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      )
        close();
    };
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [isOpen, close]);

  return { triggerRef, popoverRef, isOpen, coords, open, close, toggle };
}

function clampPos(top, left, minW = 200) {
  return {
    top: Math.max(8, Math.min(top, window.innerHeight - 80)),
    left: Math.max(8, Math.min(left, window.innerWidth - minW - 8)),
  };
}

function ddStyle(top, left, minW) {
  const c = clampPos(top, left, minW);
  return {
    top: c.top,
    left: c.left,
    minWidth: minW,
    maxWidth: "calc(100vw - 16px)",
    maxHeight: "calc(100vh - 16px)",
    overflow: "auto",
  };
}

function FixedPopover({ isOpen, coords, popoverRef, minWidth, children }) {
  if (!isOpen) return null;
  const { top, left } = clampPos(coords.top, coords.left, minWidth);
  return (
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      style={{ top, left, minWidth, maxWidth: "calc(100vw - 16px)" }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DRAG ACCESSIBILITY — instructions lues par les lecteurs d'écran
   Injectées via aria-describedby sur chaque élément draggable.
   ═══════════════════════════════════════════════════════ */
const DND_SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "Pour déplacer cet élément, appuyez sur Espace. " +
    "Utilisez les touches fléchées pour le déplacer. " +
    "Appuyez à nouveau sur Espace pour le déposer à sa nouvelle position, " +
    "ou sur Échap pour annuler.",
};

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */
const COLUMN_TYPES = {
  text: { label: "Texte", icon: Type, color: "text-blue-500" },
  number: { label: "Nombre", icon: Hash, color: "text-emerald-500" },
  date: { label: "Date", icon: Calendar, color: "text-orange-500" },
  checkbox: {
    label: "Case à cocher",
    icon: CheckSquare,
    color: "text-violet-500",
  },
  select: { label: "Sélection", icon: List, color: "text-pink-500" },
  tags: { label: "Tags", icon: Tags, color: "text-amber-500" },
  url: { label: "URL", icon: Link, color: "text-cyan-500" },
  phone: { label: "Téléphone", icon: Phone, color: "text-teal-500" },
  email: { label: "Email", icon: Mail, color: "text-rose-500" },
  location: { label: "Lieu", icon: MapPin, color: "text-red-500" },
  relation: { label: "Relation", icon: GitBranch, color: "text-indigo-500" },
  formula: { label: "Formule", icon: FunctionSquare, color: "text-lime-500" },
  user: { label: "Utilisateur", icon: User, color: "text-sky-500" },
  file: { label: "Fichier", icon: FileText, color: "text-stone-500" },
  status: { label: "Statut", icon: Activity, color: "text-fuchsia-500" },
  emoji: { label: "Emoji", icon: Smile, color: "text-yellow-500" },
  rollup: { label: "Rollup", icon: Database, color: "text-purple-500" },
  created_modified: {
    label: "Créé/Modifié",
    icon: Clock,
    color: "text-zinc-500",
  },
  unique_id: { label: "ID Unique", icon: Key, color: "text-neutral-500" },
};

const MOCK_COLUMNS = [
  { id: "col_name", name: "Nom", type: "text" },
  { id: "col_price", name: "Prix", type: "number" },
  { id: "col_date", name: "Date d'échéance", type: "date" },
  { id: "col_done", name: "Terminé", type: "checkbox" },
  { id: "col_status", name: "Statut", type: "status" },
  { id: "col_priority", name: "Priorité", type: "select" },
  { id: "col_tags", name: "Tags", type: "tags" },
  { id: "col_email", name: "Email", type: "email" },
  { id: "col_phone", name: "Téléphone", type: "phone" },
  { id: "col_url", name: "Lien", type: "url" },
  { id: "col_location", name: "Lieu", type: "location" },
  { id: "col_relation", name: "Projet", type: "relation" },
  { id: "col_formula", name: "Total", type: "formula" },
  { id: "col_user", name: "Assigné à", type: "user" },
  { id: "col_file", name: "Pièce jointe", type: "file" },
  { id: "col_emoji", name: "Réaction", type: "emoji" },
  { id: "col_rollup", name: "Budget", type: "rollup" },
  { id: "col_created", name: "Créé le", type: "created_modified" },
  { id: "col_id", name: "Réf.", type: "unique_id" },
];

/* ─── Niveaux d'accès colonnes ─── */
const COL_ACCESS_LEVELS = [
  { id: "full", label: "Éditable",         desc: "Peut voir et modifier",                 Icon: Pencil, color: "text-emerald-500", activeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700" },
  { id: "view", label: "Lecture seule",    desc: "Peut voir, pas modifier",               Icon: Eye,    color: "text-blue-500",   activeBg: "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"            },
  { id: "ask",  label: "Masqué + demande", desc: "Sait que c'est masqué, peut demander",  Icon: Lock,   color: "text-amber-500",  activeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"         },
  { id: "none", label: "Masqué total",     desc: "Invisible, sans notification",          Icon: EyeOff, color: "text-red-400",    activeBg: "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"               },
];

/* ─── Niveaux d'accès filtres ─── */
const FILTER_ACCESS_LEVELS = [
  { id: "visible", label: "Visible",         desc: "Filtre affiché, non modifiable",       Icon: Eye,  color: "text-emerald-500", activeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700" },
  { id: "ask",     label: "Accès restreint", desc: "Masqué, peut demander l'accès",        Icon: Lock, color: "text-amber-500",   activeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"       },
  { id: "silent",  label: "Caché",           desc: "Filtre actif, données pré-filtrées",   Icon: EyeOff, color: "text-zinc-400", activeBg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"             },
];

/* ─── Rôles cibles ─── */

/* ─── Rôles de prévisualisation ─── */
const PREVIEW_ROLES = [
  { id: "dev",   label: "Dev",   description: "Accès complet et configuration" },
  { id: "owner", label: "Owner", description: "Peut imposer des vues aux Users" },
  { id: "user",  label: "User",  description: "Accès et vues personnels uniquement" },
];

/* ─── Ordre de restriction (plus l'index est grand, plus c'est restrictif) ─── */
const COL_ACCESS_ORDER = ["full", "view", "ask", "none"];
const FILTER_ACCESS_ORDER = ["visible", "ask", "silent"];

function mostRestrictiveCol(a, b) {
  return COL_ACCESS_ORDER[Math.max(COL_ACCESS_ORDER.indexOf(a), COL_ACCESS_ORDER.indexOf(b))];
}
function mostRestrictiveFilter(a, b) {
  return FILTER_ACCESS_ORDER[Math.max(FILTER_ACCESS_ORDER.indexOf(a), FILTER_ACCESS_ORDER.indexOf(b))];
}

function getOperatorCategory(colType) {
  if (
    [
      "text",
      "email",
      "url",
      "phone",
      "location",
      "file",
      "emoji",
      "unique_id",
    ].includes(colType)
  )
    return "text";
  if (["number", "formula", "rollup"].includes(colType)) return "number";
  if (["date", "created_modified"].includes(colType)) return "date";
  if (["select", "status", "relation"].includes(colType)) return "select";
  if (colType === "checkbox") return "checkbox";
  if (colType === "user") return "user";
  if (colType === "tags") return "tags";
  return "text";
}

const OPERATORS = {
  text: [
    { id: "is", label: "est" },
    { id: "is_not", label: "n'est pas" },
    { id: "contains", label: "contient" },
    { id: "not_contains", label: "ne contient pas" },
    { id: "starts_with", label: "commence par" },
    { id: "ends_with", label: "finit par" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
  number: [
    { id: "eq", label: "égale" },
    { id: "neq", label: "différent de" },
    { id: "gt", label: "supérieur à" },
    { id: "lt", label: "inférieur à" },
    { id: "gte", label: "supérieur ou égal à" },
    { id: "lte", label: "inférieur ou égal à" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
  date: [
    { id: "is", label: "est" },
    { id: "is_before", label: "est avant" },
    { id: "is_after", label: "est après" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
  select: [
    { id: "is", label: "est" },
    { id: "is_not", label: "n'est pas" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
  checkbox: [
    { id: "is_checked", label: "est coché", noValue: true },
    { id: "is_unchecked", label: "n'est pas coché", noValue: true },
  ],
  user: [
    { id: "is", label: "est" },
    { id: "is_not", label: "n'est pas" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
  tags: [
    { id: "contains", label: "contient" },
    { id: "not_contains", label: "ne contient pas" },
    { id: "is_empty", label: "est vide", noValue: true },
    { id: "is_not_empty", label: "n'est pas vide", noValue: true },
  ],
};

const MOCK_VALUES = {
  col_name: {
    type: "chips",
    items: ["Martin", "Dupont", "Sophie", "Pierre", "Marie", "Lucas"],
  },
  col_price: { type: "number", presets: [0, 10, 25, 50, 100, 200, 500] },
  col_date: {
    type: "chips",
    items: ["Aujourd'hui", "Hier", "Cette semaine", "Ce mois", "Cette année"],
  },
  col_done: null,
  col_status: {
    type: "colored",
    items: [
      {
        label: "À faire",
        color: "bg-zinc-400",
        icon: Circle,
        iconColor: "text-zinc-400",
      },
      {
        label: "En cours",
        color: "bg-blue-500",
        icon: Loader,
        iconColor: "text-blue-500",
      },
      {
        label: "En revue",
        color: "bg-amber-500",
        icon: Eye,
        iconColor: "text-amber-500",
      },
      {
        label: "Terminé",
        color: "bg-emerald-500",
        icon: CheckCircle,
        iconColor: "text-emerald-500",
      },
      {
        label: "Bloqué",
        color: "bg-red-500",
        icon: Ban,
        iconColor: "text-red-500",
      },
    ],
  },
  col_priority: {
    type: "colored",
    items: [
      {
        label: "Urgent",
        color: "bg-red-500",
        icon: AlertTriangle,
        iconColor: "text-red-500",
      },
      {
        label: "Haute",
        color: "bg-orange-500",
        icon: ChevronsUp,
        iconColor: "text-orange-500",
      },
      {
        label: "Normale",
        color: "bg-blue-500",
        icon: Minus,
        iconColor: "text-blue-500",
      },
      {
        label: "Basse",
        color: "bg-zinc-400",
        icon: ChevronsDown,
        iconColor: "text-zinc-400",
      },
    ],
  },
  col_tags: {
    type: "colored_multi",
    items: [
      { label: "VIP", color: "bg-amber-500" },
      { label: "Design", color: "bg-purple-500" },
      { label: "Dev", color: "bg-cyan-500" },
      { label: "Marketing", color: "bg-pink-500" },
      { label: "Finance", color: "bg-emerald-500" },
      { label: "RH", color: "bg-indigo-500" },
    ],
  },
  col_email: {
    type: "chips",
    items: ["@gmail.com", "@company.com", "@outlook.com", "@proton.me"],
  },
  col_phone: { type: "chips", items: ["+32", "+33", "+1", "+44", "+49"] },
  col_url: {
    type: "chips",
    items: ["google.com", "github.com", "notion.so", "figma.com"],
  },
  col_location: {
    type: "chips",
    items: ["Bruxelles", "Paris", "Lyon", "Namur", "Liège"],
  },
  col_relation: {
    type: "chips",
    items: ["Projet Alpha", "Projet Beta", "Projet Gamma"],
  },
  col_user: {
    type: "users",
    items: [
      { label: "Alice Martin", initials: "AM" },
      { label: "Bob Dupont", initials: "BD" },
      { label: "Claire Petit", initials: "CP" },
      { label: "David Roux", initials: "DR" },
    ],
  },
  col_file: {
    type: "chips",
    items: ["PDF", "Image", "Vidéo", "Document", "Tableur"],
  },
  col_emoji: { type: "chips", items: ["😀", "👍", "❤️", "⭐", "🔥"] },
  col_rollup: { type: "number", presets: [0, 10, 50, 100, 500] },
  col_formula: { type: "number", presets: [0, 10, 50, 100, 500, 1000] },
  col_created: {
    type: "chips",
    items: ["Aujourd'hui", "Hier", "Cette semaine", "Ce mois", "Cette année"],
  },
  col_id: { type: "chips", items: ["001", "002", "003", "010", "100"] },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function getValueColor(columnId, value) {
  const mock = MOCK_VALUES[columnId];
  if (!mock?.items) return null;
  const item = mock.items.find(
    (i) => typeof i === "object" && i.label === value,
  );
  return item?.color || null;
}

function getValueIcon(columnId, value) {
  const mock = MOCK_VALUES[columnId];
  if (!mock?.items) return null;
  const item = mock.items.find(
    (i) => typeof i === "object" && i.label === value,
  );
  if (item?.icon) return { Icon: item.icon, iconColor: item.iconColor };
  return null;
}

function getMultiValueColors(columnId, values) {
  const mock = MOCK_VALUES[columnId];
  if (!mock?.items || !Array.isArray(values)) return [];
  return values
    .map((v) => {
      const item = mock.items.find(
        (i) => (typeof i === "object" ? i.label : i) === v,
      );
      return typeof item === "object" ? item.color : null;
    })
    .filter(Boolean);
}

function getUserInitials(columnId, value) {
  const mock = MOCK_VALUES[columnId];
  if (mock?.type !== "users") return null;
  return mock.items.find((u) => u.label === value)?.initials || null;
}

function toArray(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

/* Overlapping colored dots (max 3) */
function OverlappingDots({ colors }) {
  if (!colors || colors.length === 0) return null;
  return (
    <span className="inline-flex items-center mr-0.5">
      {colors.slice(0, 3).map((c, i) => (
        <span
          key={i}
          className={`w-[7px] h-[7px] rounded-full ${c} border border-white dark:border-zinc-900`}
          style={{
            marginLeft: i === 0 ? 0 : -3,
            zIndex: colors.length - i,
            position: "relative",
          }}
        />
      ))}
    </span>
  );
}

/* Overlapping avatar circles (max 3) */
function OverlappingAvatars({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <span className="inline-flex items-center mr-0.5">
      {items.slice(0, 3).map((item, i) => (
        <span
          key={i}
          className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[7px] font-bold text-sky-700 border border-white dark:border-zinc-900 dark:bg-sky-900/50 dark:text-sky-300"
          style={{
            marginLeft: i === 0 ? 0 : -6,
            zIndex: items.length - i,
            position: "relative",
          }}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

/* Get first letter(s) for a name */
function getInitial(name) {
  if (!name || typeof name !== "string") return "?";
  return name.charAt(0).toUpperCase();
}

/* Display value with icons/avatars/initials */
function ValueDisplay({ columnId, value }) {
  if (value == null) return <span className="text-zinc-300">…</span>;

  const arr = toArray(value);
  if (arr.length === 0) return <span className="text-zinc-300">…</span>;
  const mock = MOCK_VALUES[columnId];
  const isUsers = mock?.type === "users";
  const isNames = mock?.type === "chips" && ["col_name"].includes(columnId);
  const col = MOCK_COLUMNS.find((c) => c.id === columnId);
  const isTags = col?.type === "tags";

  if (arr.length === 1) {
    const v = arr[0];
    const color = getValueColor(columnId, v);
    const vi = getValueIcon(columnId, v);
    const initials = getUserInitials(columnId, v);
    return (
      <span className="inline-flex items-center gap-1">
        {initials && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[8px] font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            {initials}
          </span>
        )}
        {!initials && isNames && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-[8px] font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            {getInitial(v)}
          </span>
        )}
        {color && isTags && (
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`} />
        )}
        {color && !isTags && vi && (
          <vi.Icon size={12} className={`flex-shrink-0 ${vi.iconColor}`} />
        )}
        {String(v)}
      </span>
    );
  }

  // Multi-value display
  const colors = getMultiValueColors(columnId, arr);
  const hasAvatars = isUsers || isNames;

  if (hasAvatars) {
    const initials = arr.map((v) => {
      const ui = getUserInitials(columnId, v);
      return ui ? ui.charAt(0) : getInitial(v);
    });
    return (
      <span className="inline-flex items-center gap-1">
        <OverlappingAvatars items={initials} />
        {arr.length} {isUsers ? "personnes" : "noms"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      {colors.length > 0 && isTags && <OverlappingDots colors={colors} />}
      {colors.length > 0 && !isTags && (
        <span className="inline-flex items-center -space-x-0.5">
          {arr.slice(0, 3).map((v, i) => {
            const vi = getValueIcon(columnId, v);
            return vi ? (
              <vi.Icon
                key={i}
                size={12}
                className={`flex-shrink-0 ${vi.iconColor}`}
              />
            ) : null;
          })}
        </span>
      )}
      {arr.length} sélections
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   VALUE OPTIONS — multi-select for items, input for numbers
   onChange(newValue) called on every change.
   For items: value is always an array (or null).
   For numbers: value is a number.
   ═══════════════════════════════════════════════════════ */
function ValueOptions({ columnId, value, onChange, onApply }) {
  const mock = MOCK_VALUES[columnId];
  const [numInput, setNumInput] = useState(
    typeof value === "number" ? String(value) : "",
  );
  const [search, setSearch] = useState("");

  if (!mock) return null;

  // Number: input + presets — single value, confirms immediately
  if (mock.type === "number") {
    return (
      <div className="p-2.5">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && numInput.trim())
                onChange(Number(numInput));
            }}
            placeholder="Valeur…"
            className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            autoFocus
          />
          <button
            onClick={() => {
              if (numInput.trim()) onChange(Number(numInput));
            }}
            className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            OK
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {mock.presets.map((n) => (
            <button
              key={n}
              onClick={() => {
                setNumInput(String(n));
                onChange(n);
              }}
              className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                value === n
                  ? "border-zinc-400 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // All item-based types: combobox (search input + filtered multi-select list)
  const selected = toArray(value);
  const allItems = mock.items || [];
  const itemListRef = useRef(null);
  const valueSearchRef = useRef(null);

  const toggle = (label) => {
    const newArr = selected.includes(label)
      ? selected.filter((v) => v !== label)
      : [...selected, label];
    onChange(newArr.length === 0 ? null : newArr);
  };

  const isNames = mock.type === "chips" && ["col_name"].includes(columnId);
  const col = MOCK_COLUMNS.find((c) => c.id === columnId);
  const isTags = col?.type === "tags";

  const q = search.toLowerCase();
  const items = q
    ? allItems.filter((item) => {
        const label = typeof item === "object" ? item.label : item;
        return label.toLowerCase().includes(q);
      })
    : allItems;

  const handleValueSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itemListRef.current?.querySelector("button")?.focus();
    }
  };

  const handleValueItemKeyDown = (e, label) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.currentTarget.nextElementSibling?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling;
      if (prev) prev.focus();
      else valueSearchRef.current?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(label);
    }
  };

  return (
    <div>
      {/* Search input */}
      <div className="flex items-center px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
        <input
          ref={valueSearchRef}
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleValueSearchKeyDown}
          placeholder={col?.name ?? "…"}
          className="flex-1 bg-transparent text-sm outline-none text-zinc-700 placeholder-zinc-300 dark:text-zinc-200 dark:placeholder-zinc-600"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Effacer la recherche"
            className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Filtered list */}
      <div ref={itemListRef} role="listbox" className="max-h-[220px] overflow-y-auto p-1">
        {items.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-zinc-400 text-center">
            Aucun résultat
          </p>
        )}
        {items.map((item) => {
          const label = typeof item === "object" ? item.label : item;
          const color = typeof item === "object" ? item.color : null;
          const ItemIcon =
            typeof item === "object" && item.icon ? item.icon : null;
          const itemIconColor =
            typeof item === "object" ? item.iconColor : null;
          const initials = mock.type === "users" ? item.initials : null;
          const showInitial = !initials && isNames;
          const isSelected = selected.includes(label);
          return (
            <button
              key={label}
              role="option"
              aria-selected={isSelected}
              onClick={() => toggle(label)}
              onKeyDown={(e) => handleValueItemKeyDown(e, label)}
              className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {initials && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700 flex-shrink-0 dark:bg-sky-900/50 dark:text-sky-300">
                  {initials}
                </span>
              )}
              {showInitial && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700 flex-shrink-0 dark:bg-sky-900/50 dark:text-sky-300">
                  {getInitial(label)}
                </span>
              )}
              {color && isTags && (
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}
                />
              )}
              {color && !isTags && ItemIcon && (
                <ItemIcon
                  size={14}
                  className={`flex-shrink-0 ${itemIconColor}`}
                />
              )}
              <span className="flex-1 text-left">{label}</span>
              {isSelected && (
                <Check size={12} className="text-zinc-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {onApply && (
        <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => onApply(selected)}
            className="w-full rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COLUMN LIST — reusable dropdown content with search + icons
   ═══════════════════════════════════════════════════════ */
function ColumnList({ columns, usedColumnIds, onSelect, placeholder = "…" }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const filtered = columns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      listRef.current?.querySelector("button")?.focus();
    }
  };

  const handleItemKeyDown = (e, colId) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.currentTarget.nextElementSibling?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = e.currentTarget.previousElementSibling;
      if (prev) prev.focus();
      else inputRef.current?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSelect(colId);
    }
  };

  return (
    <>
      <div className="flex items-center px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          aria-label={`Rechercher une colonne`}
          className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-300 text-zinc-700 dark:text-zinc-200 dark:placeholder-zinc-600"
          autoFocus
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Effacer la recherche"
            className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          >
            <X size={10} />
          </button>
        )}
      </div>
      <div ref={listRef} role="listbox" className="max-h-[280px] overflow-y-auto p-1">
        {filtered.map((col) => {
          const cTc = COLUMN_TYPES[col.type];
          const CIcon = cTc?.icon;
          const isUsed = usedColumnIds?.includes(col.id);
          return (
            <button
              key={col.id}
              role="option"
              aria-selected={!!isUsed}
              onClick={() => onSelect(col.id)}
              onKeyDown={(e) => handleItemKeyDown(e, col.id)}
              className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
            >
              {CIcon && (
                <CIcon size={14} className="text-zinc-400 dark:text-zinc-500" />
              )}
              <span className="flex-1 text-left">{col.name}</span>
              {isUsed && <Check size={12} className="text-zinc-400" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-4">
            Aucune colonne trouvée
          </p>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Naviguer</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Sélectionner</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Échap</kbd> Fermer</span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   OPERATOR LIST — reusable dropdown content
   ═══════════════════════════════════════════════════════ */
function OperatorList({ operators, currentOpId, onSelect }) {
  const handleKeyDown = (e, op) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.currentTarget.nextElementSibling?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.currentTarget.previousElementSibling?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSelect(op);
    }
  };

  return (
    <>
      <div role="listbox" className="max-h-[260px] overflow-y-auto p-1">
        {operators.map((op) => (
          <button
            key={op.id}
            role="option"
            aria-selected={op.id === currentOpId}
            onClick={() => onSelect(op)}
            onKeyDown={(e) => handleKeyDown(e, op)}
            className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              op.id === currentOpId
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            }`}
          >
            <span className="flex-1 text-left">{op.label}</span>
            {op.id === currentOpId && (
              <Check size={12} className="text-zinc-400" />
            )}
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Naviguer</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Sélectionner</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Échap</kbd> Fermer</span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ADVANCED FILTER BUILDER
   Uses the same cascading dropdown as simple filters.
   Completed conditions displayed as summaries with et/ou.
   "Ajouter un filtre" opens the cascade to add a new condition.
   "Valider" to apply.
   ═══════════════════════════════════════════════════════ */
function AdvancedFilterBuilder({
  open,
  coords,
  containerRef,
  columns,
  editingFilter,
  onValidate,
  onClose,
}) {
  const [logic, setLogic] = useState("and");
  const [conditions, setConditions] = useState([]);

  // Cascade state for adding a new condition
  const [addingColId, setAddingColId] = useState(null);
  const [addingOpId, setAddingOpId] = useState(null);
  const [addingValue, setAddingValue] = useState(null);
  const [cascadePos, setCascadePos] = useState({ top: 0, left: 0 });
  const [opMenuPos, setOpMenuPos] = useState({ top: 0, left: 0 });
  const [valMenuPos, setValMenuPos] = useState({ top: 0, left: 0 });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Edit state for modifying existing conditions
  const [editDD, setEditDD] = useState(null); // { row, field: "operator"|"value", top, left }

  // Refs pour la gestion du focus dans la cascade
  const colPickerRef = useRef(null);
  const opDropdownRef = useRef(null);
  const editDDRef = useRef(null);

  // Déplace le focus vers le dropdown opérateur quand une colonne est sélectionnée
  // ou quand on revient depuis le niveau valeur (Échap)
  useLayoutEffect(() => {
    if (showColumnPicker && addingColId && !addingOpId) {
      opDropdownRef.current?.querySelector("button[role='option']")?.focus();
    }
  }, [showColumnPicker, addingColId, addingOpId]);

  // Déplace le focus vers le dropdown d'édition quand il s'ouvre
  useLayoutEffect(() => {
    if (editDD) {
      editDDRef.current?.querySelector("button[role='option'], input")?.focus();
    }
  }, [editDD]);

  useEffect(() => {
    if (open) {
      if (editingFilter) {
        setLogic(editingFilter.logic || "and");
        setConditions(editingFilter.conditions.map((c) => ({ ...c })));
      } else {
        setLogic("and");
        setConditions([]);
      }
      resetCascade();
      setEditDD(null);
    }
  }, [open, editingFilter]);

  const resetCascade = () => {
    setShowColumnPicker(false);
    setAddingColId(null);
    setAddingOpId(null);
    setAddingValue(null);
  };

  const updateCond = (i, updates) => {
    setConditions((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...updates } : c)),
    );
  };

  const removeCond = (i) => {
    setConditions((prev) => prev.filter((_, idx) => idx !== i));
    setEditDD(null);
  };

  // --- Adding new conditions via cascade ---
  const openAddFilter = (e) => {
    setEditDD(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setCascadePos({
      top: Math.min(rect.bottom + 4, window.innerHeight - 360),
      left: Math.min(rect.left, window.innerWidth - 260 - 16),
    });
    resetCascade();
    setShowColumnPicker(true);
  };

  const handleColSelect = (colId) => {
    const left = cascadePos.left + 228;
    const flipLeft = left + 180 > window.innerWidth;
    setAddingColId(colId);
    setAddingOpId(null);
    setAddingValue(null);
    setOpMenuPos({
      top: cascadePos.top,
      left: flipLeft ? cascadePos.left - 184 : left,
    });
  };

  const handleOpSelect = (op) => {
    if (op.noValue) {
      setConditions((prev) => [
        ...prev,
        { columnId: addingColId, operator: op.id, value: null },
      ]);
      resetCascade();
    } else {
      setAddingOpId(op.id);
      setAddingValue(null);
      setValMenuPos({
        top: opMenuPos.top,
        left: opMenuPos.left + 184,
      });
    }
  };

  const handleValueChange = (newVal) => {
    const mock = MOCK_VALUES[addingColId];
    if (mock?.type === "number") {
      setConditions((prev) => [
        ...prev,
        { columnId: addingColId, operator: addingOpId, value: newVal },
      ]);
      resetCascade();
    } else {
      setAddingValue(newVal);
    }
  };

  const handleValueApply = (val) => {
    setConditions((prev) => [
      ...prev,
      { columnId: addingColId, operator: addingOpId, value: val },
    ]);
    resetCascade();
  };

  // --- Editing existing conditions inline ---
  const openEditDD = (row, field, e) => {
    resetCascade();
    const rect = e.currentTarget.getBoundingClientRect();
    setEditDD({
      row,
      field,
      top: Math.min(rect.bottom + 4, window.innerHeight - 300),
      left: Math.min(rect.left, window.innerWidth - 240 - 16),
    });
  };

  const editCond = editDD ? conditions[editDD.row] : null;
  const editCol = editCond
    ? columns.find((c) => c.id === editCond.columnId)
    : null;
  const editCat = editCol ? getOperatorCategory(editCol.type) : null;
  const editOps = editCat ? OPERATORS[editCat] || [] : [];

  const handleValidate = () => {
    const valid = conditions.filter((c) => {
      if (!c.columnId || !c.operator) return false;
      const col = columns.find((cc) => cc.id === c.columnId);
      const cat = col ? getOperatorCategory(col.type) : null;
      const op = cat ? OPERATORS[cat]?.find((o) => o.id === c.operator) : null;
      if (op?.noValue) return true;
      return c.value != null;
    });
    if (valid.length === 0) return;
    onValidate({ logic, conditions: valid });
  };

  const handleFocusTrap = useCallback((e) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      containerRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex="0"], a[href]',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    e.preventDefault();
    const idx = focusable.indexOf(document.activeElement);
    if (e.shiftKey) {
      focusable[idx <= 0 ? focusable.length - 1 : idx - 1].focus();
    } else {
      focusable[idx === -1 || idx === focusable.length - 1 ? 0 : idx + 1].focus();
    }
  }, []);

  if (!open) return null;

  const { top: safeTop, left: safeLeft } = clampPos(
    coords.top,
    coords.left,
    320,
  );

  const addingCol = addingColId
    ? columns.find((c) => c.id === addingColId)
    : null;
  const addingCat = addingCol ? getOperatorCategory(addingCol.type) : null;
  const addingOps = addingCat ? OPERATORS[addingCat] || [] : [];

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={handleFocusTrap}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        zIndex: 99999,
      }}
    >
      {/* Builder panel */}
      <div
        className="fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        style={{
          top: safeTop,
          left: safeLeft,
          minWidth: 320,
          maxWidth: "calc(100vw - 16px)",
        }}
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Filtre avancé
            </p>
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={14} />
            </button>
          </div>

          {/* Completed conditions as interactive button groups */}
          {conditions.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {conditions.map((cond, i) => {
                const col = columns.find((c) => c.id === cond.columnId);
                if (!col) return null;
                const cat = getOperatorCategory(col.type);
                const ops = OPERATORS[cat] || [];
                const op = ops.find((o) => o.id === cond.operator);
                const tc = COLUMN_TYPES[col.type];
                const CIcon = tc?.icon;

                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <button
                        onClick={() =>
                          setLogic((l) => (l === "and" ? "or" : "and"))
                        }
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 flex-shrink-0 w-6 text-right"
                      >
                        {logic === "and" ? "et" : "ou"}
                      </button>
                    )}
                    {i === 0 && <div className="w-6 flex-shrink-0" />}
                    <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow dark:border-zinc-700 dark:bg-zinc-900">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 text-zinc-500 select-none dark:bg-zinc-800/50 dark:text-zinc-200">
                        {CIcon && (
                          <CIcon
                            size={12}
                            className="text-zinc-400 dark:text-zinc-500"
                          />
                        )}
                        <span className="text-xs font-medium">{col.name}</span>
                      </div>
                      {op && (
                        <>
                          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
                          <button
                            onClick={(e) => openEditDD(i, "operator", e)}
                            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer dark:text-zinc-500 dark:hover:bg-zinc-800"
                          >
                            {op.label}
                            <ChevronDown
                              size={10}
                              className="text-zinc-300 dark:text-zinc-600"
                            />
                          </button>
                        </>
                      )}
                      {op && !op.noValue && (
                        <>
                          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
                          <button
                            onClick={(e) => openEditDD(i, "value", e)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer dark:text-zinc-200 dark:hover:bg-zinc-800"
                          >
                            <ValueDisplay
                              columnId={cond.columnId}
                              value={cond.value}
                            />
                            <ChevronDown size={10} className="text-zinc-400" />
                          </button>
                        </>
                      )}
                      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
                      <button
                        onClick={() => removeCond(i)}
                        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={openAddFilter}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <Plus size={12} /> Ajouter un filtre
            </button>
            {conditions.length > 0 && (
              <button
                onClick={handleValidate}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Valider
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit dropdowns for existing conditions ── */}

      {editDD && editDD.field === "operator" && editOps.length > 0 && (
        <div
          ref={editDDRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setEditDD(null);
            }
          }}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(editDD.top, editDD.left, 180)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Opérateur
            </p>
          </div>
          <OperatorList
            operators={editOps}
            currentOpId={editCond?.operator}
            onSelect={(op) => {
              updateCond(editDD.row, {
                operator: op.id,
                value: op.noValue ? null : conditions[editDD.row].value,
              });
              setEditDD(null);
            }}
          />
        </div>
      )}

      {editDD && editDD.field === "value" && editCond?.columnId && (
        <div
          ref={editDDRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setEditDD(null);
            }
          }}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(editDD.top, editDD.left, 200)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Valeur
            </p>
          </div>
          <ValueOptions
            columnId={editCond.columnId}
            value={editCond.value}
            onChange={(newVal) => updateCond(editDD.row, { value: newVal })}
            onApply={(val) => {
              updateCond(editDD.row, { value: val });
              setEditDD(null);
            }}
          />
        </div>
      )}

      {/* ── Cascading dropdowns for adding new conditions ── */}

      {showColumnPicker && (
        <div
          ref={colPickerRef}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(cascadePos.top, cascadePos.left, 220)}
        >
          <ColumnList
            columns={columns}
            usedColumnIds={[]}
            onSelect={handleColSelect}
            placeholder="Colonne…"
          />
        </div>
      )}

      {showColumnPicker && addingColId && (
        <div
          ref={opDropdownRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setAddingColId(null);
              setAddingOpId(null);
              colPickerRef.current?.querySelector("input")?.focus();
            }
          }}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(opMenuPos.top, opMenuPos.left, 180)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Opérateur
            </p>
          </div>
          <OperatorList
            operators={addingOps}
            currentOpId={addingOpId}
            onSelect={handleOpSelect}
          />
        </div>
      )}

      {showColumnPicker && addingColId && addingOpId && (
        <div
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setAddingOpId(null);
              // useLayoutEffect va re-focus le dropdown opérateur
            }
          }}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(valMenuPos.top, valMenuPos.left, 200)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Valeur
            </p>
          </div>
          <ValueOptions
            columnId={addingColId}
            value={addingValue}
            onChange={handleValueChange}
            onApply={handleValueApply}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADVANCED FILTER CHIP — inline display of conditions
   ═══════════════════════════════════════════════════════ */
function AdvancedFilterChip({ filter, columns, onEdit, onRemove, devFilterRules, ownerFilterRules, editorRole = "dev", onSetFilterRule, lockedDisplay = "visible" }) {
  const [accessOpen, setAccessOpen] = useState(false);
  const accessBtnRef = useRef(null);

  // Pire niveau d'accès défini pour ce filtre (indicateur coloré)
  const filterDevRules = devFilterRules?.get(filter.id) || {};
  const filterOwnerRules = ownerFilterRules?.get(filter.id) || {};
  const allRuleValues = editorRole === "dev"
    ? Object.values(filterDevRules)
    : Object.values(filterOwnerRules);
  const worstAccess = allRuleValues.reduce(
    (worst, rule) => FILTER_ACCESS_ORDER.indexOf(rule) > FILTER_ACCESS_ORDER.indexOf(worst) ? rule : worst,
    "visible"
  );
  const hasRestrictions = worstAccess !== "visible";
  const worstLevel = FILTER_ACCESS_LEVELS.find((l) => l.id === worstAccess);

  const renderCondition = (cond) => {
    const col = columns.find((c) => c.id === cond.columnId);
    if (!col) return null;
    const category = getOperatorCategory(col.type);
    const ops = OPERATORS[category] || [];
    const op = ops.find((o) => o.id === cond.operator);
    const tc = COLUMN_TYPES[col.type];
    const CIcon = tc?.icon;
    return (
      <span className="inline-flex items-center gap-1">
        {CIcon && <CIcon size={11} className="text-zinc-400 dark:text-zinc-500" />}
        <span className="font-medium">{col.name}</span>
        {op && <span className="text-zinc-400">{op.label}</span>}
        {op && !op.noValue && (
          <span className="font-medium">
            <ValueDisplay columnId={cond.columnId} value={cond.value} />
          </span>
        )}
      </span>
    );
  };

  if (filter.locked && lockedDisplay === "ask") {
    const askColNames = [...new Set(
      filter.conditions.map(c => columns.find(col => col.id === c.columnId)?.name).filter(Boolean)
    )];
    const askLabel = askColNames.length === 0 ? ""
      : askColNames.length === 1 ? ` sur ${askColNames[0]}`
      : ` sur ${askColNames.slice(0, -1).join(", ")} et ${askColNames.at(-1)}`;
    return (
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 dark:text-zinc-500 select-none">
          <Lock size={12} />
          <span className="text-xs">Filtre restreint{askLabel}</span>
        </div>
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        <button className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
          Demander l'accès
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-all dark:border-zinc-700 dark:bg-zinc-900">
        {/* Condition text */}
        <button
          onClick={filter.locked ? undefined : onEdit}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 ${filter.locked ? "cursor-default" : "cursor-pointer"}`}
        >
          {filter.conditions.map((cond, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && (
                <span className="text-zinc-400 mx-0.5">
                  {filter.logic === "and" ? "et" : "ou"}
                </span>
              )}
              {renderCondition(cond)}
            </span>
          ))}
        </button>

        {/* Access rule button */}
        {onSetFilterRule && (
          <>
            <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
            <button
              ref={accessBtnRef}
              onClick={() => setAccessOpen((s) => !s)}
              title={hasRestrictions ? `Visibilité : ${worstLevel?.label}` : "Définir la visibilité par rôle"}
              className={`px-1.5 py-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                hasRestrictions
                  ? worstLevel?.color
                  : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500"
              }`}
            >
              <Key size={11} />
            </button>
          </>
        )}

        {/* Lock icon (filtre imposé) ou bouton supprimer (filtre personnel) */}
        {filter.locked ? (
          <>
            <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
            <div className="px-1.5 py-1 text-zinc-400 dark:text-zinc-500">
              <Lock size={11} />
            </div>
          </>
        ) : (
          <>
            <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
            <button
              onClick={onRemove}
              aria-label="Supprimer ce filtre avancé"
              className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X size={11} />
            </button>
          </>
        )}
      </div>

      {/* Filter access rule popover */}
      {accessOpen && onSetFilterRule && (
        <AccessRulePopover
          itemId={filter.id}
          type="filter"
          devRules={devFilterRules}
          ownerRules={ownerFilterRules}
          editorRole={editorRole}
          onSetRule={onSetFilterRule}
          anchorRef={accessBtnRef}
          onClose={() => setAccessOpen(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   FILTER DROPDOWN — column picker + cascading sub-dropdowns
   Click-only. Multi-select for values (filter created on close).
   "Filtre avancé" option at top.
   ═══════════════════════════════════════════════════════ */
function FilterDropdown({
  isOpen,
  coords,
  popoverRef,
  columns,
  usedColumnIds,
  onAddSimple,
  onUpdate,
  onAdvancedClick,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [activeColId, setActiveColId] = useState(null);
  const [activeOpId, setActiveOpId] = useState(null);
  const [pendingValue, setPendingValue] = useState(null);
  const [buildingId, setBuildingId] = useState(null);
  const [opMenuPos, setOpMenuPos] = useState({ top: 0, left: 0 });
  const [valMenuPos, setValMenuPos] = useState({ top: 0, left: 0 });
  const filterSearchRef = useRef(null);
  const filterColListRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveColId(null);
      setActiveOpId(null);
      setPendingValue(null);
      setBuildingId(null);
    }
  }, [isOpen]);

  const activeCol = activeColId
    ? columns.find((c) => c.id === activeColId)
    : null;
  const category = activeCol ? getOperatorCategory(activeCol.type) : null;
  const operators = category ? OPERATORS[category] || [] : [];

  const filtered = columns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openOpMenu = (colId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const left = rect.right + 2;
    const flipLeft = left + 180 > window.innerWidth;
    // Immediately add a partial filter chip
    const id = `f_${Date.now()}`;
    setBuildingId(id);
    setActiveColId(colId);
    setActiveOpId(null);
    setPendingValue(null);
    onAddSimple({ id, columnId: colId, operator: null, value: null });
    setOpMenuPos({
      top: Math.min(rect.top, window.innerHeight - 300),
      left: flipLeft ? rect.left - 184 : left,
    });
  };

  const handleOpSelect = (op, currentBuildingId, currentColId) => {
    onUpdate({
      id: currentBuildingId,
      columnId: currentColId,
      operator: op.id,
      value: null,
      locked: false,
    });
    if (op.noValue) {
      onClose();
    } else {
      setActiveOpId(op.id);
      setPendingValue(null);
      setValMenuPos({ top: opMenuPos.top, left: opMenuPos.left + 184 });
    }
  };

  const handleValueChange = (
    newVal,
    currentBuildingId,
    currentColId,
    currentOpId,
  ) => {
    const mock = MOCK_VALUES[currentColId];
    setPendingValue(newVal);
    onUpdate({
      id: currentBuildingId,
      columnId: currentColId,
      operator: currentOpId,
      value: newVal,
      locked: false,
    });
    if (mock?.type === "number") onClose();
  };

  if (!isOpen) return null;

  const { top: safeTop, left: safeLeft } = clampPos(
    coords.top,
    coords.left,
    220,
  );

  return (
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        zIndex: 99999,
      }}
    >
      {/* Main dropdown */}
      <div
        className="fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        style={{
          top: safeTop,
          left: safeLeft,
          minWidth: 220,
          maxWidth: "calc(100vw - 16px)",
        }}
      >
        {/* Search */}
        <div className="flex items-center px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <input
            ref={filterSearchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                filterColListRef.current?.querySelector("button")?.focus();
              }
            }}
            placeholder="Colonne…"
            className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-300 text-zinc-700 dark:text-zinc-200 dark:placeholder-zinc-600"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Filtre avancé */}
        <div className="p-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onAdvancedClick}
            className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <span className="font-medium">Filtre avancé</span>
            <ChevronRight size={12} className="ml-auto text-zinc-300" />
          </button>
        </div>

        {/* Column list */}
        <div ref={filterColListRef} role="listbox" className="max-h-[280px] overflow-y-auto p-1">
          {filtered.map((col) => {
            const cTc = COLUMN_TYPES[col.type];
            const CIcon = cTc?.icon;
            const isUsed = usedColumnIds.includes(col.id);
            const isActive = col.id === activeColId;
            return (
              <button
                key={col.id}
                role="option"
                aria-selected={isActive}
                onClick={(e) => openOpMenu(col.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    e.currentTarget.nextElementSibling?.focus();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = e.currentTarget.previousElementSibling;
                    if (prev) prev.focus();
                    else filterSearchRef.current?.focus();
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    openOpMenu(col.id, e);
                  }
                }}
                className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
                }`}
              >
                {CIcon && (
                  <CIcon
                    size={14}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                )}
                <span className="flex-1 text-left">{col.name}</span>
                {isUsed ? (
                  <Check size={12} className="text-zinc-400" />
                ) : (
                  <ChevronRight
                    size={12}
                    className={isActive ? "text-zinc-500" : "text-zinc-300"}
                  />
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-4">
              Aucune colonne trouvée
            </p>
          )}
        </div>
        {/* Keyboard hint */}
        <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Naviguer</span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Sélectionner</span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Échap</kbd> Fermer</span>
        </div>
      </div>

      {/* Sub-dropdown: operators */}
      {activeColId && (
        <div
          className="fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(opMenuPos.top, opMenuPos.left, 180)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Opérateur
            </p>
          </div>
          <OperatorList
            operators={operators}
            currentOpId={activeOpId}
            onSelect={(op) => handleOpSelect(op, buildingId, activeColId)}
          />
        </div>
      )}

      {/* Sub-sub-dropdown: values */}
      {activeColId && activeOpId && (
        <div
          className="fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(valMenuPos.top, valMenuPos.left, 200)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Valeur
            </p>
          </div>
          <ValueOptions
            columnId={activeColId}
            value={pendingValue}
            onChange={(val) =>
              handleValueChange(val, buildingId, activeColId, activeOpId)
            }
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COLUMN PICKER — for sort
   ═══════════════════════════════════════════════════════ */
function ColumnPicker({
  isOpen,
  coords,
  popoverRef,
  columns,
  usedColumnIds,
  onSelect,
}) {
  return (
    <FixedPopover
      isOpen={isOpen}
      coords={coords}
      popoverRef={popoverRef}
      minWidth={220}
    >
      <ColumnList
        columns={columns}
        usedColumnIds={usedColumnIds}
        onSelect={onSelect}
        placeholder="Colonne…"
      />
    </FixedPopover>
  );
}

/* ═══════════════════════════════════════════════════════
   FILTER CHIP — button group with icons, dots, avatars
   ═══════════════════════════════════════════════════════ */
function FilterChip({ filter, columns, onUpdate, onRemove, canEditAccess, devFilterRules, ownerFilterRules, editorRole, onSetFilterRule, lockedDisplay = "visible" }) {
  const operatorPop = usePopover();
  const valuePop = usePopover();
  const [accessOpen, setAccessOpen] = useState(false);
  const accessBtnRef = useRef(null);

  // Indicateur de restriction (même logique que AdvancedFilterChip)
  const filterDevRules   = devFilterRules?.get(filter.id) || {};
  const filterOwnerRules = ownerFilterRules?.get(filter.id) || {};
  const allRuleValues    = editorRole === "dev" ? Object.values(filterDevRules) : Object.values(filterOwnerRules);
  const worstAccess = allRuleValues.reduce(
    (worst, rule) => FILTER_ACCESS_ORDER.indexOf(rule) > FILTER_ACCESS_ORDER.indexOf(worst) ? rule : worst,
    "visible"
  );
  const hasRestrictions = worstAccess !== "visible";
  const worstLevel = FILTER_ACCESS_LEVELS.find((l) => l.id === worstAccess);

  const column = columns.find((c) => c.id === filter.columnId);
  if (!column) return null;

  const tc = COLUMN_TYPES[column.type];
  const Icon = tc?.icon;
  const category = getOperatorCategory(column.type);
  const operators = OPERATORS[category] || [];
  const currentOp = operators.find((op) => op.id === filter.operator);
  const isLocked = filter.locked;

  if (isLocked) {
    // Chip "accès restreint" : cadenas + bouton demander l'accès
    if (lockedDisplay === "ask") {
      return (
        <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 dark:text-zinc-500 select-none">
            <Lock size={12} />
            <span className="text-xs">Filtre restreint sur {column.name}</span>
          </div>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
          <button className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            Demander l'accès
          </button>
        </div>
      );
    }
    // Chip "visible non modifiable" : chip complet avec cadenas gris
    return (
      <div
        className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        title="Filtre imposé — non modifiable"
      >
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 text-zinc-500 select-none dark:bg-zinc-800/50 dark:text-zinc-200">
          {Icon && <Icon size={12} className="text-zinc-400 dark:text-zinc-500" />}
          <span className="text-xs font-medium">{column.name}</span>
        </div>
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        <div className="px-2 py-1 text-xs text-zinc-400 dark:text-zinc-500">
          {currentOp?.label}
        </div>
        {!currentOp?.noValue && filter.value != null && (
          <>
            <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-200">
              <ValueDisplay columnId={filter.columnId} value={filter.value} />
            </div>
          </>
        )}
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        <div className="px-1.5 py-1 text-zinc-400">
          <Lock size={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 text-zinc-500 select-none dark:bg-zinc-800/50 dark:text-zinc-200">
        {Icon && (
          <Icon size={12} className="text-zinc-400 dark:text-zinc-500" />
        )}
        <span className="text-xs font-medium">{column.name}</span>
      </div>

      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />

      <button
        ref={operatorPop.triggerRef}
        onClick={operatorPop.toggle}
        aria-expanded={operatorPop.isOpen}
        aria-haspopup="listbox"
        aria-label={`Opérateur: ${currentOp?.label || "choisir"}`}
        className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer dark:text-zinc-500 dark:hover:bg-zinc-800"
      >
        {currentOp?.label || "…"}
        <ChevronDown size={10} className="text-zinc-300 dark:text-zinc-600" />
      </button>

      <FixedPopover
        isOpen={operatorPop.isOpen}
        coords={operatorPop.coords}
        popoverRef={operatorPop.popoverRef}
        minWidth={180}
      >
        <OperatorList
          operators={operators}
          currentOpId={filter.operator}
          onSelect={(op) => {
            onUpdate({
              ...filter,
              operator: op.id,
              value: op.noValue ? null : filter.value,
            });
            operatorPop.close();
          }}
        />
      </FixedPopover>

      {!currentOp?.noValue && (
        <>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
          <button
            ref={valuePop.triggerRef}
            onClick={valuePop.toggle}
            aria-expanded={valuePop.isOpen}
            aria-haspopup="listbox"
            aria-label="Valeur du filtre"
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ValueDisplay columnId={filter.columnId} value={filter.value} />
            <ChevronDown size={10} className="text-zinc-400" />
          </button>

          <FixedPopover
            isOpen={valuePop.isOpen}
            coords={valuePop.coords}
            popoverRef={valuePop.popoverRef}
            minWidth={200}
          >
            <ValueOptions
              columnId={filter.columnId}
              value={filter.value}
              onChange={(newVal) => onUpdate({ ...filter, value: newVal })}
            />
          </FixedPopover>
        </>
      )}

      {onSetFilterRule && (
        <>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
          <button
            ref={accessBtnRef}
            onClick={() => setAccessOpen((s) => !s)}
            title={hasRestrictions ? `Visibilité : ${worstLevel?.label}` : "Définir la visibilité par rôle"}
            className={`px-1.5 py-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${hasRestrictions ? worstLevel?.color : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500"}`}
          >
            <Key size={11} />
          </button>
        </>
      )}
      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={onRemove}
        aria-label="Supprimer ce filtre"
        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <X size={12} />
      </button>

      {accessOpen && canEditAccess && (
        <AccessRulePopover
          itemId={filter.id}
          type="filter"
          devRules={devFilterRules}
          ownerRules={ownerFilterRules}
          editorRole={editorRole}
          onSetRule={onSetFilterRule}
          anchorRef={accessBtnRef}
          onClose={() => setAccessOpen(false)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SORT ORDER ITEM / OVERLAY  (dnd-kit)
   ═══════════════════════════════════════════════════════ */
function SortOrderItem({ label, idx, vis }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
        ${isDragging ? "opacity-30 cursor-grabbing" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
    >
      <span
        {...attributes}
        {...listeners}
        aria-label={`Déplacer "${label}"`}
        className="w-0.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <span className="text-[10px] text-zinc-300 w-4 text-center flex-shrink-0">
        {idx + 1}
      </span>
      {vis?.Icon && (
        <vis.Icon size={14} className={`flex-shrink-0 ${vis.iconColor}`} />
      )}
      {vis?.dot && (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${vis.dot}`} />
      )}
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
    </div>
  );
}

function SortOrderOverlay({ label, vis }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl cursor-grabbing">
      <span className="w-0.5 h-3.5 rounded-full bg-zinc-400 dark:bg-zinc-500 flex-shrink-0" />
      <span className="text-[10px] text-zinc-300 w-4 text-center flex-shrink-0">
        ·
      </span>
      {vis?.Icon && (
        <vis.Icon size={14} className={`flex-shrink-0 ${vis.iconColor}`} />
      )}
      {vis?.dot && (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${vis.dot}`} />
      )}
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SORT CHIP
   ═══════════════════════════════════════════════════════ */
function SortChip({ sort, columns, onUpdate, onRemove }) {
  const column = columns.find((c) => c.id === sort.columnId);
  if (!column) return null;
  const tc = COLUMN_TYPES[column.type];
  const Icon = tc?.icon;
  const orderPop = usePopover();
  const [activeOrderId, setActiveOrderId] = useState(null);

  const mock = MOCK_VALUES[sort.columnId];
  const hasCustomOrder = !!sort.customOrder;

  const emailModePop = usePopover();
  const fileModePop = usePopover();
  const phoneModePop = usePopover();
  const locationModePop = usePopover();
  const orderSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const isEmail = column.type === "email";
  const isFile = column.type === "file";
  const isPhone = column.type === "phone";
  const isLocation = column.type === "location";
  const isNum = ["number", "formula", "rollup"].includes(column.type);
  const isDate = ["date", "created_modified"].includes(column.type);
  const isCheckbox = column.type === "checkbox";
  const isEmoji = column.type === "emoji";

  let ascLabel, descLabel;
  if (hasCustomOrder) {
    const order = sort.customOrder;
    ascLabel = `${order[0]} → ${order[order.length - 1]}`;
    descLabel = `${order[order.length - 1]} → ${order[0]}`;
  } else if (isNum || isPhone) {
    ascLabel = "0 → 9";
    descLabel = "9 → 0";
  } else if (isDate) {
    ascLabel = "Ancien → Récent";
    descLabel = "Récent → Ancien";
  } else if (isCheckbox) {
    ascLabel = "Non coché → Coché";
    descLabel = "Coché → Non coché";
  } else if (isEmoji) {
    ascLabel = "Croissant";
    descLabel = "Décroissant";
  } else {
    ascLabel = "A → Z";
    descLabel = "Z → A";
  }

  const getItemVisual = (label) => {
    if (!mock?.items) return null;
    const item = mock.items.find(
      (i) => (typeof i === "object" ? i.label : i) === label,
    );
    if (typeof item === "object" && item.icon)
      return { Icon: item.icon, iconColor: item.iconColor };
    if (typeof item === "object" && item.color) return { dot: item.color };
    return null;
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 text-zinc-500 select-none dark:bg-zinc-800/50 dark:text-zinc-200">
        {Icon && (
          <Icon size={12} className="text-zinc-400 dark:text-zinc-500" />
        )}
        <span className="text-xs font-medium">{column.name}</span>
      </div>
      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />

      {/* Email sort mode toggle */}
      {isEmail && (
        <>
          <button
            ref={emailModePop.triggerRef}
            onClick={emailModePop.toggle}
            aria-expanded={emailModePop.isOpen}
            aria-haspopup="listbox"
            aria-label="Mode de tri Email"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "domain" ? "Domaine" : "Adresse"}
            <ChevronDown size={10} className="text-zinc-400" />
          </button>
          <FixedPopover
            isOpen={emailModePop.isOpen}
            coords={emailModePop.coords}
            popoverRef={emailModePop.popoverRef}
            minWidth={140}
          >
            <div className="p-1">
              {[
                { id: "address", label: "Adresse complète" },
                { id: "domain", label: "Domaine" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdate({ ...sort, sortBy: opt.id });
                    emailModePop.close();
                  }}
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    sort.sortBy === opt.id
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort.sortBy === opt.id && (
                    <Check size={12} className="text-zinc-400" />
                  )}
                </button>
              ))}
            </div>
          </FixedPopover>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        </>
      )}

      {/* File sort mode toggle */}
      {isFile && (
        <>
          <button
            ref={fileModePop.triggerRef}
            onClick={fileModePop.toggle}
            aria-expanded={fileModePop.isOpen}
            aria-haspopup="listbox"
            aria-label="Mode de tri Fichier"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "file_type" ? "Type" : "Nom"}
            <ChevronDown size={10} className="text-zinc-400" />
          </button>
          <FixedPopover
            isOpen={fileModePop.isOpen}
            coords={fileModePop.coords}
            popoverRef={fileModePop.popoverRef}
            minWidth={160}
          >
            <div className="p-1">
              {[
                { id: "file_name", label: "Nom du fichier" },
                { id: "file_type", label: "Type de fichier" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdate({ ...sort, sortBy: opt.id });
                    fileModePop.close();
                  }}
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    sort.sortBy === opt.id
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort.sortBy === opt.id && (
                    <Check size={12} className="text-zinc-400" />
                  )}
                </button>
              ))}
            </div>
          </FixedPopover>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        </>
      )}

      {/* Phone sort mode toggle */}
      {isPhone && (
        <>
          <button
            ref={phoneModePop.triggerRef}
            onClick={phoneModePop.toggle}
            aria-expanded={phoneModePop.isOpen}
            aria-haspopup="listbox"
            aria-label="Mode de tri Téléphone"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "after_prefix" ? "Après préfixe" : "Préfixe"}
            <ChevronDown size={10} className="text-zinc-400" />
          </button>
          <FixedPopover
            isOpen={phoneModePop.isOpen}
            coords={phoneModePop.coords}
            popoverRef={phoneModePop.popoverRef}
            minWidth={160}
          >
            <div className="p-1">
              {[
                { id: "prefix", label: "Préfixe" },
                { id: "after_prefix", label: "Après le préfixe" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdate({ ...sort, sortBy: opt.id });
                    phoneModePop.close();
                  }}
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    sort.sortBy === opt.id
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort.sortBy === opt.id && (
                    <Check size={12} className="text-zinc-400" />
                  )}
                </button>
              ))}
            </div>
          </FixedPopover>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        </>
      )}

      {/* Location sort mode toggle */}
      {isLocation && (
        <>
          <button
            ref={locationModePop.triggerRef}
            onClick={locationModePop.toggle}
            aria-expanded={locationModePop.isOpen}
            aria-haspopup="listbox"
            aria-label="Mode de tri Lieu"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {{
              address: "Adresse",
              street: "Rue",
              city: "Ville",
              country: "Pays",
            }[sort.sortBy] ?? "Adresse"}
            <ChevronDown size={10} className="text-zinc-400" />
          </button>
          <FixedPopover
            isOpen={locationModePop.isOpen}
            coords={locationModePop.coords}
            popoverRef={locationModePop.popoverRef}
            minWidth={160}
          >
            <div className="p-1">
              {[
                { id: "address", label: "Adresse complète" },
                { id: "street", label: "Rue" },
                { id: "city", label: "Ville" },
                { id: "country", label: "Pays" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onUpdate({ ...sort, sortBy: opt.id });
                    locationModePop.close();
                  }}
                  className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    sort.sortBy === opt.id
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex-1 text-left">{opt.label}</span>
                  {sort.sortBy === opt.id && (
                    <Check size={12} className="text-zinc-400" />
                  )}
                </button>
              ))}
            </div>
          </FixedPopover>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        </>
      )}

      {/* Direction toggle */}
      <button
        onClick={() =>
          onUpdate({
            ...sort,
            direction: sort.direction === "asc" ? "desc" : "asc",
          })
        }
        aria-label={sort.direction === "asc" ? `Tri croissant — basculer en décroissant` : `Tri décroissant — basculer en croissant`}
        className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {sort.direction === "asc" ? (
          <ArrowUp size={11} />
        ) : (
          <ArrowDown size={11} />
        )}
        {sort.direction === "asc" ? ascLabel : descLabel}
      </button>

      {/* Order editor button (only for custom order columns) */}
      {hasCustomOrder && (
        <>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
          <button
            ref={orderPop.triggerRef}
            onClick={orderPop.toggle}
            aria-expanded={orderPop.isOpen}
            aria-haspopup="dialog"
            aria-label="Modifier l'ordre de tri"
            className="flex items-center gap-0.5 px-1.5 py-1 text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <ListOrdered size={12} />
          </button>
          <FixedPopover
            isOpen={orderPop.isOpen}
            coords={orderPop.coords}
            popoverRef={orderPop.popoverRef}
            minWidth={180}
          >
            <div className="px-2.5 pt-2 pb-1">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Ordre de tri
              </p>
            </div>
            <DndContext
              sensors={orderSensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => setActiveOrderId(active.id)}
              onDragEnd={({ active, over }) => {
                if (over && active.id !== over.id) {
                  const oldIdx = sort.customOrder.indexOf(active.id);
                  const newIdx = sort.customOrder.indexOf(over.id);
                  if (oldIdx !== -1 && newIdx !== -1)
                    onUpdate({
                      ...sort,
                      customOrder: arrayMove(sort.customOrder, oldIdx, newIdx),
                    });
                }
                setActiveOrderId(null);
              }}
              onDragCancel={() => setActiveOrderId(null)}
              accessibility={{
                screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS,
                announcements: {
                  onDragStart: ({ active }) => `Déplacement de "${active.id}" commencé. Utilisez les flèches pour déplacer, Espace pour déposer.`,
                  onDragOver: ({ active, over }) => over && over.id !== active.id ? `"${active.id}" au-dessus de "${over.id}".` : undefined,
                  onDragEnd: ({ active, over }) => over ? `"${active.id}" déposé à la position de "${over.id}".` : `Déplacement de "${active.id}" annulé.`,
                  onDragCancel: ({ active }) => `Déplacement de "${active.id}" annulé.`,
                },
              }}
            >
              <SortableContext
                items={sort.customOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="p-1 max-h-[300px] overflow-y-auto">
                  {sort.customOrder.map((label, idx) => (
                    <SortOrderItem
                      key={label}
                      label={label}
                      idx={idx}
                      vis={getItemVisual(label)}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeOrderId && (
                  <SortOrderOverlay
                    label={activeOrderId}
                    vis={getItemVisual(activeOrderId)}
                  />
                )}
              </DragOverlay>
            </DndContext>
          </FixedPopover>
        </>
      )}

      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={onRemove}
        aria-label="Supprimer ce tri"
        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACCESS RULE POPOVER  (style Notion / Linear)
   Permet de définir le niveau d'accès par rôle cible.
   type = "col" | "filter"
   editorRole = "dev" (peut régler owner + user) | "owner" (peut régler user seulement)
   ═══════════════════════════════════════════════════════ */
function AccessRulePopover({ itemId, type = "col", devRules, ownerRules, editorRole = "dev", onSetRule, anchorRef, onClose }) {
  const popRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const levels = type === "col" ? COL_ACCESS_LEVELS : FILTER_ACCESS_LEVELS;
  const defaultVal = type === "col" ? "full" : "visible";

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const popWidth = 220;
    const left = Math.min(r.right - popWidth, window.innerWidth - popWidth - 8);
    setCoords({ top: r.bottom + 6, left: Math.max(8, left) });
  }, [anchorRef]);

  // Valeur courante : on utilise le premier rôle cible comme référence (owner si dev, user si owner)
  const currentRule = editorRole === "dev"
    ? (devRules?.get(itemId)?.owner ?? defaultVal)
    : (ownerRules?.get(itemId)?.user ?? defaultVal);

  // Appliquer à tous les rôles cibles de l'éditeur (toggle : recliquer enlève la restriction)
  const applyRule = (levelId) => {
    const next = levelId === currentRule ? (type === "col" ? "full" : "visible") : levelId;
    if (editorRole === "dev") {
      onSetRule(itemId, "owner", next);
      onSetRule(itemId, "user",  next);
    } else {
      onSetRule(itemId, "user", next);
    }
  };

  const header = type === "col" ? "Restrictions d'accès" : "Visibilité du filtre";

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />
      <div
        ref={popRef}
        style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999, width: 220 }}
        className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-3 pt-2.5 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {header}
          </p>
        </div>

        {/* Sélecteur unifié "pour les autres" */}
        <div className="px-3 py-2.5">
          <div className="flex gap-1">
            {levels.map((level) => {
              const active = currentRule === level.id;
              const { Icon } = level;
              return (
                <button
                  key={level.id}
                  title={`${level.label} — ${level.desc}`}
                  onClick={() => applyRule(level.id)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md border text-xs transition-all ${
                    active
                      ? `${level.color} ${level.activeBg}`
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-500"
                  }`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5 leading-tight">
            {levels.find((l) => l.id === currentRule)?.desc ?? (type === "col" ? "Accès par défaut — visible et éditable" : "Filtre visible par défaut")}
          </p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   COLUMN VISIBILITY DROPDOWN  (dnd-kit)
   ═══════════════════════════════════════════════════════ */
function ColVisItem({
  col,
  hiddenColumns,
  lockedHiddenColumns,
  onToggle,
  devColRules,
  ownerColRules,
  editorRole = "dev",
  onSetRule,
  previewRole = "dev",
  isForAllView = false,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const accessBtnRef = useRef(null);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: col.id });
  const tc = COLUMN_TYPES[col.type];
  const CIcon = tc?.icon;
  const isHidden = hiddenColumns.has(col.id);
  const isLocked = lockedHiddenColumns.has(col.id);

  // Pire niveau d'accès défini pour cette colonne (indicateur sur le bouton Key)
  const colDevRulesForItem = devColRules?.get(col.id) || {};
  const colOwnerRulesForItem = ownerColRules?.get(col.id) || {};
  const allRuleValues = editorRole === "dev"
    ? Object.values(colDevRulesForItem)
    : Object.values(colOwnerRulesForItem);
  const worstAccess = allRuleValues.reduce(
    (worst, rule) => COL_ACCESS_ORDER.indexOf(rule) > COL_ACCESS_ORDER.indexOf(worst) ? rule : worst,
    "full"
  );
  const hasRestrictions = worstAccess !== "full";
  const worstLevel = COL_ACCESS_LEVELS.find((l) => l.id === worstAccess);

  // Accès effectif pour le rôle en cours de prévisualisation
  const effectiveAccess = previewRole === "dev" ? "full"
    : previewRole === "owner" ? (devColRules?.get(col.id)?.owner ?? "full")
    : mostRestrictiveCol(devColRules?.get(col.id)?.user ?? "full", ownerColRules?.get(col.id)?.user ?? "full");
  const isUserView = previewRole === "user";
  // Peut configurer les restrictions : accès "full" soi-même ET on est sur vue par défaut ou vue pour tous
  const canConfigureAccess = !isUserView && effectiveAccess === "full" && isForAllView;
  // Doit voir "Demander l'accès" : tout rôle non-dev avec accès "ask"
  const showRequestAccess = previewRole !== "dev" && effectiveAccess === "ask";

  if (isLocked) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...attributes}
        title="Colonne masquée par l'administrateur"
        className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-400 dark:text-zinc-600 cursor-default"
      >
        <span className="flex-shrink-0 w-0.5 h-3.5" />
        {CIcon && <CIcon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />}
        <span className="flex-1 text-left opacity-40">{col.name}</span>
        <EyeOff size={12} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
        <Lock size={10} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group w-full rounded-md ${isDragging ? "opacity-30" : ""}`}
    >
      <div
        data-colvis-row
        tabIndex={0}
        onClick={() => !isDragging && onToggle(col.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(col.id);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const rows = e.currentTarget.closest("[class*='overflow-y-auto']")?.querySelectorAll("[data-colvis-row]");
            if (rows) {
              const idx = Array.from(rows).indexOf(e.currentTarget);
              rows[idx + 1]?.focus();
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const rows = e.currentTarget.closest("[class*='overflow-y-auto']")?.querySelectorAll("[data-colvis-row]");
            if (rows) {
              const idx = Array.from(rows).indexOf(e.currentTarget);
              if (idx === 0) {
                e.currentTarget.closest("[class*='overflow-y-auto']")?.closest(".rounded-lg")?.querySelector("input")?.focus();
              } else {
                rows[idx - 1]?.focus();
              }
            }
          }
        }}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors outline-none
          ${isHidden ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400"}
          ${isDragging ? "cursor-grabbing" : "hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 cursor-pointer"}`}
      >
        <span
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Déplacer la colonne ${col.name}`}
          className="flex-shrink-0 w-0.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        {CIcon && <CIcon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />}
        <span className={`flex-1 text-left ${isHidden ? "opacity-40" : ""}`}>{col.name}</span>

        {/* Œil : visibilité personnelle (Dev) */}
        {isHidden
          ? <EyeOff size={12} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
          : <Eye size={12} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        }

        {/* Owner/User : "Demander l'accès" si accès ask */}
        {showRequestAccess && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-amber-600 dark:text-amber-400 underline hover:no-underline flex-shrink-0 transition-colors"
          >
            Demander l'accès
          </button>
        )}
        {/* Dev / Owner avec accès full : bouton Key pour configurer les restrictions */}
        {canConfigureAccess && (
          <button
            ref={accessBtnRef}
            onClick={(e) => { e.stopPropagation(); setPickerOpen((s) => !s); }}
            title={hasRestrictions ? `Accès restreint : ${worstLevel?.label}` : "Définir les restrictions d'accès"}
            className={`flex items-center justify-center w-5 h-5 rounded transition-all flex-shrink-0 ${
              hasRestrictions
                ? `${worstLevel?.color}`
                : "text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Key size={11} />
          </button>
        )}
      </div>

      {/* Access rule popover */}
      {pickerOpen && canConfigureAccess && (
        <AccessRulePopover
          itemId={col.id}
          type="col"
          devRules={devColRules}
          ownerRules={ownerColRules}
          editorRole={editorRole}
          onSetRule={onSetRule}
          anchorRef={accessBtnRef}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function ColVisOverlay({ col, hiddenColumns, lockedHiddenColumns }) {
  if (!col) return null;
  const tc = COLUMN_TYPES[col.type];
  const CIcon = tc?.icon;
  const isHidden = hiddenColumns.has(col.id);
  const isLocked = lockedHiddenColumns.has(col.id);
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl cursor-grabbing min-w-[180px]
      ${isLocked || isHidden ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400"}`}
    >
      <span className="flex-shrink-0 w-0.5 h-3.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      {CIcon && (
        <CIcon
          size={13}
          className="text-zinc-400 dark:text-zinc-500 flex-shrink-0"
        />
      )}
      <span
        className={`flex-1 text-left ${isLocked || isHidden ? "opacity-40" : ""}`}
      >
        {col.name}
      </span>
      {isLocked ? (
        <>
          <EyeOff
            size={12}
            className="text-zinc-300 dark:text-zinc-600 flex-shrink-0"
          />
          <Lock
            size={10}
            className="text-zinc-300 dark:text-zinc-600 flex-shrink-0"
          />
        </>
      ) : isHidden ? (
        <EyeOff
          size={12}
          className="text-zinc-300 dark:text-zinc-600 flex-shrink-0"
        />
      ) : (
        <Eye
          size={12}
          className="text-zinc-400 dark:text-zinc-500 flex-shrink-0"
        />
      )}
    </div>
  );
}

function ColumnVisibilityDropdown({
  isOpen,
  coords,
  popoverRef,
  columns,
  hiddenColumns,
  lockedHiddenColumns,
  onToggle,
  onReorder,
  devColRules,
  ownerColRules,
  editorRole = "dev",
  onSetColRule,
  previewRole = "dev",
  isForAllView = false,
}) {
  const [activeId, setActiveId] = useState(null);
  const [colSearch, setColSearch] = useState("");
  const colSearchRef = useRef(null);
  const colListRef = useRef(null);
  // columns est déjà filtré (sans les colonnes "none") par le parent
  const filteredColumns = colSearch.trim()
    ? columns.filter((c) =>
        c.name.toLowerCase().includes(colSearch.toLowerCase()),
      )
    : columns;
  const toggleableColumns = columns.filter(
    (c) => !lockedHiddenColumns.has(c.id),
  );
  const noneHidden = hiddenColumns.size === 0;
  const ids = columns.map((c) => c.id);
  const activeCol = columns.find((c) => c.id === activeId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <FixedPopover
      isOpen={isOpen}
      coords={coords}
      popoverRef={popoverRef}
      minWidth={200}
    >
      <div className="px-2.5 pt-2 pb-1 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Colonnes
        </p>
        <button
          onClick={() =>
            toggleableColumns.forEach((c) => onToggle(c.id, noneHidden))
          }
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {noneHidden ? "Tout masquer" : "Tout afficher"}
        </button>
      </div>
      <div className="flex items-center px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
        <input
          ref={colSearchRef}
          type="text"
          value={colSearch}
          onChange={(e) => setColSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              colListRef.current?.querySelector("[data-colvis-row]")?.focus();
            }
          }}
          placeholder="Colonnes…"
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none text-zinc-700 placeholder-zinc-300 dark:text-zinc-200 dark:placeholder-zinc-600"
        />
        {colSearch && (
          <button
            onClick={() => setColSearch("")}
            aria-label="Effacer la recherche"
            className="text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
          >
            <X size={10} />
          </button>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) onReorder(active.id, over.id);
          setActiveId(null);
        }}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS,
          announcements: {
            onDragStart: ({ active }) => {
              const col = columns.find((c) => c.id === active.id);
              return `Déplacement de la colonne "${col?.name ?? active.id}" commencé. Utilisez les flèches pour déplacer, Espace pour déposer.`;
            },
            onDragOver: ({ active, over }) => {
              if (!over || over.id === active.id) return undefined;
              const col = columns.find((c) => c.id === over.id);
              return `Au-dessus de "${col?.name ?? over.id}".`;
            },
            onDragEnd: ({ active, over }) => {
              const name = columns.find((c) => c.id === active.id)?.name ?? active.id;
              if (over) {
                const overName = columns.find((c) => c.id === over.id)?.name ?? over.id;
                return `"${name}" déplacée à la position de "${overName}".`;
              }
              return `Déplacement de "${name}" annulé.`;
            },
            onDragCancel: ({ active }) => {
              const name = columns.find((c) => c.id === active.id)?.name ?? active.id;
              return `Déplacement de "${name}" annulé.`;
            },
          },
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div ref={colListRef} className="p-1 max-h-[320px] overflow-y-auto">
            {filteredColumns.map((col) => (
              <ColVisItem
                key={col.id}
                col={col}
                hiddenColumns={hiddenColumns}
                lockedHiddenColumns={lockedHiddenColumns}
                onToggle={onToggle}
                devColRules={devColRules}
                ownerColRules={ownerColRules}
                editorRole={editorRole}
                onSetRule={onSetColRule}
                previewRole={previewRole}
                isForAllView={isForAllView}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeCol && (
            <ColVisOverlay
              col={activeCol}
              hiddenColumns={hiddenColumns}
              lockedHiddenColumns={lockedHiddenColumns}
            />
          )}
        </DragOverlay>
      </DndContext>
    </FixedPopover>
  );
}

/* ═══════════════════════════════════════════════════════
   TABLE HEADER  (dnd-kit)
   ═══════════════════════════════════════════════════════ */
function ColHeader({ col, sorts, filters, onSortToggle, index }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });
  const tc = COLUMN_TYPES[col.type];
  const CIcon = tc?.icon;
  const sort = sorts.find((s) => s.columnId === col.id);
  const isFiltered = filters.some((f) => f.columnId === col.id);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && onSortToggle(col.id)}
      aria-label={`Colonne ${col.name}${sort ? `, tri ${sort.direction === "asc" ? "croissant" : "décroissant"}` : ""}`}
      className={`group flex items-center gap-1.5 pl-1.5 pr-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 transition-colors
        ${index === 0 ? "w-48" : "w-36"}
        ${sort ? "bg-zinc-50/60 dark:bg-zinc-800/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}
        ${isDragging ? "opacity-30 cursor-grabbing" : "cursor-pointer"}`}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 w-0.5 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {CIcon && (
        <CIcon
          size={12}
          className="text-zinc-400 dark:text-zinc-500 flex-shrink-0"
        />
      )}
      <span className="truncate flex-1 text-left">{col.name}</span>
      {isFiltered && (
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0" />
      )}
      {sort ? (
        sort.direction === "asc" ? (
          <ArrowUp
            size={11}
            className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
          />
        ) : (
          <ArrowDown
            size={11}
            className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
          />
        )
      ) : (
        <ArrowUpDown
          size={11}
          className="text-zinc-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </div>
  );
}

function ColHeaderOverlay({ col, sorts, filters }) {
  if (!col) return null;
  const tc = COLUMN_TYPES[col.type];
  const CIcon = tc?.icon;
  const sort = sorts.find((s) => s.columnId === col.id);
  const isFiltered = filters.some((f) => f.columnId === col.id);
  return (
    <div className="flex items-center gap-1.5 pl-1.5 pr-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-xl cursor-grabbing w-36">
      <span className="flex-shrink-0 w-0.5 h-3 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      {CIcon && (
        <CIcon
          size={12}
          className="text-zinc-400 dark:text-zinc-500 flex-shrink-0"
        />
      )}
      <span className="truncate flex-1 text-left">{col.name}</span>
      {isFiltered && (
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0" />
      )}
      {sort &&
        (sort.direction === "asc" ? (
          <ArrowUp
            size={11}
            className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
          />
        ) : (
          <ArrowDown
            size={11}
            className="text-zinc-500 dark:text-zinc-400 flex-shrink-0"
          />
        ))}
    </div>
  );
}

function TableHeader({
  columns,
  sorts,
  filters,
  onSortToggle,
  hiddenColumns,
  lockedHiddenColumns,
  onReorder,
}) {
  const [activeId, setActiveId] = useState(null);
  const visibleColumns = columns.filter(
    (c) => !hiddenColumns.has(c.id) && !lockedHiddenColumns.has(c.id),
  );
  const visibleIds = visibleColumns.map((c) => c.id);
  const activeCol = visibleColumns.find((c) => c.id === activeId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) onReorder(active.id, over.id);
        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        screenReaderInstructions: DND_SCREEN_READER_INSTRUCTIONS,
        announcements: {
          onDragStart: ({ active }) => {
            const col = visibleColumns.find((c) => c.id === active.id);
            return `Déplacement de la colonne "${col?.name ?? active.id}" commencé. Utilisez les flèches pour déplacer, Espace pour déposer.`;
          },
          onDragOver: ({ active, over }) => {
            if (!over || over.id === active.id) return undefined;
            const col = visibleColumns.find((c) => c.id === over.id);
            return `Au-dessus de "${col?.name ?? over.id}".`;
          },
          onDragEnd: ({ active, over }) => {
            const name = visibleColumns.find((c) => c.id === active.id)?.name ?? active.id;
            if (over) {
              const overName = visibleColumns.find((c) => c.id === over.id)?.name ?? over.id;
              return `"${name}" déplacée à la position de "${overName}".`;
            }
            return `Déplacement de "${name}" annulé.`;
          },
          onDragCancel: ({ active }) => {
            const name = visibleColumns.find((c) => c.id === active.id)?.name ?? active.id;
            return `Déplacement de "${name}" annulé.`;
          },
        },
      }}
    >
      <SortableContext
        items={visibleIds}
        strategy={horizontalListSortingStrategy}
      >
        <div className="font-sans flex overflow-x-auto border-t border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 select-none">
          <div className="w-10 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800" />
          {visibleColumns.map((col, i) => (
            <ColHeader
              key={col.id}
              col={col}
              sorts={sorts}
              filters={filters}
              onSortToggle={onSortToggle}
              index={i}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeCol && (
          <ColHeaderOverlay col={activeCol} sorts={sorts} filters={filters} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

/* ═══════════════════════════════════════════════════════
   VIEW SWITCHER
   ═══════════════════════════════════════════════════════ */
function ViewSwitcher({ roleData, onSelectView, onAddView, onDeleteView, onRenameView }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (renamingId && inputRef.current) inputRef.current.focus();
  }, [renamingId]);

  const startRename = (view) => {
    if (view.isDefault) return;
    setRenamingId(view.id);
    setRenameVal(view.name);
  };
  const commitRename = (id) => {
    onRenameView(id, renameVal.trim() || "Ma vue");
    setRenamingId(null);
  };

  const tabs = roleData.views;
  const canDelete = (tab) => !tab.isDefault && roleData.views.filter(v => !v.isDefault).length > 0;

  return (
    <div className="font-sans flex items-center bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto flex-shrink-0">
      {tabs.map(tab => {
        const isActive = tab.id === roleData.activeViewId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            onDoubleClick={() => startRename(tab)}
            className={`group relative flex items-center gap-1 px-3 py-2 text-xs cursor-pointer border-b-2 whitespace-nowrap transition-colors select-none ${
              isActive
                ? "border-zinc-800 dark:border-zinc-100 text-zinc-900 dark:text-zinc-50 font-medium"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            {renamingId === tab.id ? (
              <input
                ref={inputRef} value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onBlur={() => commitRename(tab.id)}
                onKeyDown={e => { if (e.key === "Enter") commitRename(tab.id); if (e.key === "Escape") setRenamingId(null); }}
                onClick={e => e.stopPropagation()}
                className="w-24 bg-transparent border-none outline-none text-xs font-medium"
              />
            ) : (
              <>
                {tab.isShared && <Users size={10} className="flex-shrink-0 text-emerald-500" />}
                <span>{tab.name}</span>
              </>
            )}
            {canDelete(tab) && (
              <button onClick={e => { e.stopPropagation(); onDeleteView(tab.id); }} className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}
      <button onClick={onAddView} title="Nouvelle vue" className="flex items-center justify-center px-2 py-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors flex-shrink-0">
        <Plus size={13} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function DataToolbar() {
  // ── Vues par rôle ─────────────────────────────────────────────
  // Chaque vue : { id, name, isDefault, isForOthers, filters, advancedFilters, hiddenColumns, columnOrder }
  // columnOrder fait partie de la vue mais n'est PAS poussé vers les autres.
  const INIT_COL_ORDER = MOCK_COLUMNS.map(c => c.id);
  const [roleViews, setRoleViews] = useState({
    dev: {
      views: [{
        id: "dev_default", name: "Vue par défaut", isDefault: true, isForOthers: false,
        filters: [],
        advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER],
        colRules: {},
      }],
      activeViewId: "dev_default",
    },
    owner: {
      views: [{ id: "owner_default", name: "Vue par défaut", isDefault: true, isForOthers: false, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER], colRules: {} }],
      activeViewId: "owner_default",
    },
    user: {
      views: [{ id: "user_default", name: "Vue par défaut", isDefault: true, isForOthers: false, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER], colRules: {} }],
      activeViewId: "user_default",
    },
  });
  // Feedback de sauvegarde
  const [saveStatus, setSaveStatus] = useState(null); // null | "saved" | "pushed"
  const [savePopOpen, setSavePopOpen] = useState(false);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const saveBtnRef = useRef(null);
  const savePopRef = useRef(null);
  useEffect(() => {
    if (!savePopOpen) return;
    const handler = (e) => {
      if (
        savePopRef.current && !savePopRef.current.contains(e.target) &&
        saveBtnRef.current && !saveBtnRef.current.contains(e.target)
      ) setSavePopOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [savePopOpen]);
  const [sorts, setSorts] = useState([
    { id: "s1", columnId: "col_date", direction: "desc" },
  ]);

  const filterDropdownPop = usePopover();
  const sortPickerPop = usePopover();
  const columnVisPop = usePopover();

  // ── Helper : mise à jour de la vue active du rôle ────────────
  const updateActiveView = (role, updater) => {
    const activeId = roleViews[role]?.activeViewId;
    if (!activeId) return;
    setRoleViews(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        views: prev[role].views.map(v =>
          v.id !== activeId ? v : typeof updater === "function" ? updater(v) : { ...v, ...updater }
        ),
      },
    }));
  };

  // ── Rôle de prévisualisation ──────────────────────────────────
  const [previewRole, setPreviewRole] = useState("dev");

  // ── Règles d'accès colonnes ───────────────────────────────────
  // Committed : dérivées des vues partagées sauvegardées — ne s'appliquent qu'après un "Vue pour tous"
  const devColRules = useMemo(() => {
    const colRulesObjToMap = (obj) => {
      const m = new Map();
      for (const [targetRole, colMap] of Object.entries(obj || {})) {
        for (const [colId, level] of Object.entries(colMap || {})) {
          m.set(colId, { ...(m.get(colId) || {}), [targetRole]: level });
        }
      }
      return m;
    };
    const sharedView = roleViews.dev.views.find(v => v.isShared);
    return colRulesObjToMap(sharedView?.colRules);
  }, [roleViews.dev]);

  const ownerColRules = useMemo(() => {
    const sharedView = roleViews.owner.views.find(v => v.isShared);
    const m = new Map();
    for (const [colId, level] of Object.entries(sharedView?.colRules?.user || {})) {
      m.set(colId, { user: level });
    }
    return m;
  }, [roleViews.owner]);

  // setColRule : écrit dans la vue active (draft), pas dans l'état global
  const setColRule = (colId, targetRole, level) => {
    updateActiveView(previewRole, v => {
      const rules = { ...(v.colRules || {}) };
      const targetRules = { ...(rules[targetRole] || {}) };
      if (level === "full") delete targetRules[colId];
      else targetRules[colId] = level;
      return { ...v, colRules: { ...rules, [targetRole]: targetRules } };
    });
  };

  // ── Règles d'accès filtres ────────────────────────────────────
  // Map<filterId, { owner?: FilterAccess, user?: FilterAccess }>
  const [devFilterRules, setDevFilterRules] = useState(new Map());
  // Map<filterId, { user?: FilterAccess }>
  const [ownerFilterRules, setOwnerFilterRules] = useState(new Map());

  const setFilterRule = (filterId, targetRole, level) => {
    if (previewRole === "dev") {
      setDevFilterRules((prev) => {
        const next = new Map(prev);
        const entry = { ...(prev.get(filterId) || {}) };
        if (level === "visible") { delete entry[targetRole]; }
        else { entry[targetRole] = level; }
        if (Object.keys(entry).length === 0) next.delete(filterId);
        else next.set(filterId, entry);
        return next;
      });
    } else {
      setOwnerFilterRules((prev) => {
        const next = new Map(prev);
        const entry = { ...(prev.get(filterId) || {}) };
        if (level === "visible") { delete entry[targetRole]; }
        else { entry[targetRole] = level; }
        if (Object.keys(entry).length === 0) next.delete(filterId);
        else next.set(filterId, entry);
        return next;
      });
    }
  };

  // ── Accès effectif selon le rôle de prévisualisation ─────────
  const getEffectiveColAccess = useCallback((colId) => {
    if (previewRole === "dev") return "full";
    if (previewRole === "owner") return devColRules.get(colId)?.owner ?? "full";
    // user : plus restrictif entre Dev et Owner
    const d = devColRules.get(colId)?.user ?? "full";
    const o = ownerColRules.get(colId)?.user ?? "full";
    return mostRestrictiveCol(d, o);
  }, [previewRole, devColRules, ownerColRules]);

  const getEffectiveFilterAccess = useCallback((filterId) => {
    if (previewRole === "dev") return "visible";
    // Par défaut "visible" : un filtre verrouillé est affiché sauf si une règle explicite dit autrement
    if (previewRole === "owner") return devFilterRules.get(filterId)?.owner ?? "visible";
    const d = devFilterRules.get(filterId)?.user ?? "visible";
    const o = ownerFilterRules.get(filterId)?.user ?? "visible";
    return mostRestrictiveFilter(d, o);
  }, [previewRole, devFilterRules, ownerFilterRules]);

  // ── Valeurs dérivées de la vue active ────────────────────────
  const activeView = roleViews[previewRole]?.views.find(v => v.id === roleViews[previewRole].activeViewId)
    ?? roleViews[previewRole]?.views[0];

  const filters         = activeView?.filters ?? [];
  const advancedFilters = activeView?.advancedFilters ?? [];
  const hiddenColumns   = activeView?.hiddenColumns ?? new Set();
  const columnOrder     = activeView?.columnOrder ?? MOCK_COLUMNS.map(c => c.id);

  // Draft : rules de la vue active en cours d'édition (pour l'affichage du panneau colonnes)
  const draftColRulesMap = useMemo(() => {
    const m = new Map();
    for (const [targetRole, colMap] of Object.entries(activeView?.colRules || {})) {
      for (const [colId, level] of Object.entries(colMap || {})) {
        m.set(colId, { ...(m.get(colId) || {}), [targetRole]: level });
      }
    }
    return m;
  }, [activeView]);

  const [lockedHiddenColumns] = useState(new Set());

  const reorderColumns = (fromId, toId) => {
    updateActiveView(previewRole, v => {
      const arr = [...v.columnOrder];
      const fromIdx = arr.indexOf(fromId);
      const toIdx   = arr.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return v;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, fromId);
      return { ...v, columnOrder: arr };
    });
  };
  const orderedColumns = columnOrder
    .map((id) => MOCK_COLUMNS.find((c) => c.id === id))
    .filter(Boolean);

  const toggleColumnVisibility = (colId, forceHide) => {
    updateActiveView(previewRole, (v) => {
      const willHide = forceHide !== undefined ? forceHide : !v.hiddenColumns.has(colId);
      const next = new Set(v.hiddenColumns);
      willHide ? next.add(colId) : next.delete(colId);
      return { ...v, hiddenColumns: next };
    });
  };

  // Advanced builder state
  const [advBuilderOpen, setAdvBuilderOpen] = useState(false);
  const [advBuilderCoords, setAdvBuilderCoords] = useState({ top: 0, left: 0 });
  const [editingAdvFilter, setEditingAdvFilter] = useState(null);
  const advBuilderRef = useRef(null);

  useEffect(() => {
    if (!advBuilderOpen) return;
    const handler = (e) => {
      if (advBuilderRef.current && !advBuilderRef.current.contains(e.target)) {
        setAdvBuilderOpen(false);
        setEditingAdvFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [advBuilderOpen]);

  const usedFilterColIds = filters.map((f) => f.columnId);
  const usedSortColIds = sorts.map((s) => s.columnId);

  const hasUserFilters = filters.some((f) => !f.locked) || advancedFilters.length > 0;

  const addSimpleFilter = ({ id, columnId, operator, value }) => {
    updateActiveView(previewRole, (v) => ({
      ...v,
      filters: [...v.filters, { id: id || `f_${Date.now()}`, columnId, operator, value, locked: false }],
    }));
  };

  const handleAdvancedClick = () => {
    const c = filterDropdownPop.coords;
    filterDropdownPop.close();
    setEditingAdvFilter(null);
    setAdvBuilderCoords(c);
    setAdvBuilderOpen(true);
  };

  const handleAdvValidate = ({ logic, conditions }) => {
    updateActiveView(previewRole, (v) => ({
      ...v,
      advancedFilters: editingAdvFilter
        ? v.advancedFilters.map((f) => f.id === editingAdvFilter.id ? { ...f, logic, conditions } : f)
        : [...v.advancedFilters, { id: `af_${Date.now()}`, logic, conditions, locked: false }],
    }));
    setAdvBuilderOpen(false);
    setEditingAdvFilter(null);
  };

  const editAdvancedFilter = (af) => {
    const triggerEl = filterDropdownPop.triggerRef.current;
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      setAdvBuilderCoords({ top: rect.bottom + 4, left: rect.left });
    }
    setEditingAdvFilter(af);
    setAdvBuilderOpen(true);
  };

  const removeAdvancedFilter = (id) =>
    updateActiveView(previewRole, (v) => ({
      ...v,
      advancedFilters: v.advancedFilters.filter((f) => f.id !== id || f.locked),
    }));


  const createSort = (columnId) => {
    const mock = MOCK_VALUES[columnId];
    const col = MOCK_COLUMNS.find((c) => c.id === columnId);
    const isEmojiCol = col?.type === "emoji";
    const hasOrderable =
      mock?.items &&
      Array.isArray(mock.items) &&
      mock.items.length > 0 &&
      ((typeof mock.items[0] === "object" && col?.type !== "user") ||
        isEmojiCol);
    const customOrder = hasOrderable
      ? isEmojiCol
        ? [...mock.items]
        : mock.items.map((i) => i.label)
      : null;
    const isEmail = col?.type === "email";
    const isFile = col?.type === "file";
    const isPhone = col?.type === "phone";
    const isLocation = col?.type === "location";
    setSorts((prev) => [
      ...prev,
      {
        id: `s_${Date.now()}`,
        columnId,
        direction: "asc",
        ...(customOrder ? { customOrder } : {}),
        ...(isEmail ? { sortBy: "address" } : {}),
        ...(isFile ? { sortBy: "file_name" } : {}),
        ...(isPhone ? { sortBy: "prefix" } : {}),
        ...(isLocation ? { sortBy: "address" } : {}),
      },
    ]);
  };

  const addSort = (columnId) => {
    createSort(columnId);
    sortPickerPop.close();
  };

  const handleHeaderSortToggle = (columnId) => {
    const existing = sorts.find((s) => s.columnId === columnId);
    if (!existing) {
      createSort(columnId);
    } else if (existing.direction === "asc") {
      updateSort({ ...existing, direction: "desc" });
    } else {
      removeSort(existing.id);
    }
  };

  const updateFilter = useCallback(
    (u) => {
      const activeId = roleViews[previewRole]?.activeViewId;
      if (!activeId) return;
      setRoleViews(prev => ({
        ...prev,
        [previewRole]: {
          ...prev[previewRole],
          views: prev[previewRole].views.map(v =>
            v.id !== activeId ? v : { ...v, filters: v.filters.map(f => f.id === u.id ? u : f) }
          ),
        },
      }));
    },
    [previewRole, roleViews],
  );
  const removeFilter = useCallback(
    (id) => {
      const activeId = roleViews[previewRole]?.activeViewId;
      if (!activeId) return;
      setRoleViews(prev => ({
        ...prev,
        [previewRole]: {
          ...prev[previewRole],
          views: prev[previewRole].views.map(v =>
            v.id !== activeId ? v : { ...v, filters: v.filters.filter(f => f.id !== id) }
          ),
        },
      }));
    },
    [previewRole, roleViews],
  );
  const updateSort = useCallback(
    (u) => setSorts((p) => p.map((s) => (s.id === u.id ? u : s))),
    [],
  );
  const removeSort = useCallback(
    (id) => setSorts((p) => p.filter((s) => s.id !== id)),
    [],
  );

  const hasSorts = sorts.length > 0;

  // ── Sauvegarde de vue ─────────────────────────────────────────
  const saveForSelf = () => {
    setSaveStatus("saved");
    setSavePopOpen(false);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // "Pour tous" : met à jour la vue par défaut des rôles cibles
  const executeSaveForOthers = (overwriteId = null) => {
    const src = activeView;
    const targetRoles = previewRole === "dev" ? ["owner", "user"] : previewRole === "owner" ? ["user"] : [];
    if (targetRoles.length === 0) return;

    // isColAccessible lit depuis le draft (src.colRules) — ce qui va être appliqué
    const isColAccessible = (colId, targetRole) => {
      if (previewRole === "dev") {
        const level = src.colRules?.[targetRole]?.[colId] ?? "full";
        return level !== "none" && level !== "ask";
      } else {
        const devLevel = devColRules.get(colId)?.user ?? "full"; // committed dev
        const ownerDraft = src.colRules?.user?.[colId] ?? "full"; // draft owner
        const access = mostRestrictiveCol(devLevel, ownerDraft);
        return access !== "none" && access !== "ask";
      }
    };

    const sharedViewData = {
      isDefault: false, isShared: true,
      filters: [...src.filters], advancedFilters: [...src.advancedFilters],
      hiddenColumns: new Set(src.hiddenColumns), columnOrder: [...src.columnOrder],
      colRules: src.colRules || {},   // ← inclus les règles d'accès dans la vue sauvegardée
    };

    setRoleViews(prev => {
      const next = { ...prev };

      // Créer ou écraser la vue pour tous dans la liste du rôle actuel
      if (overwriteId) {
        next[previewRole] = {
          views: prev[previewRole].views.map(v =>
            v.id === overwriteId ? { ...v, ...sharedViewData } : v
          ),
          activeViewId: overwriteId,
        };
      } else {
        const newId = `shared_${previewRole}_${Date.now()}`;
        next[previewRole] = {
          views: [...prev[previewRole].views, { id: newId, name: "Nouvelle vue", ...sharedViewData }],
          activeViewId: newId,
        };
      }

      // Mettre à jour la vue par défaut de chaque rôle cible
      for (const targetRole of targetRoles) {
        next[targetRole] = {
          ...next[targetRole],
          views: next[targetRole].views.map(v => {
            if (!v.isDefault) return v;
            return {
              ...v,
              filters: src.filters.filter(f => isColAccessible(f.columnId, targetRole)).map(f => ({ ...f, locked: true })),
              advancedFilters: src.advancedFilters.filter(af => af.conditions.every(c => isColAccessible(c.columnId, targetRole))).map(af => ({ ...af, locked: true })),
              hiddenColumns: new Set([...src.hiddenColumns].filter(colId => isColAccessible(colId, targetRole))),
            };
          }),
        };
      }

      return next;
    });

    setSaveStatus("pushed");
    setSavePopOpen(false);
    setOverwriteConfirmOpen(false);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleSaveForOthers = () => {
    const existingShared = roleViews[previewRole].views.find(v => v.isShared);
    if (existingShared) {
      if (activeView?.isShared) {
        // Déjà sur la vue pour tous — on sauvegarde directement sans confirmation
        executeSaveForOthers(existingShared.id);
      } else {
        // Sur une autre vue — on demande confirmation avant d'écraser
        setOverwriteConfirmOpen(true);
      }
    } else {
      executeSaveForOthers();
    }
  };

  const canSaveForOthers = previewRole === "dev" || previewRole === "owner";

  // Vue par défaut ou vue pour tous : accès à la clé de restriction de colonnes
  const isForAllView = !!(activeView?.isDefault || activeView?.isShared);

  // ── Gestion des vues ──────────────────────────────────────────
  const addPersonalView = () => {
    const id = `personal_${previewRole}_${Date.now()}`;
    const src = activeView;
    setRoleViews(prev => ({
      ...prev,
      [previewRole]: {
        views: [...prev[previewRole].views, {
          id, name: "Nouvelle vue", isDefault: false, isForOthers: false,
          filters: [...src.filters], advancedFilters: [...src.advancedFilters],
          hiddenColumns: new Set(src.hiddenColumns), columnOrder: [...src.columnOrder],
        }],
        activeViewId: id,
      },
    }));
  };

  const deletePersonalView = (viewId) => {
    setRoleViews(prev => {
      const rd = prev[previewRole];
      const remaining = rd.views.filter(v => v.id !== viewId);
      const newActiveId = rd.activeViewId === viewId
        ? (remaining.find(v => v.isDefault)?.id ?? remaining[0]?.id ?? null)
        : rd.activeViewId;
      return { ...prev, [previewRole]: { views: remaining, activeViewId: newActiveId } };
    });
  };

  const renameView = (viewId, name) => {
    setRoleViews(prev => ({
      ...prev,
      [previewRole]: {
        ...prev[previewRole],
        views: prev[previewRole].views.map(v => v.id === viewId ? { ...v, name } : v),
      },
    }));
  };

  // Tous les filtres (simples + avancés) triés par ordre de création (timestamp extrait de l'id)
  const getFilterTs = (id) => parseInt(id.split("_").pop()) || 0;

  const allVisibleFilters = [
    ...filters
      .filter((f) => {
        if (!f.locked) return true;
        const a = getEffectiveFilterAccess(f.id);
        return previewRole === "dev" || a === "visible" || a === "ask";
      })
      .map((f) => ({ ...f, _kind: "simple" })),
    ...advancedFilters
      .filter((af) => {
        if (!af.locked) return true;
        const a = getEffectiveFilterAccess(af.id);
        return previewRole === "dev" || a === "visible" || a === "ask";
      })
      .map((af) => ({ ...af, _kind: "advanced" })),
  ].sort((a, b) => getFilterTs(a.id) - getFilterTs(b.id));

  // Seul dev/owner peut configurer les accès ; user ne restreint personne
  const canEditAccess = previewRole !== "user";

  // Colonnes effectivement masquées selon le rôle de prévisualisation
  // Pour dev : celles masquées dans la vue active
  // Pour owner/user : union de la vue active ET des restrictions d'accès
  const effectiveHiddenCols = previewRole === "dev"
    ? hiddenColumns
    : new Set([
        ...hiddenColumns,
        ...orderedColumns.filter((c) => {
          const a = getEffectiveColAccess(c.id);
          return a === "none" || a === "ask";
        }).map((c) => c.id),
      ]);

  // Colonnes visibles dans le panel colonnes : exclut "none" (invisible totale)
  const accessibleColsForPanel = previewRole === "dev"
    ? orderedColumns
    : orderedColumns.filter((c) => getEffectiveColAccess(c.id) !== "none");

  // Colonnes sélectionnables dans les pickers (tri, filtre) : exclut none et ask (non visibles)
  const selectableColumns = previewRole === "dev"
    ? MOCK_COLUMNS
    : MOCK_COLUMNS.filter((c) => {
        const a = getEffectiveColAccess(c.id);
        return a !== "none" && a !== "ask";
      });

  // editorRole pour les composants (dev peut tout, owner peut gérer user, user = lecture)
  const editorRole = previewRole === "user" ? "owner" : previewRole;

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Screen-reader live region for filter/sort announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {filters.length > 0 && `${filters.length} filtre${filters.length > 1 ? "s" : ""} actif${filters.length > 1 ? "s" : ""}`}
        {sorts.length > 0 && `, ${sorts.length} tri${sorts.length > 1 ? "s" : ""} actif${sorts.length > 1 ? "s" : ""}`}
      </div>

      {/* ── Switcher de rôle — style Linear/Notion ── */}
      <div className="font-sans flex items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mr-1">
          Vue
        </span>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800">
          {PREVIEW_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setPreviewRole(role.id)}
              title={role.description}
              className={`relative px-3 py-1 text-xs rounded-md font-medium transition-all ${
                previewRole === role.id
                  ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
        {previewRole !== "dev" && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/25 border border-amber-200 dark:border-amber-700/50 rounded-full px-2.5 py-0.5">
            Simulation · vue {previewRole === "owner" ? "Owner" : "User"}
          </span>
        )}
      </div>

      {/* ── Switcher de vues ── */}
      <ViewSwitcher
        roleData={roleViews[previewRole]}
        onSelectView={(viewId) =>
          setRoleViews(prev => ({ ...prev, [previewRole]: { ...prev[previewRole], activeViewId: viewId } }))
        }
        onAddView={addPersonalView}
        onDeleteView={deletePersonalView}
        onRenameView={renameView}
      />

      <div className="font-sans flex flex-col p-3 gap-2.5">

        {/* ── Bloc Vue unifié (filtres + colonnes) ── */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">

          {/* En-tête du bloc Vue */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Vue</span>
            {/* Bouton Enregistrer */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => document.documentElement.classList.toggle("dark")}
                aria-label="Basculer mode clair/sombre"
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white w-6 h-6 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
              >
                <Sun size={12} className="block dark:hidden" />
                <Moon size={12} className="hidden dark:block" />
              </button>
              <button
                ref={saveBtnRef}
                onClick={() => setSavePopOpen((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                  saveStatus === "saved"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : saveStatus === "pushed"
                    ? "border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                <Save size={11} />
                {saveStatus === "saved" ? "Sauvegardé ✓" : saveStatus === "pushed" ? "Partagée ✓" : "Enregistrer"}
              </button>
              {savePopOpen && (
                <div ref={savePopRef} className="absolute right-0 top-full mt-1 z-50 min-w-[210px] rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 py-1">
                  {/* "Enregistrer" (màj) — uniquement si pas sur la vue par défaut et pas sur la vue partagée */}
                  {!activeView?.isDefault && !activeView?.isShared && (
                    <button
                      onClick={saveForSelf}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Save size={11} className="text-zinc-400" />
                      Enregistrer
                    </button>
                  )}
                  {/* "Enregistrer une nouvelle vue" — uniquement depuis la vue par défaut */}
                  {activeView?.isDefault && (
                    <button
                      onClick={() => { addPersonalView(); setSavePopOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Plus size={11} className="text-zinc-400" />
                      Enregistrer une nouvelle vue
                    </button>
                  )}
                  {/* "Pour tous" — dev/owner uniquement */}
                  {canSaveForOthers && !overwriteConfirmOpen && (
                    <button
                      onClick={handleSaveForOthers}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Check size={11} className="text-emerald-500" />
                      {activeView?.isShared ? "Mettre à jour pour tous" : "Vue pour tous"}
                    </button>
                  )}
                  {/* Confirmation écrasement vue pour tous existante */}
                  {overwriteConfirmOpen && (() => {
                    const existingShared = roleViews[previewRole].views.find(v => v.isShared);
                    return (
                      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
                          Une vue pour tous existe déjà. Écraser ?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => executeSaveForOthers(existingShared?.id)}
                            className="flex-1 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-1 transition-colors"
                          >
                            Écraser
                          </button>
                          <button
                            onClick={() => setOverwriteConfirmOpen(false)}
                            className="flex-1 text-[11px] border border-zinc-200 dark:border-zinc-700 rounded-md py-1 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Ligne Filtres */}
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 min-h-[40px] bg-white dark:bg-zinc-900">
            <Filter size={12} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            {allVisibleFilters.map((f) =>
              f._kind === "simple" ? (
                <FilterChip
                  key={f.id} filter={f} columns={MOCK_COLUMNS} onUpdate={updateFilter}
                  onRemove={f.locked ? () => {} : () => removeFilter(f.id)}
                  canEditAccess={canEditAccess} devFilterRules={devFilterRules} ownerFilterRules={ownerFilterRules}
                  editorRole={editorRole} onSetFilterRule={canEditAccess && isForAllView ? setFilterRule : undefined}
                  lockedDisplay={f.locked ? getEffectiveFilterAccess(f.id) : "visible"}
                />
              ) : (
                <AdvancedFilterChip
                  key={f.id} filter={f} columns={MOCK_COLUMNS}
                  onEdit={() => editAdvancedFilter(f)}
                  onRemove={() => removeAdvancedFilter(f.id)}
                  devFilterRules={canEditAccess ? devFilterRules : undefined}
                  ownerFilterRules={canEditAccess ? ownerFilterRules : undefined}
                  editorRole={editorRole} onSetFilterRule={canEditAccess && isForAllView ? setFilterRule : undefined}
                  lockedDisplay={f.locked ? getEffectiveFilterAccess(f.id) : "visible"}
                />
              )
            )}
            <button
              ref={filterDropdownPop.triggerRef}
              onClick={filterDropdownPop.toggle}
              aria-expanded={filterDropdownPop.isOpen}
              aria-haspopup="listbox"
              className={`inline-flex items-center gap-1.5 rounded-md border transition-all text-xs font-medium ${
                !hasUserFilters
                  ? "border-zinc-200 bg-white px-2.5 py-1 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  : "border-dashed border-zinc-400 w-6 h-6 justify-center bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {!hasUserFilters ? <><Filter size={12} />Filtrer</> : <Plus size={12} />}
            </button>
          </div>

          {/* Séparateur interne */}
          <div className="border-t border-zinc-100 dark:border-zinc-800" />

          {/* Ligne Colonnes */}
          {(() => {
            const totalCount = accessibleColsForPanel.length;
            const hiddenKnown = accessibleColsForPanel.filter(c =>
              effectiveHiddenCols.has(c.id) || lockedHiddenColumns.has(c.id)
            ).length;
            const visibleCount = totalCount - hiddenKnown;
            return (
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900">
                <Columns2 size={12} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                <button
                  ref={columnVisPop.triggerRef}
                  onClick={columnVisPop.toggle}
                  aria-expanded={columnVisPop.isOpen}
                  aria-haspopup="dialog"
                  className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  {hiddenKnown > 0
                    ? `${visibleCount} / ${totalCount} colonnes visibles`
                    : "Toutes les colonnes visibles"}
                </button>
              </div>
            );
          })()}
        </div>

        {/* ── Tris ── */}
        <div className="flex flex-wrap items-center gap-1.5">
          {!hasSorts ? (
            <button
              ref={sortPickerPop.triggerRef}
              onClick={sortPickerPop.toggle}
              aria-expanded={sortPickerPop.isOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ArrowUpDown size={13} />
              Ordonner
            </button>
          ) : (
            <>
              <span className="text-zinc-500 dark:text-zinc-400 mr-0.5">
                <ArrowUpDown size={13} />
              </span>
              {sorts.map((s) => (
                <SortChip key={s.id} sort={s} columns={MOCK_COLUMNS} onUpdate={updateSort} onRemove={() => removeSort(s.id)} />
              ))}
              <button
                ref={sortPickerPop.triggerRef}
                onClick={sortPickerPop.toggle}
                aria-expanded={sortPickerPop.isOpen}
                aria-haspopup="listbox"
                aria-label="Ajouter un tri"
                className="inline-flex items-center justify-center rounded-md border border-dashed border-zinc-400 w-6 h-6 bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all dark:border-zinc-500 dark:bg-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
              >
                <Plus size={13} />
              </button>
            </>
          )}
          <ColumnPicker
            isOpen={sortPickerPop.isOpen}
            coords={sortPickerPop.coords}
            popoverRef={sortPickerPop.popoverRef}
            columns={selectableColumns}
            usedColumnIds={usedSortColIds}
            onSelect={addSort}
          />
        </div>
      </div>

      {/* Popovers */}
      <FilterDropdown
        isOpen={filterDropdownPop.isOpen}
        coords={filterDropdownPop.coords}
        popoverRef={filterDropdownPop.popoverRef}
        columns={selectableColumns}
        usedColumnIds={usedFilterColIds}
        onAddSimple={addSimpleFilter}
        onUpdate={updateFilter}
        onAdvancedClick={handleAdvancedClick}
        onClose={filterDropdownPop.close}
      />
      <AdvancedFilterBuilder
        open={advBuilderOpen}
        coords={advBuilderCoords}
        containerRef={advBuilderRef}
        columns={selectableColumns}
        editingFilter={editingAdvFilter}
        onValidate={handleAdvValidate}
        onClose={() => { setAdvBuilderOpen(false); setEditingAdvFilter(null); }}
      />
      <ColumnVisibilityDropdown
        isOpen={columnVisPop.isOpen}
        coords={columnVisPop.coords}
        popoverRef={columnVisPop.popoverRef}
        columns={accessibleColsForPanel}
        hiddenColumns={effectiveHiddenCols}
        lockedHiddenColumns={lockedHiddenColumns}
        onToggle={toggleColumnVisibility}
        onReorder={reorderColumns}
        devColRules={previewRole === "dev" ? draftColRulesMap : devColRules}
        ownerColRules={previewRole === "owner" ? draftColRulesMap : ownerColRules}
        editorRole={editorRole}
        onSetColRule={setColRule}
        previewRole={previewRole}
        isForAllView={isForAllView}
      />

      <TableHeader
        columns={orderedColumns}
        sorts={sorts}
        filters={filters.filter(f => !f.locked || getEffectiveFilterAccess(f.id) !== "silent")}
        onSortToggle={handleHeaderSortToggle}
        hiddenColumns={effectiveHiddenCols}
        lockedHiddenColumns={lockedHiddenColumns}
        onReorder={reorderColumns}
      />
    </div>
  );
}
