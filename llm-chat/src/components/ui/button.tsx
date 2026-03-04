import { forwardRef } from "react";

const Button = forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-brand-700 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
export { Button };
