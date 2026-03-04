import { forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 ${className}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardContent = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props} />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardContent };
