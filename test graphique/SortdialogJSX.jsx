import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
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
  Search,
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
  Users,
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

const MOCK_ROLES = [
  { id: "self",             name: "Moi",                color: "#a78bfa", bg: "bg-violet-100 dark:bg-violet-900/30",  dot: "bg-violet-400",  isSelf: true  },
  { id: "role_client",      name: "Client",             color: "#f87171", bg: "bg-red-100 dark:bg-red-900/30",        dot: "bg-red-400"      },
  { id: "role_fournisseur", name: "Fournisseur",        color: "#fb923c", bg: "bg-orange-100 dark:bg-orange-900/30",  dot: "bg-orange-400"   },
  { id: "role_commercial",  name: "Commercial",         color: "#60a5fa", bg: "bg-blue-100 dark:bg-blue-900/30",      dot: "bg-blue-400"     },
  { id: "role_finance",     name: "Comptable / Finance",color: "#34d399", bg: "bg-emerald-100 dark:bg-emerald-900/30",dot: "bg-emerald-400"  },
];

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
function AdvancedFilterChip({ filter, columns, onEdit, onRemove }) {
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
        {CIcon && (
          <CIcon size={11} className="text-zinc-400 dark:text-zinc-500" />
        )}
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

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-all dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-700 cursor-pointer dark:text-zinc-300"
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
      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={onRemove}
        aria-label="Supprimer ce filtre avancé"
        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <X size={11} />
      </button>
    </div>
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
function FilterChip({ filter, columns, onUpdate, onRemove }) {
  const operatorPop = usePopover();
  const valuePop = usePopover();

  const column = columns.find((c) => c.id === filter.columnId);
  if (!column) return null;

  const tc = COLUMN_TYPES[column.type];
  const Icon = tc?.icon;
  const category = getOperatorCategory(column.type);
  const operators = OPERATORS[category] || [];
  const currentOp = operators.find((op) => op.id === filter.operator);
  const isLocked = filter.locked;

  if (isLocked) {
    return (
      <div
        className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        title="Filtre imposé par l'administrateur"
      >
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 text-zinc-500 select-none dark:bg-zinc-800/50 dark:text-zinc-200">
          {Icon && (
            <Icon size={12} className="text-zinc-400 dark:text-zinc-500" />
          )}
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

      <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
      <button
        onClick={onRemove}
        aria-label="Supprimer ce filtre"
        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <X size={12} />
      </button>
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
   ROLE PICKER POPOVER
   ═══════════════════════════════════════════════════════ */
function RolePickerPopover({ colId, colRoles, visibleHint, onToggleRole, onToggleHint, anchorRef, onClose }) {
  const popRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.right - 180 });
  }, [anchorRef]);

  return (
    <>
      {/* Backdrop : capture le 1er clic extérieur sans déclencher l'action en dessous */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      />
      <div
      ref={popRef}
      style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
      className="w-44 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1"
    >
      {/* Header */}
      <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2.5 pt-1 pb-1.5">
        Masquer pour les rôles
      </p>

      {/* Role list */}
      {MOCK_ROLES.map((role, i) => {
        const checked = colRoles.has(role.id);
        const isLastSelf = role.isSelf && MOCK_ROLES[i + 1] && !MOCK_ROLES[i + 1].isSelf;
        return (
          <>
            <button
              key={role.id}
              onClick={() => onToggleRole(colId, role.id)}
              className="w-full flex items-center gap-2 px-2.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${role.dot}`} />
              <span className={`flex-1 text-left text-xs ${role.isSelf ? "font-medium text-zinc-700 dark:text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}>
                {role.name}
              </span>
              {checked && (
                <Check size={11} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
              )}
            </button>
            {isLastSelf && (
              <div key={`${role.id}-sep`} className="my-1 mx-2 border-t border-zinc-100 dark:border-zinc-800" />
            )}
          </>
        );
      })}

      {/* Divider + toggle — uniquement si au moins un rôle business sélectionné */}
      {MOCK_ROLES.some((r) => !r.isSelf && colRoles.has(r.id)) && (
        <>
          <div className="my-1 mx-2 border-t border-zinc-100 dark:border-zinc-800" />
          <div className="flex items-center gap-2 px-2.5 py-1.5">
            <span className="flex-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
              Indiquer que la colonne est masquée
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleHint(colId); }}
              style={{
                position: "relative",
                width: 28,
                height: 16,
                borderRadius: 999,
                flexShrink: 0,
                border: "none",
                cursor: "pointer",
                transition: "background-color 150ms",
                backgroundColor: visibleHint ? "#6366f1" : "#d1d5db",
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: visibleHint ? 14 : 2,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                  transition: "left 150ms",
                }}
              />
            </button>
          </div>
        </>
      )}
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
  roleHiddenColumns,
  roleVisibleHint,
  onToggle,
  onToggleRole,
  onToggleHint,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const avatarBtnRef = useRef(null);
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
  const isHidden = hiddenColumns.has(col.id);
  const isLocked = lockedHiddenColumns.has(col.id);
  const colRoles = roleHiddenColumns?.get(col.id) || new Set();
  const hasRoles = colRoles.size > 0;
  const visibleHint = roleVisibleHint?.get(col.id) ?? false;
  const selectedRoles = MOCK_ROLES.filter((r) => colRoles.has(r.id));
  const hasBusinessRoles = selectedRoles.some((r) => !r.isSelf);

  useEffect(() => {
    if (!isHidden) setPickerOpen(false);
  }, [isHidden]);

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
        {CIcon && (
          <CIcon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        )}
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
        onClick={() => !isDragging && onToggle(col.id)}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors
          ${isHidden ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-600 dark:text-zinc-400"}
          ${isDragging ? "cursor-grabbing" : "hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"}`}
      >
        <span
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Déplacer la colonne ${col.name}`}
          className="flex-shrink-0 w-0.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        />
        {CIcon && (
          <CIcon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        )}
        <span className={`flex-1 text-left ${isHidden ? "opacity-40" : ""}`}>
          {col.name}
        </span>
        {isHidden ? (
          <EyeOff size={12} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
        ) : (
          <Eye size={12} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        )}

        {/* Avatar button — seulement quand la colonne est cachée */}
        {isHidden && <button
          ref={avatarBtnRef}
          onClick={(e) => {
            e.stopPropagation();
            setPickerOpen((s) => !s);
          }}
          title="Restreindre par type de compte"
          className={`relative flex items-center justify-center p-0.5 rounded flex-shrink-0 transition-colors
            ${hasRoles
              ? "text-zinc-500 dark:text-zinc-400"
              : "text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100"
            } hover:text-zinc-700 dark:hover:text-zinc-200`}
        >
          {hasBusinessRoles ? (
            <Users size={12} />
          ) : (
            <User size={12} />
          )}
          {/* Colored dots — tous les rôles sélectionnés si au moins un rôle business */}
          {hasBusinessRoles && (
            <span className="absolute -bottom-0.5 -right-0.5 flex items-center gap-[2px]">
              {(selectedRoles.length > 3 ? selectedRoles.slice(0, 2) : selectedRoles).map((r) => (
                <span key={r.id} className={`w-1.5 h-1.5 rounded-full ${r.dot} ring-1 ring-white dark:ring-zinc-900`} />
              ))}
              {selectedRoles.length > 3 && (
                <span className="text-[7px] font-bold leading-none text-zinc-500 dark:text-zinc-400">+</span>
              )}
            </span>
          )}
        </button>}
      </div>

      {/* Floating role picker */}
      {pickerOpen && (
        <RolePickerPopover
          colId={col.id}
          colRoles={colRoles}
          visibleHint={visibleHint}
          onToggleRole={onToggleRole}
          onToggleHint={onToggleHint}
          anchorRef={avatarBtnRef}
          onClose={() => {
            setPickerOpen(false);
            if (colRoles.size === 0) onToggle(col.id);
          }}
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
  roleHiddenColumns,
  roleVisibleHint,
  onToggle,
  onToggleRole,
  onToggleHint,
  onReorder,
}) {
  const [activeId, setActiveId] = useState(null);
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
          <div className="p-1 max-h-[320px] overflow-y-auto">
            {columns.map((col) => (
              <ColVisItem
                key={col.id}
                col={col}
                hiddenColumns={hiddenColumns}
                lockedHiddenColumns={lockedHiddenColumns}
                roleHiddenColumns={roleHiddenColumns}
                roleVisibleHint={roleVisibleHint}
                onToggle={onToggle}
                onToggleRole={onToggleRole}
                onToggleHint={onToggleHint}
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function DataToolbar() {
  const [filters, setFilters] = useState([
    {
      id: "f1",
      columnId: "col_status",
      operator: "is",
      value: "En cours",
      locked: false,
    },
    {
      id: "f2",
      columnId: "col_price",
      operator: "eq",
      value: 50,
      locked: false,
    },
    {
      id: "f_locked",
      columnId: "col_priority",
      operator: "is",
      value: "Urgent",
      locked: true,
    },
  ]);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [sorts, setSorts] = useState([
    { id: "s1", columnId: "col_date", direction: "desc" },
  ]);

  const filterDropdownPop = usePopover();
  const sortPickerPop = usePopover();
  const columnVisPop = usePopover();

  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [lockedHiddenColumns] = useState(new Set(["col_id"]));
  const [roleHiddenColumns, setRoleHiddenColumns] = useState(new Map());
  const toggleRoleForColumn = (colId, roleId) => {
    setRoleHiddenColumns((prev) => {
      const next = new Map(prev);
      const roles = new Set(next.get(colId) || []);
      roles.has(roleId) ? roles.delete(roleId) : roles.add(roleId);
      if (roles.size === 0) next.delete(colId);
      else next.set(colId, roles);
      return next;
    });
  };
  const [roleVisibleHint, setRoleVisibleHint] = useState(new Map());
  const toggleVisibleHint = (colId) => {
    setRoleVisibleHint((prev) => {
      const next = new Map(prev);
      next.set(colId, !next.get(colId));
      return next;
    });
  };
  const [columnOrder, setColumnOrder] = useState(MOCK_COLUMNS.map((c) => c.id));
  const reorderColumns = (fromId, toId) => {
    setColumnOrder((prev) => {
      const arr = [...prev];
      const fromIdx = arr.indexOf(fromId);
      const toIdx = arr.indexOf(toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, fromId);
      return arr;
    });
  };
  const orderedColumns = columnOrder
    .map((id) => MOCK_COLUMNS.find((c) => c.id === id))
    .filter(Boolean);
  const toggleColumnVisibility = (colId, forceHide) => {
    const willHide = forceHide !== undefined ? forceHide : !hiddenColumns.has(colId);
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      willHide ? next.add(colId) : next.delete(colId);
      return next;
    });
    setRoleHiddenColumns((prev) => {
      const next = new Map(prev);
      const roles = new Set(next.get(colId) || []);
      if (willHide) {
        roles.add("self");
      } else {
        roles.delete("self");
      }
      roles.size === 0 ? next.delete(colId) : next.set(colId, roles);
      return next;
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

  const lockedFilters = filters.filter((f) => f.locked);
  const userFilters = filters.filter((f) => !f.locked);
  const hasUserFilters = userFilters.length > 0 || advancedFilters.length > 0;

  const addSimpleFilter = ({ id, columnId, operator, value }) => {
    setFilters((prev) => [
      ...prev,
      {
        id: id || `f_${Date.now()}`,
        columnId,
        operator,
        value,
        locked: false,
      },
    ]);
  };

  const handleAdvancedClick = () => {
    const c = filterDropdownPop.coords;
    filterDropdownPop.close();
    setEditingAdvFilter(null);
    setAdvBuilderCoords(c);
    setAdvBuilderOpen(true);
  };

  const handleAdvValidate = ({ logic, conditions }) => {
    if (editingAdvFilter) {
      setAdvancedFilters((prev) =>
        prev.map((f) =>
          f.id === editingAdvFilter.id ? { ...f, logic, conditions } : f,
        ),
      );
    } else {
      setAdvancedFilters((prev) => [
        ...prev,
        { id: `af_${Date.now()}`, logic, conditions },
      ]);
    }
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
    setAdvancedFilters((prev) => prev.filter((f) => f.id !== id));

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
    (u) => setFilters((p) => p.map((f) => (f.id === u.id ? u : f))),
    [],
  );
  const removeFilter = useCallback(
    (id) => setFilters((p) => p.filter((f) => f.id !== id)),
    [],
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

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Screen-reader live region for filter/sort announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {filters.length > 0 && `${filters.length} filtre${filters.length > 1 ? "s" : ""} actif${filters.length > 1 ? "s" : ""}`}
        {sorts.length > 0 && `, ${sorts.length} tri${sorts.length > 1 ? "s" : ""} actif${sorts.length > 1 ? "s" : ""}`}
      </div>
      <div className="font-sans flex flex-col p-3 gap-2">
        {/* Row 1: Filter + Colonnes + Dark mode */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter section */}
          <div className="flex flex-wrap items-center gap-1.5">
            {!hasUserFilters ? (
              <>
                <button
                  ref={filterDropdownPop.triggerRef}
                  onClick={filterDropdownPop.toggle}
                  aria-expanded={filterDropdownPop.isOpen}
                  aria-haspopup="listbox"
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Filter size={13} />
                  Filtrer
                </button>
                {lockedFilters.map((f) => (
                  <FilterChip
                    key={f.id}
                    filter={f}
                    columns={MOCK_COLUMNS}
                    onUpdate={updateFilter}
                    onRemove={() => {}}
                  />
                ))}
              </>
            ) : (
              <>
                <span className="text-zinc-500 mr-0.5">
                  <Filter size={13} />
                </span>
                {lockedFilters.map((f) => (
                  <FilterChip
                    key={f.id}
                    filter={f}
                    columns={MOCK_COLUMNS}
                    onUpdate={updateFilter}
                    onRemove={() => {}}
                  />
                ))}
                {userFilters.map((f) => (
                  <FilterChip
                    key={f.id}
                    filter={f}
                    columns={MOCK_COLUMNS}
                    onUpdate={updateFilter}
                    onRemove={() => removeFilter(f.id)}
                  />
                ))}
                {advancedFilters.map((af) => (
                  <AdvancedFilterChip
                    key={af.id}
                    filter={af}
                    columns={MOCK_COLUMNS}
                    onEdit={() => editAdvancedFilter(af)}
                    onRemove={() => removeAdvancedFilter(af.id)}
                  />
                ))}
                <button
                  ref={filterDropdownPop.triggerRef}
                  onClick={filterDropdownPop.toggle}
                  aria-expanded={filterDropdownPop.isOpen}
                  aria-haspopup="listbox"
                  aria-label="Ajouter un filtre"
                  className="inline-flex items-center justify-center rounded-md border border-dashed border-zinc-400 w-6 h-6 bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all dark:border-zinc-500 dark:bg-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Plus size={13} />
                </button>
              </>
            )}
          </div>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />

          {/* Dark mode toggle */}
          <button
            onClick={() => document.documentElement.classList.toggle("dark")}
            aria-label="Basculer mode clair/sombre"
            className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white w-7 h-7 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Sun size={14} className="block dark:hidden" />
            <Moon size={14} className="hidden dark:block" />
          </button>
        </div>

        {/* Row 2: Sort */}
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
              <span className="text-zinc-500 mr-0.5">
                <ArrowUpDown size={13} />
              </span>
              {sorts.map((s) => (
                <SortChip
                  key={s.id}
                  sort={s}
                  columns={MOCK_COLUMNS}
                  onUpdate={updateSort}
                  onRemove={() => removeSort(s.id)}
                />
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
            columns={MOCK_COLUMNS}
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
        columns={MOCK_COLUMNS}
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
        columns={MOCK_COLUMNS}
        editingFilter={editingAdvFilter}
        onValidate={handleAdvValidate}
        onClose={() => {
          setAdvBuilderOpen(false);
          setEditingAdvFilter(null);
        }}
      />

      <ColumnVisibilityDropdown
        isOpen={columnVisPop.isOpen}
        coords={columnVisPop.coords}
        popoverRef={columnVisPop.popoverRef}
        columns={orderedColumns}
        hiddenColumns={hiddenColumns}
        lockedHiddenColumns={lockedHiddenColumns}
        roleHiddenColumns={roleHiddenColumns}
        roleVisibleHint={roleVisibleHint}
        onToggle={toggleColumnVisibility}
        onToggleRole={toggleRoleForColumn}
        onToggleHint={toggleVisibleHint}
        onReorder={reorderColumns}
      />

      <div className="flex justify-end px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
        <button
          ref={columnVisPop.triggerRef}
          onClick={columnVisPop.toggle}
          aria-expanded={columnVisPop.isOpen}
          aria-haspopup="dialog"
          className={`inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 text-xs font-medium transition-all dark:bg-zinc-900 ${
            hiddenColumns.size + lockedHiddenColumns.size > 0
              ? "border-zinc-400 text-zinc-600 hover:border-zinc-500 dark:border-zinc-500 dark:text-zinc-300"
              : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          <Columns2 size={12} />
          Colonnes
          {hiddenColumns.size + lockedHiddenColumns.size > 0 && (
            <span className="text-zinc-400 dark:text-zinc-500">
              {MOCK_COLUMNS.length -
                hiddenColumns.size -
                lockedHiddenColumns.size}
              /{MOCK_COLUMNS.length}
            </span>
          )}
        </button>
      </div>

      <TableHeader
        columns={orderedColumns}
        sorts={sorts}
        filters={filters}
        onSortToggle={handleHeaderSortToggle}
        hiddenColumns={hiddenColumns}
        lockedHiddenColumns={lockedHiddenColumns}
        onReorder={reorderColumns}
      />
    </div>
  );
}
