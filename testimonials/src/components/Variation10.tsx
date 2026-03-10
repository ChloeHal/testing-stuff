import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { TESTIMONIALS, SECTION_TITLE, SECTION_HEADLINE } from "../data";
import { Avatar } from "./Avatar";

// ── 6 tool logos ─────────────────────────────────────────────────────────
const TOOL_LOGOS: { name: string; color: string; bg: string; icon: React.ReactElement }[] = [
  {
    name: "Slack",
    color: "#E01E5A",
    bg: "#FDF2F4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    color: "#000000",
    bg: "#F5F5F5",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.09c-.467-.373-.7-.606-2.614-.466l-12.77.84c-.466.046-.56.28-.373.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.84c-.56.047-.747.327-.747.98zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.606.326-1.166.513-1.633.513-.746 0-.933-.233-1.493-.933l-4.57-7.186v6.953l1.446.327s0 .84-1.166.84l-3.22.186c-.093-.186 0-.653.327-.726l.84-.233V9.854L7.822 9.76c-.093-.42.14-1.026.793-1.073l3.46-.233 4.757 7.28v-6.44l-1.213-.14c-.093-.513.28-.886.746-.933zm-15.037-5.8L17.77 1.4c1.633-.14 2.053-.047 3.08.7l4.244 2.986c.7.513.933.747.933 1.38v16.17c0 1.026-.373 1.633-1.68 1.726l-15.458.933c-.98.047-1.447-.093-1.96-.746l-3.127-4.057c-.56-.746-.793-1.306-.793-1.96V3.653c0-.84.373-1.54 1.447-1.62z" />
      </svg>
    ),
  },
  {
    name: "Sheets",
    color: "#0F9D58",
    bg: "#F0FBF4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M19 11V9h-5V5H6v14h13v-2h-5v-6h5zm-7 6H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V7h4v2zm8-6H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    name: "Trello",
    color: "#0052CC",
    bg: "#EEF4FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M21 0H3C1.34 0 0 1.34 0 3v18c0 1.66 1.34 3 3 3h18c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zM10.44 18.18c0 .75-.61 1.36-1.36 1.36H5.18c-.75 0-1.36-.61-1.36-1.36V5.18c0-.75.61-1.36 1.36-1.36h3.9c.75 0 1.36.61 1.36 1.36v13zM20.18 13.64c0 .75-.61 1.36-1.36 1.36h-3.9c-.75 0-1.36-.61-1.36-1.36V5.18c0-.75.61-1.36 1.36-1.36h3.9c.75 0 1.36.61 1.36 1.36v8.46z" />
      </svg>
    ),
  },
  {
    name: "Odoo",
    color: "#714B67",
    bg: "#F8F2F6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
      </svg>
    ),
  },
  {
    name: "Excel",
    color: "#217346",
    bg: "#EFF8F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <path d="M23 1.5H8.05L0 3.16v17.68L8.05 22.5H23c.55 0 1-.45 1-1v-19c0-.55-.45-1-1-1zM8 19H3V5h5v14zm14 0H10V5h12v14zm-9-11l2.5 4L12.5 16h2l1.5-2.5L17.5 16h2L16.5 12l3-4h-2l-1.5 2.5L14.5 8h-2z" />
      </svg>
    ),
  },
];

// ── Render order: interleave cards & logos ───────────────────────────────
type PileItem =
  | { kind: "card"; dataIdx: number }
  | { kind: "logo"; logoIdx: number };

const RENDER_ORDER: PileItem[] = [
  { kind: "card", dataIdx: 0 },
  { kind: "logo", logoIdx: 0 },
  { kind: "card", dataIdx: 6 },
  { kind: "logo", logoIdx: 1 },
  { kind: "card", dataIdx: 3 },
  { kind: "logo", logoIdx: 2 },
  { kind: "card", dataIdx: 5 },
  { kind: "logo", logoIdx: 3 },
  { kind: "card", dataIdx: 4 },
  { kind: "logo", logoIdx: 4 },
  { kind: "card", dataIdx: 2 },
  { kind: "logo", logoIdx: 5 },
  { kind: "card", dataIdx: 1 },
];

// Total items for stagger calculation on mobile
const TOTAL_ITEMS = RENDER_ORDER.length;

// ── Desktop pile positions ──────────────────────────────────────────────
const CARD_PILE: Record<number, { x: number; y: number; rotate: number }> = {
  0: { x: 0, y: 0, rotate: -2 },
  1: { x: 40, y: -30, rotate: 3 },
  2: { x: -100, y: 80, rotate: -5 },
  3: { x: 310, y: -140, rotate: 9 },
  4: { x: -260, y: 160, rotate: -3 },
  5: { x: 280, y: 170, rotate: 6 },
  6: { x: -320, y: 10, rotate: -7 },
};

