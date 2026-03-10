import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

export function useCountUp(
  target: number,
  /** should we start the animation? */
  active: boolean,
  duration = 0.6,
) {
  const [display, setDisplay] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (!active || ran.current) return;
    ran.current = true;
    const controls = animate(0, target, {
      duration,
      ease: [0.19, 1, 0.22, 1],
      onUpdate(v) {
        setDisplay(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [active, target, duration]);

  return display;
}
