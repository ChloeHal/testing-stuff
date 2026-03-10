const COLORS = [
  "bg-brand-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
];

export function Avatar({
  initials,
  index,
  size = "md",
}: {
  initials: string;
  index: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sizeClass} ${COLORS[index % COLORS.length]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
