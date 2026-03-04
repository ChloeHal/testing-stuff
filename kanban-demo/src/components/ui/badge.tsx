import { forwardRef } from "react";

const Badge = forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
