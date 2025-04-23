"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className, ...props }, ref) => {
    // Ensure value is within bounds (0-100)
    const boundedValue = Math.max(0, Math.min(100, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <div
          className='h-full bg-blue-600 transition-all dark:bg-blue-500'
          style={{ width: `${boundedValue}%` }}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={boundedValue}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
