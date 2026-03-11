import { type ReactNode } from "react";

export function ErpFrame({
  children,
}: {
  children: ReactNode;
  activeNav?: string;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>
      <div className="bg-white p-5" style={{ minHeight: 420 }}>
        {children}
      </div>
    </div>
  );
}
