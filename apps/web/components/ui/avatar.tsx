import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
  color?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const indicatorSizes = {
  xs: "h-1.5 w-1.5",
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
  xl: "h-4 w-4",
};

export function Avatar({
  src,
  name,
  size = "md",
  online,
  className,
  color,
}: AvatarProps) {
  const initials = name ? getInitials(name) : "?";
  const bgColor = color || "#E8526A";

  return (
    <div className={cn("relative flex-shrink-0 inline-block", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold overflow-hidden",
          sizeClasses[size]
        )}
        style={!src ? { backgroundColor: bgColor, color: "white" } : undefined}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            indicatorSizes[size],
            online ? "bg-emerald-500" : "bg-gray-300"
          )}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string; color?: string }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((avatar, i) => (
        <div
          key={i}
          className="-ml-2 first:ml-0 ring-2 ring-white rounded-full"
          style={{ zIndex: visible.length - i }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "-ml-2 ring-2 ring-white rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
