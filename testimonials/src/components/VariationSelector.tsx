const LABELS = [
  "Accordion",
  "Big Quote",
  "Vertical Ticker",
  "Stacked Cards",
  "Scattered Pile",
];

export function VariationSelector({
  active,
  onChange,
}: {
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <nav className="inline-flex gap-1 rounded-full bg-slate-900 p-1 shadow-lg">
      {LABELS.map((label, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            active === i
              ? "bg-white text-slate-900"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