const LOGO_PILE: { x: number; y: number; rotate: number }[] = [
  { x: 360, y: -50, rotate: -12 },
  { x: -380, y: -100, rotate: 14 },
  { x: 120, y: -200, rotate: 8 },
  { x: -130, y: 210, rotate: -10 },
  { x: 350, y: 100, rotate: 6 },
  { x: -50, y: -190, rotate: -16 },
];

// ── Mobile pile positions (scaled down) ─────────────────────────────────
const CARD_PILE_M: Record<number, { x: number; y: number; rotate: number }> = {
  0: { x: 0, y: 0, rotate: -2 },
  1: { x: 15, y: -20, rotate: 2 },
  2: { x: -40, y: 50, rotate: -4 },
  3: { x: 120, y: -100, rotate: 7 },
  4: { x: -100, y: 110, rotate: -2 },
  5: { x: 100, y: 120, rotate: 5 },
  6: { x: -120, y: 5, rotate: -5 },
};

const LOGO_PILE_M: { x: number; y: number; rotate: number }[] = [
  { x: 140, y: -30, rotate: -10 },
  { x: -145, y: -70, rotate: 12 },
  { x: 45, y: -150, rotate: 6 },
  { x: -50, y: 150, rotate: -8 },
  { x: 135, y: 70, rotate: 5 },
  { x: -20, y: -140, rotate: -12 },
];

// ── Expulsion directions ────────────────────────────────────────────────
const CARD_EXPEL: Record<number, { x: number; y: number; rotate: number }> = {
  0: { x: -900, y: -400, rotate: -25 },
  1: { x: 100, y: -600, rotate: 15 },
  2: { x: -500, y: 500, rotate: -20 },
  3: { x: 900, y: -500, rotate: 30 },
  4: { x: -700, y: 600, rotate: -18 },
  5: { x: 800, y: 500, rotate: 22 },
  6: { x: -900, y: 400, rotate: -28 },
};

const LOGO_EXPEL: { x: number; y: number; rotate: number }[] = [
  { x: 800, y: -300, rotate: -30 },
  { x: -800, y: -200, rotate: 25 },
  { x: 400, y: -600, rotate: 20 },
  { x: -400, y: 600, rotate: -22 },
  { x: 700, y: 500, rotate: 28 },
  { x: -600, y: -500, rotate: -35 },
];

const LOGO_SIZE = 64;
const CARD_W = 240;
const CARD_W_M = 200;


function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

