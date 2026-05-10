import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#1C1917]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-[#78716C] pointer-events-none">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#78716C] transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-[#E7E5E4] hover:border-gray-300",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center text-[#78716C]">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#78716C]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, helperText, wrapperClassName, id, ...props },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[#1C1917]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#1C1917] placeholder:text-[#78716C] transition-colors resize-none",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E7E5E4] hover:border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#78716C]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, wrapperClassName, id, options, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[#1C1917]"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm text-[#1C1917] transition-colors appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[#E7E5E4] hover:border-gray-300",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-[#78716C]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Input, Textarea, Select };
