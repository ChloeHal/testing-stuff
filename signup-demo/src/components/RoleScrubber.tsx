import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface Props {
  options: string[];
  value: number;
  onChange: (index: number) => void;
}

/**
 * Dock-style magnification selector.
 * Options scale up as the cursor approaches, like macOS Dock.
 */
export default function RoleScrubber({ options, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(-1);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
    },
    [mouseX]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(-1);
  }, [mouseX]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-end justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 transition-colors duration-200 hover:border-slate-300"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {options.map((option, i) => (
        <DockItem
          key={option}
          label={option}
          selected={i === value}
          mouseX={mouseX}
          isHovering={isHovering}
          containerRef={containerRef}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  );
}

function DockItem({
  label,
  selected,
  mouseX,
  isHovering,
  containerRef,
  onClick,
}: {
  label: string;
  selected: boolean;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isHovering: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}) {
  const itemRef = useRef<HTMLButtonElement>(null);

  // Distance from cursor to this item's center → scale
  const distance = useTransform(mouseX, (mx) => {
    if (mx < 0 || !itemRef.current || !containerRef.current) return 999;
    const itemRect = itemRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2 - containerRect.left;
    return Math.abs(mx - itemCenter);
  });

  const rawScale = useTransform(distance, (d) => {
    if (!isHovering) return 1;
    // Gaussian-like falloff: max magnification at d=0, fading over ~80px
    const sigma = 70;
    return 1 + 0.18 * Math.exp(-(d * d) / (2 * sigma * sigma));
  });

  const scale = useSpring(rawScale, { stiffness: 400, damping: 25 });

  const rawY = useTransform(distance, (d) => {
    if (!isHovering) return 0;
    const sigma = 70;
    return -4 * Math.exp(-(d * d) / (2 * sigma * sigma));
  });

  const y = useSpring(rawY, { stiffness: 400, damping: 25 });

  // Shadow intensity based on proximity
  const shadow = useTransform(distance, (d) => {
    if (!isHovering) return "0 0 0 rgba(0,0,0,0)";
    const intensity = Math.max(0, 1 - d / 80);
    return `0 ${2 + intensity * 4}px ${4 + intensity * 8}px rgba(0,0,0,${0.04 + intensity * 0.08})`;
  });

  return (
    <motion.button
      ref={itemRef}
      type="button"
      onClick={onClick}
      style={{ scale, y, boxShadow: shadow }}
      className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
        selected
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </motion.button>
  );
}
