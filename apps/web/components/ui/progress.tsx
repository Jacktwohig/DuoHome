"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  barClassName?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  color = "#E8526A",
  size = "md",
  animated = true,
  showLabel = false,
  label,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs text-[#78716C]">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-medium text-[#1C1917]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-100 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className={cn("h-full rounded-full", barClassName)}
            style={{ backgroundColor: color }}
          />
        ) : (
          <div
            className={cn("h-full rounded-full transition-all duration-500", barClassName)}
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}
