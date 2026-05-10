"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow focus-visible:ring-primary-500",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500",
        outline:
          "border border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500",
        ghost:
          "bg-transparent text-[#78716C] hover:bg-gray-100 hover:text-[#1C1917] focus-visible:ring-gray-500",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500",
        indigo:
          "bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-sm hover:shadow focus-visible:ring-indigo-500",
        success:
          "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus-visible:ring-emerald-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
