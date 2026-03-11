import { type ReactNode } from "react";

export function ScreenCarousel({
  screens,
  sectionTitle,
  sectionDesc,
}: {
  screens: { label: string; content: ReactNode }[];
  sectionTitle: string;
  sectionDesc: string;
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{sectionTitle}</h2>
        <p className="text-slate-500 mt-1">{sectionDesc}</p>
      </div>

      <div className="space-y-8">
        {screens.map((s, i) => (
          <div key={i}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{s.label}</p>
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}
