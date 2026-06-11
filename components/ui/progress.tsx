import * as React from "react";

import { cn } from "@/lib/utils/cn";

type ProgressProps = React.ComponentProps<"div"> & {
  value: number;
  indicatorClassName?: string;
};

function Progress({ value, className, indicatorClassName, ...props }: ProgressProps) {
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      {...props}
    >
      <div
        className={cn("h-full rounded-full bg-slate-950", indicatorClassName)}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export { Progress };
