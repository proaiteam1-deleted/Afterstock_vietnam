import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-50 text-slate-600",
        success: "border-red-200 bg-red-50 text-red-600",
        danger: "border-blue-200 bg-blue-50 text-blue-600",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        accent: "border-slate-300 bg-slate-950 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
