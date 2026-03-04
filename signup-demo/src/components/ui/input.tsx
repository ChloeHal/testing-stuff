import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-300 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
export { Input };
