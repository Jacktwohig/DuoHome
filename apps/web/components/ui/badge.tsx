import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-700",
        secondary: "bg-gray-100 text-gray-700",
        outline: "border border-[#E7E5E4] text-[#78716C]",
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-700",
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        indigo: "bg-indigo-100 text-indigo-700",
        // Status variants
        trialing: "bg-blue-100 text-blue-700",
        active: "bg-emerald-100 text-emerald-700",
        canceled: "bg-gray-100 text-gray-600",
        past_due: "bg-red-100 text-red-700",
        // Priority variants
        low: "bg-slate-100 text-slate-600",
        medium: "bg-amber-100 text-amber-700",
        high: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
