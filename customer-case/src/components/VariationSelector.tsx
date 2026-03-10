const LABELS = [
  "Bento A",
  "Bento B",
  "Bento C",
  "Bento D",
  "Bento E",
  "Bento F",
  "Bento G",
  "Bento H",
  "Bento I",
  "Bento J",
];

export function VariationSelector({
  active,
  onChange,
}: {
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <nav className="flex items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
      {LABELS.map((label, i) => (
        <button
          key={label}
          onClick={() => onChange(i)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-150 ${
            active === i
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