// ── Helper: interpolate a value between pile and expel based on progress
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Variation10() {
  const [itemProgress, setItemProgress] = useState<number[]>(
    () => Array(TOTAL_ITEMS).fill(0)
  );
  const isMobile = useIsMobile();
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // ── Scroll-driven staggered expulsion (both mobile & desktop) ─────────
  const { scrollYProgress } = useScroll({
    target: scrollWrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const startScroll = 0.15;
    const endScroll = 0.85;
    const range = endScroll - startScroll;
    const perItem = range / TOTAL_ITEMS;

    const newProgress = RENDER_ORDER.map((_, i) => {
      // Items expel front-first: highest renderIdx (front) goes first
      const reversed = TOTAL_ITEMS - 1 - i;
      const itemStart = startScroll + reversed * perItem;
      const itemEnd = itemStart + perItem;
      if (v <= itemStart) return 0;
      if (v >= itemEnd) return 1;
      return (v - itemStart) / (itemEnd - itemStart);
    });
    setItemProgress(newProgress);
  });

  const cardW = isMobile ? CARD_W_M : CARD_W;
  const logoSize = isMobile ? 48 : LOGO_SIZE;

  // Enobase logo fades in only when the last item (bottom of pile) starts leaving
  const minProgress = Math.min(...itemProgress);
  const enobaseOpacity = minProgress > 0.5 ? (minProgress - 0.5) * 2 : 0;

  // ── Shared pile content (scroll-driven on both mobile & desktop) ──────
  const pileContent = (
    <>
      {!isMobile && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            boxShadow: "inset 0 0 60px 30px rgb(248 250 252)",
          }}
        />
      )}

      {RENDER_ORDER.map((item, renderIdx) => {
        const z = renderIdx + 1;
        const mobileT = itemProgress[renderIdx];

        // ── Logo ────────────────────────────────────────────────
        if (item.kind === "logo") {
          const tool = TOOL_LOGOS[item.logoIdx];
          const pile = isMobile ? LOGO_PILE_M[item.logoIdx] : LOGO_PILE[item.logoIdx];
          const expel = LOGO_EXPEL[item.logoIdx];

          return (
            <motion.div
              key={`logo-${tool.name}`}
              className="absolute flex items-center justify-center rounded-2xl border border-slate-200 shadow-lg"
              style={{
                width: logoSize,
                height: logoSize,
                left: "50%",
                top: "50%",
                marginLeft: -logoSize / 2,
                marginTop: -logoSize / 2,
                backgroundColor: tool.bg,
                color: tool.color,
                zIndex: z,
              }}
              animate={{
                x: lerp(pile.x, expel.x, mobileT),
                y: lerp(pile.y, expel.y, mobileT),
                rotate: lerp(pile.rotate, expel.rotate, mobileT),
                scale: lerp(1, 0.6, mobileT),
                opacity: 1 - mobileT,
              }}
              transition={{ duration: 0 }}
            >
              {tool.icon}
            </motion.div>
          );
        }

        // ── Card ────────────────────────────────────────────────
        const t = TESTIMONIALS[item.dataIdx];
        const pile = isMobile ? CARD_PILE_M[item.dataIdx] : CARD_PILE[item.dataIdx];
        const expel = CARD_EXPEL[item.dataIdx];

        return (
          <motion.div
            key={`card-${t.id}`}
            className="absolute bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-md"
            style={{
              width: cardW,
              left: "50%",
              top: "50%",
              marginLeft: -cardW / 2,
              marginTop: isMobile ? -100 : -120,
              zIndex: z,
            }}
            animate={{
              x: lerp(pile.x, expel.x, mobileT),
              y: lerp(pile.y, expel.y, mobileT),
              rotate: lerp(pile.rotate, expel.rotate, mobileT),
              scale: lerp(0.92, 0.8, mobileT),
              opacity: 1 - mobileT,
              boxShadow: `0 ${4 + renderIdx}px ${12 + renderIdx * 2}px -${3 + renderIdx}px rgba(0,0,0,${0.07 + renderIdx * 0.01})`,
            }}
            transition={{ duration: 0 }}
          >
            <p className="text-xs md:text-sm leading-relaxed text-slate-700">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2 md:gap-2.5 pt-3 border-t border-slate-100">
              <Avatar initials={t.avatar} index={item.dataIdx} size="sm" />
              <div>
                <p className="text-[11px] md:text-xs font-semibold text-slate-900">
                  {t.name}
                  {t.badge && (
                    <span className="ml-1 inline-block text-[9px] font-medium bg-amber-100 text-amber-700 px-1 py-px rounded-full">
                      {t.badge}
                    </span>
                  )}
                </p>
                <p className="text-[10px] md:text-[11px] text-slate-500">
                  {t.role} @ {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ── Enobase center logo (appears only when all items are gone) ──── */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          marginLeft: isMobile ? -45 : -60,
          marginTop: isMobile ? -45 : -60,
          width: isMobile ? 90 : 120,
          height: isMobile ? 90 : 120,
          zIndex: 0,
          opacity: enobaseOpacity,
        }}
      >
        <div
          className={`${isMobile ? "w-14 h-14" : "w-20 h-20"} rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30`}
        >
          <svg
            viewBox="0 0 40 40"
            width={isMobile ? 28 : 40}
            height={isMobile ? 28 : 40}
            fill="none"
          >
            <rect x="4" y="8" width="32" height="24" rx="4" stroke="white" strokeWidth="2.5" />
            <path d="M4 14h32" stroke="white" strokeWidth="2" />
            <path d="M14 14v18" stroke="white" strokeWidth="2" />
            <circle cx="26" cy="22" r="3" stroke="white" strokeWidth="2" />
            <path d="M9 20h2M9 26h2" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p
          className={`mt-1.5 md:mt-2 ${isMobile ? "text-xs" : "text-sm"} font-bold text-brand-600 tracking-tight`}
        >
          enobase
        </p>
      </div>
    </>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500 mb-3">
          {SECTION_TITLE}
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 whitespace-pre-line">
          {SECTION_HEADLINE}
        </h2>
      </div>

      <div
        ref={scrollWrapperRef}
        style={{
          height: "500vh",
          ...(isMobile ? { marginLeft: "-1rem", marginRight: "-1rem" } : {}),
        }}
      >
        <div
          className={`sticky top-0 overflow-hidden bg-slate-50 ${isMobile ? "" : "rounded-3xl"}`}
          style={{
            height: "100vh",
            width: isMobile ? "100vw" : "100%",
          }}
        >
          <div className="relative w-full h-full">
            {pileContent}
          </div>
        </div>
      </div>
    </section>
  );
}
