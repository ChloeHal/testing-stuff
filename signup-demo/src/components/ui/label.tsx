import { forwardRef } from "react";

const Label = forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-xs font-medium text-slate-500 ${className}`}
      {...props}
    />
  )
);
Label.displayName = "Label";
export { Label };
