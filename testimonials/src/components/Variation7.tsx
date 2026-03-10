import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TESTIMONIALS } from "../data";
import { Avatar } from "./Avatar";

/** Big Quote — citation géante, typographie serif dominant */
export function Variation7() {
  const [current, setCurrent] = useState(0);
  const t = TESTIMONIALS[current];

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="relative">
        <span className="absolute -top-8 -left-2 text-[120px] leading-none text-brand-100 font-serif select-none pointer-events-none">
          &ldquo;
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-slate-800 leading-snug">
              {t.quote}
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <Avatar initials={t.avatar} index={current} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {t.name}
                  {t.badge && (
                    <span className="ml-2 inline-block text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {t.role} @ {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-14 flex gap-3 justify-center flex-wrap">
        {TESTIMONIALS.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              i === current
                ? "bg-brand-500 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300"
            }`}
          >
            <Avatar initials={item.avatar} index={i} size="sm" />
            {item.name.split(" ")[0]}
          </button>
        ))}
      </div>
    </section>
  );
}
