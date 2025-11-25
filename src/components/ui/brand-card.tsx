import * as React from "react";
import { cn } from "@/lib/utils";

const BrandCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-ink/25 bg-canvas p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
      className
    )}
    {...props}
  />
));
BrandCard.displayName = "BrandCard";

export { BrandCard };
