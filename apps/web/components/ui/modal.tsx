"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-white rounded-2xl shadow-modal overflow-hidden",
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4]">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-[#1C1917]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-[#78716C] mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-gray-100 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E7E5E4] bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
