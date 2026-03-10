import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TESTIMONIALS, SECTION_TITLE, SECTION_HEADLINE } from "../data";
import { Avatar } from "./Avatar";

/** Accordion — témoignages dépliables */
export function Variation5() {
  const [openId, setOpenId] = useState<number | null>(TESTIMONIALS[0].id);

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-500 mb-3">
        {SECTION_TITLE}
      </p>
      <h2 className="text-center text-3xl font-bold text-slate-900 mb-12 whitespace-pre-line">
        {SECTION_HEADLINE}
      </h2>

      <div className="space-y-3">
        {TESTIMONIALS.map((t, i) => {
          const isOpen = openId === t.id;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : t.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <Avatar initials={t.avatar} index={i} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t.name}
                    {t.badge && (
                      <span className="ml-1.5 inline-block text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {t.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {t.role} @ {t.company}
                  </p>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className="text-slate-400 text-lg"
                >
                  &#9662;
                </motion.span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
