import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  formatStr = "MMM d, yyyy"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDaysRemaining(endDate: string): number {
  const end = parseISO(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + "s"}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentage(current: number, total: number): number {
  if (total === 0) return 0;
  return clamp(Math.round((current / total) * 100), 0, 100);
}

export const MODULE_COLORS = {
  finance: "#10B981",
  calendar: "#6366F1",
  chores: "#F59E0B",
  goals: "#8B5CF6",
  meals: "#EF4444",
  habits: "#06B6D4",
  notes: "#64748B",
  activities: "#F97316",
} as const;
