import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimating(false);
      setEntered(false);
    } else if (visible) {
      setAnimating(true);
      setEntered(false);
    }
  }, [isOpen]);

  if (!visible) return null;
  const { top, left } = clampPos(coords.top, coords.left, minWidth);
  const showAnim = animating ? "animate-popover-out" : entered ? "" : "animate-popover-in";
  return createPortal(
    <div
      ref={popoverRef}
      onMouseDown={(e) => e.stopPropagation()}
      onAnimationEnd={() => {
        if (animating) { setVisible(false); setAnimating(false); }
        else { setEntered(true); }
      }}
      className={`fixed z-[99999] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${!entered && !animating ? "will-change-transform" : ""} ${showAnim}`}
      style={{ top, left, minWidth, maxWidth: "calc(100vw - 16px)", transformOrigin: "top left" }}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════════════
   DRAG ACCESSIBILITY — instructions read by screen readers
   Injected via aria-describedby on each draggable element.
   ═══════════════════════════════════════════════════════ */
const DND_SCREEN_READER_INSTRUCTIONS = {
  draggable:
    "To move this item, press Space. " +
    "Use the arrow keys to move it. " +
    "Press Space again to drop it at its new position, " +
    "or Escape to cancel.",
};

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */
const COLUMN_TYPES = {
  text: { label: "Text", icon: Type, color: "text-blue-500" },
  number: { label: "Number", icon: Hash, color: "text-emerald-500" },
  date: { label: "Date", icon: Calendar, color: "text-orange-500" },
  checkbox: {
    label: "Checkbox",
    icon: CheckSquare,
    color: "text-violet-500",
  },
  select: { label: "Select", icon: List, color: "text-pink-500" },
  tags: { label: "Tags", icon: Tags, color: "text-amber-500" },
  url: { label: "URL", icon: Link, color: "text-cyan-500" },
  phone: { label: "Phone", icon: Phone, color: "text-teal-500" },
  email: { label: "Email", icon: Mail, color: "text-rose-500" },
  location: { label: "Location", icon: MapPin, color: "text-red-500" },
  relation: { label: "Relation", icon: GitBranch, color: "text-indigo-500" },
  formula: { label: "Formula", icon: FunctionSquare, color: "text-lime-500" },
  user: { label: "User", icon: User, color: "text-sky-500" },
  file: { label: "File", icon: FileText, color: "text-stone-500" },
  status: { label: "Status", icon: Activity, color: "text-fuchsia-500" },
  emoji: { label: "Emoji", icon: Smile, color: "text-yellow-500" },
  rollup: { label: "Rollup", icon: Database, color: "text-purple-500" },
  created_modified: {
    label: "Created/Modified",
    icon: Clock,
    color: "text-zinc-500",
  },
  unique_id: { label: "Unique ID", icon: Key, color: "text-neutral-500" },
};

const MOCK_COLUMNS = [
  { id: "col_name", name: "Name", type: "text" },
  { id: "col_price", name: "Price", type: "number" },
  { id: "col_date", name: "Due Date", type: "date" },
  { id: "col_done", name: "Done", type: "checkbox" },
  { id: "col_status", name: "Status", type: "status" },
  { id: "col_priority", name: "Priority", type: "select" },
  { id: "col_tags", name: "Tags", type: "tags" },
  { id: "col_email", name: "Email", type: "email" },
  { id: "col_phone", name: "Phone", type: "phone" },
  { id: "col_url", name: "Link", type: "url" },
  { id: "col_location", name: "Location", type: "location" },
  { id: "col_relation", name: "Project", type: "relation" },
  { id: "col_formula", name: "Total", type: "formula" },
  { id: "col_user", name: "Assigned To", type: "user" },
  { id: "col_file", name: "Attachment", type: "file" },
  { id: "col_emoji", name: "Reaction", type: "emoji" },
  { id: "col_rollup", name: "Budget", type: "rollup" },
  { id: "col_created", name: "Created On", type: "created_modified" },
  { id: "col_id", name: "Ref.", type: "unique_id" },
];

/* ─── Column access levels ─── */
const COL_ACCESS_LEVELS = [
  { id: "full", label: "Editable",           desc: "Can view and edit",                      Icon: Pencil, color: "text-emerald-500", activeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700" },
  { id: "view", label: "Read-only",          desc: "Can view, cannot edit",                  Icon: Eye,    color: "text-blue-500",   activeBg: "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"            },
  { id: "ask",  label: "Hidden + request",   desc: "Knows it is hidden, can request access", Icon: Lock,   color: "text-amber-500",  activeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"         },
  { id: "none", label: "Fully hidden",       desc: "Invisible, no notification",             Icon: EyeOff, color: "text-red-400",    activeBg: "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"               },
];

/* ─── Filter access levels ─── */
const FILTER_ACCESS_LEVELS = [
  { id: "visible", label: "Visible",           desc: "Filter displayed, not editable",        Icon: Eye,  color: "text-emerald-500", activeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700" },
  { id: "ask",     label: "Restricted access", desc: "Hidden, can request access",            Icon: Lock, color: "text-amber-500",   activeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700"       },
  { id: "silent",  label: "Hidden",            desc: "Filter active, data pre-filtered",      Icon: EyeOff, color: "text-red-500", activeBg: "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700"             },
];

/* ─── Target roles ─── */

/* ─── Preview roles ─── */
const PREVIEW_ROLES = [
  { id: "dev",   label: "Dev",   description: "Full access and configuration" },
  { id: "owner", label: "Owner", description: "Can enforce views on Users" },
  { id: "user",  label: "User",  description: "Personal access and views only" },
];

/* ─── Restriction order (the higher the index, the more restrictive) ─── */
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
    { id: "is", label: "is" },
    { id: "is_not", label: "is not" },
    { id: "contains", label: "contains" },
    { id: "not_contains", label: "does not contain" },
    { id: "starts_with", label: "starts with" },
    { id: "ends_with", label: "ends with" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
  ],
  number: [
    { id: "eq", label: "equals" },
    { id: "neq", label: "not equal to" },
    { id: "gt", label: "greater than" },
    { id: "lt", label: "less than" },
    { id: "gte", label: "greater than or equal to" },
    { id: "lte", label: "less than or equal to" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
  ],
  date: [
    { id: "is", label: "is" },
    { id: "is_before", label: "is before" },
    { id: "is_after", label: "is after" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
  ],
  select: [
    { id: "is", label: "is" },
    { id: "is_not", label: "is not" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
  ],
  checkbox: [
    { id: "is_checked", label: "is checked", noValue: true },
    { id: "is_unchecked", label: "is not checked", noValue: true },
  ],
  user: [
    { id: "is", label: "is" },
    { id: "is_not", label: "is not" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
  ],
  tags: [
    { id: "contains", label: "contains" },
    { id: "not_contains", label: "does not contain" },
    { id: "is_empty", label: "is empty", noValue: true },
    { id: "is_not_empty", label: "is not empty", noValue: true },
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
    items: ["Today", "Yesterday", "This week", "This month", "This year"],
  },
  col_done: null,
  col_status: {
    type: "colored",
    items: [
      {
        label: "To Do",
        color: "bg-zinc-400",
        icon: Circle,
        iconColor: "text-zinc-400",
      },
      {
        label: "In Progress",
        color: "bg-blue-500",
        icon: Loader,
        iconColor: "text-blue-500",
      },
      {
        label: "In Review",
        color: "bg-amber-500",
        icon: Eye,
        iconColor: "text-amber-500",
      },
      {
        label: "Done",
        color: "bg-emerald-500",
        icon: CheckCircle,
        iconColor: "text-emerald-500",
      },
      {
        label: "Blocked",
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
        label: "High",
        color: "bg-orange-500",
        icon: ChevronsUp,
        iconColor: "text-orange-500",
      },
      {
        label: "Normal",
        color: "bg-blue-500",
        icon: Minus,
        iconColor: "text-blue-500",
      },
      {
        label: "Low",
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
      { label: "HR", color: "bg-indigo-500" },
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
    items: ["Brussels", "Paris", "Lyon", "Namur", "Liege"],
  },
  col_relation: {
    type: "chips",
    items: ["Project Alpha", "Project Beta", "Project Gamma"],
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
    items: ["PDF", "Image", "Video", "Document", "Spreadsheet"],
  },
  col_emoji: { type: "chips", items: ["😀", "👍", "❤️", "⭐", "🔥"] },
  col_rollup: { type: "number", presets: [0, 10, 50, 100, 500] },
  col_formula: { type: "number", presets: [0, 10, 50, 100, 500, 1000] },
  col_created: {
    type: "chips",
    items: ["Today", "Yesterday", "This week", "This month", "This year"],
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
        {arr.length} {isUsers ? "people" : "names"}
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
      {arr.length} selections
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
            placeholder="Value…"
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
            aria-label="Clear search"
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
            No results
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
            Apply
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
          aria-label={`Search for a column`}
          className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-300 text-zinc-700 dark:text-zinc-200 dark:placeholder-zinc-600"
          autoFocus
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
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
            No column found
          </p>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Navigate</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Select</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Esc</kbd> Close</span>
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
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Navigate</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Select</span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Esc</kbd> Close</span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ADVANCED FILTER BUILDER
   Uses the same cascading dropdown as simple filters.
   Completed conditions displayed as summaries with and/or.
   "Add a filter" opens the cascade to add a new condition.
   "Validate" to apply.
   ═══════════════════════════════════════════════════════ */
function AdvancedFilterBuilder({
  open,
  coords,
  containerRef,
  columns,
  editingFilter,
  onChange,
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

  // Refs for focus management in the cascade
  const colPickerRef = useRef(null);
  const opDropdownRef = useRef(null);
  const editDDRef = useRef(null);

  // Move focus to the operator dropdown when a column is selected
  // or when returning from the value level (Esc)
  useLayoutEffect(() => {
    if (showColumnPicker && addingColId && !addingOpId) {
      opDropdownRef.current?.querySelector("button[role='option']")?.focus();
    }
  }, [showColumnPicker, addingColId, addingOpId]);

  // Move focus to the edit dropdown when it opens
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

  // Auto-apply: push changes to parent whenever conditions or logic change
  const isInitRef = useRef(true);
  useEffect(() => {
    if (isInitRef.current) { isInitRef.current = false; return; }
    if (!open) return;
    const valid = conditions.filter((c) => {
      if (!c.columnId || !c.operator) return false;
      const col = columns.find((cc) => cc.id === c.columnId);
      const cat = col ? getOperatorCategory(col.type) : null;
      const op = cat ? OPERATORS[cat]?.find((o) => o.id === c.operator) : null;
      if (op?.noValue) return true;
      return c.value != null;
    });
    onChange({ logic, conditions: valid });
  }, [conditions, logic]);

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
              Advanced filter
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
                        {logic === "and" ? "and" : "or"}
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

          <div className="flex items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={openAddFilter}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <Plus size={12} /> Add a filter
            </button>
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
              Operator
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
              Value
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
            placeholder="Column…"
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
              Operator
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
              // useLayoutEffect will re-focus the operator dropdown
            }
          }}
          className="fixed z-[100000] rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={ddStyle(valMenuPos.top, valMenuPos.left, 200)}
        >
          <div className="px-2.5 pt-2 pb-1">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Value
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

  // Worst access level defined for this filter (colored indicator)
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
      : askColNames.length === 1 ? ` on ${askColNames[0]}`
      : ` on ${askColNames.slice(0, -1).join(", ")} and ${askColNames.at(-1)}`;
    return (
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 dark:text-zinc-500 select-none">
          <Lock size={12} />
          <span className="text-xs">Restricted filter{askLabel}</span>
        </div>
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        <button className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
          Request access
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-all dark:border-zinc-700 dark:bg-zinc-900 animate-chip-in will-change-transform">
        {/* Condition text */}
        <button
          onClick={filter.locked ? undefined : onEdit}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 ${filter.locked ? "cursor-default" : "cursor-pointer"}`}
        >
          {filter.conditions.map((cond, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && (
                <span className="text-zinc-400 mx-0.5">
                  {filter.logic === "and" ? "and" : "or"}
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
              title={hasRestrictions ? `Visibility: ${worstLevel?.label}` : "Set visibility by role"}
              className={`px-1.5 py-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${worstLevel?.color || "text-emerald-500"}`}
            >
              <Key size={11} />
            </button>
          </>
        )}

        {/* Lock icon (enforced filter) or delete button (personal filter) */}
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
              aria-label="Remove this advanced filter"
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
   "Advanced filter" option at top.
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
  onHideColumn,
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
            placeholder="Column…"
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

        {/* Advanced filter */}
        <div className="p-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onAdvancedClick}
            className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <span className="font-medium">Advanced filter</span>
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
              No column found
            </p>
          )}
        </div>
        {/* Keyboard hint */}
        <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↑↓</kbd> Navigate</span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">↵</kbd> Select</span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600"><kbd className="font-sans">Esc</kbd> Close</span>
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
              Operator
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
              Value
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
        placeholder="Column…"
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

  // Restriction indicator (same logic as AdvancedFilterChip)
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
    // "Restricted access" chip: lock + request access button
    if (lockedDisplay === "ask") {
      return (
        <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 dark:text-zinc-500 select-none">
            <Lock size={12} />
            <span className="text-xs">Restricted filter on {column.name}</span>
          </div>
          <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
          <button className="px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            Request access
          </button>
        </div>
      );
    }
    // "Visible non-editable" chip: full chip with grey lock
    return (
      <div
        className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
        title="Enforced filter — not editable"
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
    <>
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow dark:border-zinc-700 dark:bg-zinc-900 animate-chip-in will-change-transform">
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
          aria-label={`Operator: ${currentOp?.label || "choose"}`}
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
              aria-label="Filter value"
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
              title={`Visibility: ${worstLevel?.label || "Visible"}`}
              className={`px-1.5 py-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${worstLevel?.color || "text-emerald-500"}`}
            >
              <Key size={11} />
            </button>
          </>
        )}
        <div className="w-px self-stretch bg-zinc-200 dark:bg-zinc-700" />
        <button
          onClick={onRemove}
          aria-label="Remove this filter"
          className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X size={12} />
        </button>
      </div>

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
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-grab touch-none
        ${isDragging ? "opacity-30 scale-[0.98] cursor-grabbing" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
    >
      <span
        aria-hidden="true"
        className="w-0.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-150"
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
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl cursor-grabbing scale-[1.02] will-change-transform">
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
    ascLabel = "Oldest → Newest";
    descLabel = "Newest → Oldest";
  } else if (isCheckbox) {
    ascLabel = "Unchecked → Checked";
    descLabel = "Checked → Unchecked";
  } else if (isEmoji) {
    ascLabel = "Ascending";
    descLabel = "Descending";
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
    <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow dark:border-zinc-700 dark:bg-zinc-900 animate-chip-in will-change-transform">
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
            aria-label="Email sort mode"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "domain" ? "Domain" : "Address"}
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
                { id: "address", label: "Full address" },
                { id: "domain", label: "Domain" },
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
            aria-label="File sort mode"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "file_type" ? "Type" : "Name"}
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
                { id: "file_name", label: "File name" },
                { id: "file_type", label: "File type" },
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
            aria-label="Phone sort mode"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {sort.sortBy === "after_prefix" ? "After prefix" : "Prefix"}
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
                { id: "prefix", label: "Prefix" },
                { id: "after_prefix", label: "After prefix" },
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
            aria-label="Location sort mode"
            className="flex items-center gap-0.5 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {{
              address: "Address",
              street: "Street",
              city: "City",
              country: "Country",
            }[sort.sortBy] ?? "Address"}
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
                { id: "address", label: "Full address" },
                { id: "street", label: "Street" },
                { id: "city", label: "City" },
                { id: "country", label: "Country" },
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
        aria-label={sort.direction === "asc" ? `Ascending sort — switch to descending` : `Descending sort — switch to ascending`}
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
            aria-label="Edit sort order"
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
                Sort order
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
                  onDragStart: ({ active }) => `Moving "${active.id}" started. Use arrow keys to move, Space to drop.`,
                  onDragOver: ({ active, over }) => over && over.id !== active.id ? `"${active.id}" over "${over.id}".` : undefined,
                  onDragEnd: ({ active, over }) => over ? `"${active.id}" dropped at the position of "${over.id}".` : `Moving "${active.id}" cancelled.`,
                  onDragCancel: ({ active }) => `Moving "${active.id}" cancelled.`,
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
        aria-label="Remove this sort"
        className="px-1.5 py-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <X size={12} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ACCESS RULE POPOVER  (style Notion / Linear)
   Allows setting the access level per target role.
   type = "col" | "filter"
   editorRole = "dev" (can set owner + user) | "owner" (can set user only)
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

  // Current value: we use the first target role as reference (owner if dev, user if owner)
  const currentRule = editorRole === "dev"
    ? (devRules?.get(itemId)?.owner ?? defaultVal)
    : (ownerRules?.get(itemId)?.user ?? defaultVal);

  // Apply to all target roles of the editor (toggle: clicking again removes the restriction)
  const applyRule = (levelId) => {
    const next = levelId === currentRule ? (type === "col" ? "full" : "visible") : levelId;
    if (editorRole === "dev") {
      onSetRule(itemId, "owner", next);
      onSetRule(itemId, "user",  next);
    } else {
      onSetRule(itemId, "user", next);
    }
  };

  const header = type === "col" ? "Access restrictions" : "Filter visibility";

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

        {/* Unified selector "for others" */}
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
            {levels.find((l) => l.id === currentRule)?.desc ?? (type === "col" ? "Default access — visible and editable" : "Filter visible by default")}
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

  // Worst access level defined for this column (indicator on the Key button)
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

  // Effective access for the role being previewed
  const effectiveAccess = previewRole === "dev" ? "full"
    : previewRole === "owner" ? (devColRules?.get(col.id)?.owner ?? "full")
    : mostRestrictiveCol(devColRules?.get(col.id)?.user ?? "full", ownerColRules?.get(col.id)?.user ?? "full");
  const isUserView = previewRole === "user";
  // Can configure restrictions: "full" access for self AND on default view or shared view
  const canConfigureAccess = !isUserView && effectiveAccess === "full" && isForAllView;
  // Must see "Request access": any non-dev role with "ask" access
  const showRequestAccess = previewRole !== "dev" && effectiveAccess === "ask";

  if (isLocked) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...attributes}
        title="Column hidden by administrator"
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
      className={`group w-full rounded-md transition-all duration-200 ${isDragging ? "opacity-30 scale-[0.98]" : ""}`}
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
          aria-label={`Move column ${col.name}`}
          className="flex-shrink-0 w-0.5 h-3.5 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        />
        {CIcon && <CIcon size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />}
        <span className={`flex-1 text-left ${isHidden ? "opacity-40" : ""}`}>{col.name}</span>

        {/* Eye: personal visibility (Dev) */}
        {isHidden
          ? <EyeOff size={12} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
          : <Eye size={12} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        }

        {/* Owner/User: "Request access" if ask access */}
        {showRequestAccess && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-amber-600 dark:text-amber-400 underline hover:no-underline flex-shrink-0 transition-colors"
          >
            Request access
          </button>
        )}
        {/* Dev / Owner with full access: Key button to configure restrictions */}
        {canConfigureAccess && (
          <button
            ref={accessBtnRef}
            onClick={(e) => { e.stopPropagation(); setPickerOpen((s) => !s); }}
            title={hasRestrictions ? `Restricted access: ${worstLevel?.label}` : "Set access restrictions"}
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
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl cursor-grabbing min-w-[180px] scale-[1.02] will-change-transform
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
  // columns is already filtered (without "none" columns) by the parent
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
          Columns
        </p>
        <button
          onClick={() =>
            toggleableColumns.forEach((c) => onToggle(c.id, noneHidden))
          }
          className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {noneHidden ? "Hide all" : "Show all"}
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
          placeholder="Columns…"
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none text-zinc-700 placeholder-zinc-300 dark:text-zinc-200 dark:placeholder-zinc-600"
        />
        {colSearch && (
          <button
            onClick={() => setColSearch("")}
            aria-label="Clear search"
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
              return `Moving column "${col?.name ?? active.id}" started. Use arrow keys to move, Space to drop.`;
            },
            onDragOver: ({ active, over }) => {
              if (!over || over.id === active.id) return undefined;
              const col = columns.find((c) => c.id === over.id);
              return `Over "${col?.name ?? over.id}".`;
            },
            onDragEnd: ({ active, over }) => {
              const name = columns.find((c) => c.id === active.id)?.name ?? active.id;
              if (over) {
                const overName = columns.find((c) => c.id === over.id)?.name ?? over.id;
                return `"${name}" moved to the position of "${overName}".`;
              }
              return `Moving "${name}" cancelled.`;
            },
            onDragCancel: ({ active }) => {
              const name = columns.find((c) => c.id === active.id)?.name ?? active.id;
              return `Moving "${name}" cancelled.`;
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
      aria-label={`Column ${col.name}${sort ? `, sort ${sort.direction === "asc" ? "ascending" : "descending"}` : ""}`}
      className={`group flex items-center gap-1.5 pl-1.5 pr-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 transition-all duration-200
        ${index === 0 ? "w-48" : "w-36"}
        ${sort ? "bg-zinc-50/60 dark:bg-zinc-800/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}
        ${isDragging ? "opacity-30 scale-[0.98] cursor-grabbing" : "cursor-pointer"}`}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 w-0.5 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
          className="text-zinc-300 dark:text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
    <div className="flex items-center gap-1.5 pl-1.5 pr-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-xl cursor-grabbing w-36 scale-[1.02] will-change-transform">
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
            return `Moving column "${col?.name ?? active.id}" started. Use arrow keys to move, Space to drop.`;
          },
          onDragOver: ({ active, over }) => {
            if (!over || over.id === active.id) return undefined;
            const col = visibleColumns.find((c) => c.id === over.id);
            return `Over "${col?.name ?? over.id}".`;
          },
          onDragEnd: ({ active, over }) => {
            const name = visibleColumns.find((c) => c.id === active.id)?.name ?? active.id;
            if (over) {
              const overName = visibleColumns.find((c) => c.id === over.id)?.name ?? over.id;
              return `"${name}" moved to the position of "${overName}".`;
            }
            return `Moving "${name}" cancelled.`;
          },
          onDragCancel: ({ active }) => {
            const name = visibleColumns.find((c) => c.id === active.id)?.name ?? active.id;
            return `Moving "${name}" cancelled.`;
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
   TABLE BODY
   ═══════════════════════════════════════════════════════ */
const MOCK_ROWS = [];

function applyFilter(row, f) {
  const val = row[f.columnId];
  const fv = f.value;
  if (fv == null || fv === "") return true;
  switch (f.operator) {
    case "is": return String(val) === String(fv);
    case "is_not": return String(val) !== String(fv);
    case "contains": return String(val ?? "").toLowerCase().includes(String(fv).toLowerCase());
    case "not_contains": return !String(val ?? "").toLowerCase().includes(String(fv).toLowerCase());
    case "starts_with": return String(val ?? "").toLowerCase().startsWith(String(fv).toLowerCase());
    case "ends_with": return String(val ?? "").toLowerCase().endsWith(String(fv).toLowerCase());
    case "is_empty": return val == null || val === "" || (Array.isArray(val) && val.length === 0);
    case "is_not_empty": return val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
    case "gt": return Number(val) > Number(fv);
    case "lt": return Number(val) < Number(fv);
    case "gte": return Number(val) >= Number(fv);
    case "lte": return Number(val) <= Number(fv);
    case "is_checked": return !!val;
    case "is_unchecked": return !val;
    default: return true;
  }
}

function applySorts(rows, sorts) {
  if (!sorts.length) return rows;
  return [...rows].sort((a, b) => {
    for (const s of sorts) {
      const dir = s.direction === "asc" ? 1 : -1;
      if (s.customOrder) {
        const ai = s.customOrder.indexOf(a[s.columnId]);
        const bi = s.customOrder.indexOf(b[s.columnId]);
        const aIdx = ai === -1 ? 999 : ai;
        const bIdx = bi === -1 ? 999 : bi;
        if (aIdx !== bIdx) return (aIdx - bIdx) * dir;
        continue;
      }
      const av = a[s.columnId];
      const bv = b[s.columnId];
      if (av == null && bv == null) continue;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "boolean") {
        if (av !== bv) return (av ? 1 : -1) * dir;
        continue;
      }
      if (typeof av === "number" && typeof bv === "number") {
        if (av !== bv) return (av - bv) * dir;
        continue;
      }
      const cmp = String(av).localeCompare(String(bv), "en");
      if (cmp !== 0) return cmp * dir;
    }
    return 0;
  });
}

function TableBody({ columns, hiddenColumns, lockedHiddenColumns, sorts, filters }) {
  const visibleColumns = columns.filter(
    (c) => !hiddenColumns.has(c.id) && !lockedHiddenColumns.has(c.id),
  );

  const filteredRows = useMemo(() => {
    let rows = MOCK_ROWS;
    if (filters.length) {
      rows = rows.filter((row) => filters.every((f) => applyFilter(row, f)));
    }
    if (sorts.length) {
      rows = applySorts(rows, sorts);
    }
    return rows;
  }, [filters, sorts]);

  const renderCell = (row, col, idx) => {
    const val = row[col.id];
    if (val == null) return <span className="text-zinc-300 dark:text-zinc-600">—</span>;

    switch (col.type) {
      case "checkbox":
        return val
          ? <CheckSquare size={14} className="text-zinc-700 dark:text-zinc-300" />
          : <span className="w-3.5 h-3.5 rounded border border-zinc-300 dark:border-zinc-600 inline-block" />;
      case "number":
      case "formula":
      case "rollup":
        return <span className="tabular-nums">{typeof val === "number" ? val.toLocaleString("fr-FR") : val}</span>;
      case "date":
      case "created_modified":
        return <span className="tabular-nums">{val}</span>;
      case "select": {
        const mock = MOCK_VALUES[col.id];
        const item = mock?.items?.find((i) => (typeof i === "object" ? i.label : i) === val);
        const color = typeof item === "object" ? item.color : "bg-zinc-400";
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
            {val}
          </span>
        );
      }
      case "status": {
        const mock = MOCK_VALUES[col.id];
        const item = mock?.items?.find((i) => (typeof i === "object" ? i.label : i) === val);
        const color = typeof item === "object" ? item.color : "bg-zinc-400";
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
            {val}
          </span>
        );
      }
      case "tags":
        return (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(val) ? val : [val]).map((t) => (
              <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{t}</span>
            ))}
          </div>
        );
      case "url":
        return <span className="text-blue-500 underline truncate">{val.replace(/^https?:\/\//, "")}</span>;
      case "email":
        return <span className="text-zinc-600 dark:text-zinc-400">{val}</span>;
      case "emoji":
        return <span className="text-base">{val}</span>;
      default:
        return <span className="truncate">{String(val)}</span>;
    }
  };

  return (
    <div className="font-sans">
      {filteredRows.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-zinc-400 dark:text-zinc-500">
          No results match the active filters
        </div>
      ) : filteredRows.map((row, rowIdx) => (
        <div
          key={row.col_id}
          className={`flex border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${rowIdx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"}`}
        >
          <div className="w-10 flex-shrink-0 flex items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-600 border-r border-zinc-100 dark:border-zinc-800 tabular-nums">
            {rowIdx + 1}
          </div>
          {visibleColumns.map((col, i) => (
            <div
              key={col.id}
              className={`flex items-center px-2 py-2 text-xs text-zinc-700 dark:text-zinc-300 flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 overflow-hidden ${i === 0 ? "w-48 font-medium" : "w-36"}`}
            >
              {renderCell(row, col, i)}
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-700">
        <span>{filteredRows.length} result{filteredRows.length > 1 ? "s" : ""}{filters.length > 0 ? ` (${MOCK_ROWS.length} total)` : ""}</span>
        <span className="tabular-nums">{sorts.length > 0 ? `Sorted by ${sorts.length} column${sorts.length > 1 ? "s" : ""}` : ""}</span>
      </div>
    </div>
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
    if (view.isDefault || view.isForAll) return;
    setRenamingId(view.id);
    setRenameVal(view.name);
  };
  const commitRename = (id) => {
    onRenameView(id, renameVal.trim() || "My view");
    setRenamingId(null);
  };

  const tabs = roleData.views;
  const canDelete = (tab) => !tab.isDefault && !tab.isForAll;

  return (
    <div className="font-sans flex items-center bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto flex-shrink-0">
      {tabs.map(tab => {
        const isActive = tab.id === roleData.activeViewId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectView(tab.id)}
            onDoubleClick={() => startRename(tab)}
            className={`group relative flex items-center gap-1 px-3 py-2 text-xs cursor-pointer border-b-2 whitespace-nowrap transition-all duration-200 select-none ${
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
                {tab.isForAll && <Users size={10} className="flex-shrink-0 text-emerald-500" />}
                <span>{tab.name}</span>
              </>
            )}
            {canDelete(tab) && (
              <button onClick={e => { e.stopPropagation(); onDeleteView(tab.id); }} className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity duration-150">
                <X size={10} />
              </button>
            )}
          </div>
        );
      })}
      <button onClick={onAddView} title="New view" className="flex items-center justify-center px-2 py-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors flex-shrink-0">
        <Plus size={13} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function DataToolbar() {
  // ── Views per role ─────────────────────────────────────────────
  // Each view: { id, name, isDefault?, isForAll?, filters, advancedFilters, hiddenColumns, columnOrder, colRules? (isForAll only) }
  const INIT_COL_ORDER = MOCK_COLUMNS.map(c => c.id);
  const [roleViews, setRoleViews] = useState({
    dev: {
      views: [
        { id: "dev_default", name: "Default view", isDefault: true, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER] },
        { id: "dev_forall", name: "View for all", isForAll: true, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER], colRules: {} },
      ],
      activeViewId: "dev_default",
    },
    owner: {
      views: [
        { id: "owner_default", name: "Default view", isDefault: true, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER] },
        { id: "owner_forall", name: "View for all", isForAll: true, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER], colRules: {} },
      ],
      activeViewId: "owner_default",
    },
    user: {
      views: [{ id: "user_default", name: "Default view", isDefault: true, filters: [], advancedFilters: [], hiddenColumns: new Set(), columnOrder: [...INIT_COL_ORDER] }],
      activeViewId: "user_default",
    },
  });
  // Save feedback
  const [saveStatus, setSaveStatus] = useState(null); // null | "saved" | "pushed"
  const [sorts, setSorts] = useState([
    { id: "s1", columnId: "col_date", direction: "desc" },
    { id: "s2", columnId: "col_priority", direction: "asc", customOrder: ["Urgent", "High", "Normal", "Low"] },
  ]);

  const filterDropdownPop = usePopover();
  const sortPickerPop = usePopover();
  const columnVisPop = usePopover();

  // ── Dirty tracking ────────────────────────────────────────
  const [dirtyViews, setDirtyViews] = useState(new Set());
  const markDirty = (viewId) => {
    setDirtyViews(prev => {
      if (prev.has(viewId)) return prev;
      const next = new Set(prev);
      next.add(viewId);
      return next;
    });
  };
  const clearDirty = (viewId) => {
    setDirtyViews(prev => {
      if (!prev.has(viewId)) return prev;
      const next = new Set(prev);
      next.delete(viewId);
      return next;
    });
  };

  // ── Helper: update the active view of the role ────────────
  const updateActiveView = (role, updater) => {
    const activeId = roleViews[role]?.activeViewId;
    if (!activeId) return;
    markDirty(activeId);
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

  // ── Preview role ──────────────────────────────────
  const [previewRole, setPreviewRole] = useState("dev");

  // ── Column access rules ───────────────────────────────────
  // Committed: derived from saved shared views — only apply after a "View for all"
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
    const forAllView = roleViews.dev.views.find(v => v.isForAll);
    return colRulesObjToMap(forAllView?.colRules);
  }, [roleViews.dev]);

  const ownerColRules = useMemo(() => {
    const forAllView = roleViews.owner.views.find(v => v.isForAll);
    const m = new Map();
    for (const [colId, level] of Object.entries(forAllView?.colRules?.user || {})) {
      m.set(colId, { user: level });
    }
    return m;
  }, [roleViews.owner]);

  // setColRule: writes to the "View for all" tab only
  const setColRule = (colId, targetRole, level) => {
    if (!activeView?.isForAll) return;
    updateActiveView(previewRole, v => {
      const rules = { ...(v.colRules || {}) };
      const targetRules = { ...(rules[targetRole] || {}) };
      if (level === "full") delete targetRules[colId];
      else targetRules[colId] = level;
      return { ...v, colRules: { ...rules, [targetRole]: targetRules } };
    });
  };

  // ── Filter access rules ────────────────────────────────────
  // Map<filterId, { owner?: FilterAccess, user?: FilterAccess }>
  const [devFilterRules, setDevFilterRules] = useState(new Map());
  // Map<filterId, { user?: FilterAccess }>
  const [ownerFilterRules, setOwnerFilterRules] = useState(new Map());

  const setFilterRule = (filterId, targetRole, level) => {
    // Mark the forAll view as dirty since filter rules belong to it
    const forAllId = roleViews[previewRole]?.views.find(v => v.isForAll)?.id;
    if (forAllId) markDirty(forAllId);
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

  // ── Effective access based on the preview role ─────────
  const getEffectiveColAccess = useCallback((colId) => {
    if (previewRole === "dev") return "full";
    if (previewRole === "owner") return devColRules.get(colId)?.owner ?? "full";
    // user: most restrictive between Dev and Owner
    const d = devColRules.get(colId)?.user ?? "full";
    const o = ownerColRules.get(colId)?.user ?? "full";
    return mostRestrictiveCol(d, o);
  }, [previewRole, devColRules, ownerColRules]);

  const getEffectiveFilterAccess = useCallback((filterId) => {
    if (previewRole === "dev") return "visible";
    // Default "visible": a locked filter is shown unless an explicit rule says otherwise
    if (previewRole === "owner") return devFilterRules.get(filterId)?.owner ?? "visible";
    const d = devFilterRules.get(filterId)?.user ?? "visible";
    const o = ownerFilterRules.get(filterId)?.user ?? "visible";
    return mostRestrictiveFilter(d, o);
  }, [previewRole, devFilterRules, ownerFilterRules]);

  // ── Values derived from the active view ────────────────────────
  const activeView = roleViews[previewRole]?.views.find(v => v.id === roleViews[previewRole].activeViewId)
    ?? roleViews[previewRole]?.views[0];

  const filters         = activeView?.filters ?? [];
  const advancedFilters = activeView?.advancedFilters ?? [];
  const hiddenColumns   = activeView?.hiddenColumns ?? new Set();
  const columnOrder     = activeView?.columnOrder ?? MOCK_COLUMNS.map(c => c.id);

  // Draft: rules of the active view being edited (for the columns panel display)
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
  const advCloseRef = useRef(null);

  useEffect(() => {
    if (!advBuilderOpen) return;
    const handler = (e) => {
      if (advBuilderRef.current && !advBuilderRef.current.contains(e.target)) {
        advCloseRef.current?.();
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

  // ID for the advanced filter currently being built (new or editing)
  const [liveAdvFilterId, setLiveAdvFilterId] = useState(null);

  const handleAdvancedClick = () => {
    const c = filterDropdownPop.coords;
    filterDropdownPop.close();
    setEditingAdvFilter(null);
    const newId = `af_${Date.now()}`;
    setLiveAdvFilterId(newId);
    // Pre-create an empty advanced filter in the view
    updateActiveView(previewRole, (v) => ({
      ...v,
      advancedFilters: [...v.advancedFilters, { id: newId, logic: "and", conditions: [], locked: false }],
    }));
    setAdvBuilderCoords(c);
    setAdvBuilderOpen(true);
  };

  const handleAdvChange = useCallback(({ logic, conditions }) => {
    const id = liveAdvFilterId;
    if (!id) return;
    updateActiveView(previewRole, (v) => ({
      ...v,
      advancedFilters: v.advancedFilters.map((f) => f.id === id ? { ...f, logic, conditions } : f),
    }));
  }, [liveAdvFilterId, previewRole]);

  const handleAdvClose = () => {
    // Remove the filter if it has no valid conditions
    if (liveAdvFilterId) {
      updateActiveView(previewRole, (v) => ({
        ...v,
        advancedFilters: v.advancedFilters.filter((f) => f.id !== liveAdvFilterId || (f.conditions && f.conditions.length > 0)),
      }));
    }
    setAdvBuilderOpen(false);
    setEditingAdvFilter(null);
    setLiveAdvFilterId(null);
  };
  advCloseRef.current = handleAdvClose;

  const editAdvancedFilter = (af) => {
    const triggerEl = filterDropdownPop.triggerRef.current;
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      setAdvBuilderCoords({ top: rect.bottom + 4, left: rect.left });
    }
    setEditingAdvFilter(af);
    setLiveAdvFilterId(af.id);
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

  // ── View saving ─────────────────────────────────────────
  const saveForSelf = () => {
    if (activeView?.id) clearDirty(activeView.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // "Save for all": pushes the "View for all" config to lower roles' default views
  const executeSaveForAll = () => {
    const forAllView = roleViews[previewRole].views.find(v => v.isForAll);
    if (!forAllView) return;
    const src = forAllView;
    const targetRoles = previewRole === "dev" ? ["owner", "user"] : previewRole === "owner" ? ["user"] : [];
    if (targetRoles.length === 0) return;

    const isColAccessible = (colId, targetRole) => {
      if (previewRole === "dev") {
        const level = src.colRules?.[targetRole]?.[colId] ?? "full";
        return level !== "none" && level !== "ask";
      } else {
        const devLevel = devColRules.get(colId)?.user ?? "full";
        const ownerDraft = src.colRules?.user?.[colId] ?? "full";
        const access = mostRestrictiveCol(devLevel, ownerDraft);
        return access !== "none" && access !== "ask";
      }
    };

    setRoleViews(prev => {
      const next = { ...prev };
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

    const forAllId = roleViews[previewRole].views.find(v => v.isForAll)?.id;
    if (forAllId) clearDirty(forAllId);
    setSaveStatus("pushed");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Only the "View for all" tab qualifies for access configuration
  const isForAllView = !!activeView?.isForAll;

  // ── View management ──────────────────────────────────────────
  const addPersonalView = () => {
    const id = `personal_${previewRole}_${Date.now()}`;
    const src = activeView;
    setRoleViews(prev => ({
      ...prev,
      [previewRole]: {
        views: [...prev[previewRole].views, {
          id, name: "New view", isDefault: false,
          filters: [...src.filters.filter(f => !f.locked)], advancedFilters: [...src.advancedFilters.filter(af => !af.locked)],
          hiddenColumns: new Set(src.hiddenColumns), columnOrder: [...src.columnOrder],
        }],
        activeViewId: id,
      },
    }));
  };

  const deletePersonalView = (viewId) => {
    const view = roleViews[previewRole].views.find(v => v.id === viewId);
    if (view?.isDefault || view?.isForAll) return;
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

  // All filters (simple + advanced) sorted by creation order (timestamp extracted from id)
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

  // Only dev/owner can configure access; user restricts no one
  const canEditAccess = previewRole !== "user";

  // Columns effectively hidden based on the preview role
  // For dev: those hidden in the active view
  // For owner/user: union of the active view AND access restrictions
  const effectiveHiddenCols = previewRole === "dev"
    ? hiddenColumns
    : new Set([
        ...hiddenColumns,
        ...orderedColumns.filter((c) => {
          const a = getEffectiveColAccess(c.id);
          return a === "none" || a === "ask";
        }).map((c) => c.id),
      ]);

  // Columns visible in the columns panel: excludes "none" (fully invisible)
  const accessibleColsForPanel = previewRole === "dev"
    ? orderedColumns
    : orderedColumns.filter((c) => getEffectiveColAccess(c.id) !== "none");

  // Columns selectable in pickers (sort, filter): excludes none and ask (not visible)
  const selectableColumns = previewRole === "dev"
    ? MOCK_COLUMNS
    : MOCK_COLUMNS.filter((c) => {
        const a = getEffectiveColAccess(c.id);
        return a !== "none" && a !== "ask";
      });

  // editorRole for components (dev can do everything, owner can manage user, user = read-only)
  const editorRole = previewRole === "user" ? "owner" : previewRole;

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Screen-reader live region for filter/sort announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {filters.length > 0 && `${filters.length} active filter${filters.length > 1 ? "s" : ""}`}
        {sorts.length > 0 && `, ${sorts.length} active sort${sorts.length > 1 ? "s" : ""}`}
      </div>

      {/* ── Role switcher — Linear/Notion style ── */}
      <div className="font-sans flex items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mr-1">
          View
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
            Simulation · {previewRole === "owner" ? "Owner" : "User"} view
          </span>
        )}
      </div>

      {/* ── View switcher ── */}
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

        {/* ── Unified View block (filters + columns) ── */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">

          {/* View block header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">View</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => document.documentElement.classList.toggle("dark")}
                aria-label="Toggle light/dark mode"
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white w-6 h-6 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"
              >
                <Sun size={12} className="block dark:hidden" />
                <Moon size={12} className="hidden dark:block" />
              </button>
              {(() => {
                const isDirty = activeView?.id ? dirtyViews.has(activeView.id) : false;
                if (activeView?.isForAll) {
                  return (
                    <button
                      onClick={executeSaveForAll}
                      disabled={!isDirty && saveStatus !== "pushed"}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        saveStatus === "pushed"
                          ? "border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : isDirty
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                          : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-600"
                      }`}
                    >
                      <Users size={11} />
                      {saveStatus === "pushed" ? "Saved for all ✓" : "Save for all"}
                    </button>
                  );
                }
                if (activeView?.isDefault) {
                  return (
                    <button
                      onClick={addPersonalView}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-800 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      <Plus size={11} />
                      Save as new view
                    </button>
                  );
                }
                return (
                  <button
                    onClick={saveForSelf}
                    disabled={!isDirty && saveStatus !== "saved"}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      saveStatus === "saved"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : isDirty
                        ? "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-600"
                    }`}
                  >
                    <Save size={11} />
                    {saveStatus === "saved" ? "Saved ✓" : "Save"}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Filters row */}
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
              className={`inline-flex items-center gap-1.5 rounded-md border transition-all duration-150 text-xs font-medium active:scale-[0.97] will-change-transform ${
                !hasUserFilters
                  ? "border-zinc-200 bg-white px-2.5 py-1 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  : "border-dashed border-zinc-400 w-6 h-6 justify-center bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {!hasUserFilters ? <><Filter size={12} />Filter</> : <Plus size={12} />}
            </button>
          </div>

          {/* Internal separator */}
          <div className="border-t border-zinc-100 dark:border-zinc-800" />

          {/* Columns row */}
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
                    ? `${visibleCount} / ${totalCount} columns visible`
                    : "All columns visible"}
                </button>
              </div>
            );
          })()}
        </div>

        {/* ── Sorts ── */}
        <div className="flex flex-wrap items-center gap-1.5">
          {!hasSorts ? (
            <button
              ref={sortPickerPop.triggerRef}
              onClick={sortPickerPop.toggle}
              aria-expanded={sortPickerPop.isOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all duration-150 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-700 active:scale-[0.97] will-change-transform dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ArrowUpDown size={13} />
              Sort
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
                aria-label="Add a sort"
                className="inline-flex items-center justify-center rounded-md border border-dashed border-zinc-400 w-6 h-6 bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-all duration-150 active:scale-[0.97] will-change-transform dark:border-zinc-500 dark:bg-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-800"
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
        onChange={handleAdvChange}
        onClose={handleAdvClose}
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
      <TableBody
        columns={orderedColumns}
        hiddenColumns={effectiveHiddenCols}
        lockedHiddenColumns={lockedHiddenColumns}
        sorts={sorts}
        filters={filters}
      />
    </div>
  );
}
