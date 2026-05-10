"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarDays,
  CheckSquare,
  Target,
  UtensilsCrossed,
  Flame,
  FileText,
  MapPin,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "#E8526A",
    bgColor: "#fdf2f4",
  },
  {
    label: "Finance",
    href: "/dashboard/finance",
    icon: TrendingUp,
    color: "#10B981",
    bgColor: "#f0fdf4",
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    color: "#6366F1",
    bgColor: "#eef2ff",
  },
  {
    label: "Chores",
    href: "/dashboard/chores",
    icon: CheckSquare,
    color: "#F59E0B",
    bgColor: "#fffbeb",
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    color: "#8B5CF6",
    bgColor: "#f5f3ff",
  },
  {
    label: "Meals",
    href: "/dashboard/meals",
    icon: UtensilsCrossed,
    color: "#EF4444",
    bgColor: "#fef2f2",
  },
  {
    label: "Habits",
    href: "/dashboard/habits",
    icon: Flame,
    color: "#06B6D4",
    bgColor: "#ecfeff",
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: FileText,
    color: "#64748B",
    bgColor: "#f8fafc",
  },
  {
    label: "Activities",
    href: "/dashboard/activities",
    icon: MapPin,
    color: "#F97316",
    bgColor: "#fff7ed",
  },
];

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  partner?: {
    name?: string;
    avatar?: string;
    online?: boolean;
  };
  subscription?: {
    status?: string;
    trialDaysLeft?: number;
  };
  onUpgradeClick?: () => void;
}

export function Sidebar({
  user,
  partner,
  subscription,
  onUpgradeClick,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex flex-col h-full w-60 bg-white border-r border-[#E7E5E4] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#E7E5E4]">
        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary-500">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* House shape */}
            <path d="M3 10.5L12 3L21 10.5V21H15V16H9V21H3V10.5Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Left heart */}
            <path d="M8.5 12.2C8.5 11.6 9 11 9.5 11.4C10 11 10.5 11.6 10.5 12.2C10.5 13.1 9.5 14 9.5 14C9.5 14 8.5 13.1 8.5 12.2Z" fill="white" />
            {/* Right heart */}
            <path d="M13.5 12.2C13.5 11.6 14 11 14.5 11.4C15 11 15.5 11.6 15.5 12.2C15.5 13.1 14.5 14 14.5 14C14.5 14 13.5 13.1 13.5 12.2Z" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-lg text-[#1C1917] tracking-tight">
          DuoHome
        </span>
      </div>

      {/* Partner avatars */}
      {(user || partner) && (
        <div className="px-4 py-3 border-b border-[#E7E5E4]">
          <p className="text-xs text-[#78716C] font-medium mb-2 uppercase tracking-wider">
            Your Household
          </p>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="sm"
                  online={true}
                  color="#E8526A"
                />
                <span className="text-xs font-medium text-[#1C1917] truncate max-w-[60px]">
                  {user.name?.split(" ")[0] || "You"}
                </span>
              </div>
            )}
            {partner && (
              <>
                <ChevronRight className="h-3 w-3 text-[#78716C]" />
                <div className="flex items-center gap-1.5">
                  <Avatar
                    src={partner.avatar}
                    name={partner.name}
                    size="sm"
                    online={partner.online}
                    color="#6366F1"
                  />
                  <span className="text-xs font-medium text-[#1C1917] truncate max-w-[60px]">
                    {partner.name?.split(" ")[0] || "Partner"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "text-[#1C1917]"
                      : "text-[#78716C] hover:text-[#1C1917] hover:bg-gray-50"
                  )}
                  style={
                    active
                      ? { backgroundColor: item.bgColor, color: item.color }
                      : undefined
                  }
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-lg"
                    style={active ? { backgroundColor: item.color + "20" } : undefined}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={active ? { color: item.color } : undefined}
                    />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#E7E5E4] p-3 space-y-1">
        {/* Subscription status */}
        {subscription && (
          <div className="mb-2 px-1">
            {subscription.status === "trialing" ? (
              <button
                onClick={onUpgradeClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <CreditCard className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-xs text-primary-700 font-medium text-left">
                  Trial: {subscription.trialDaysLeft} days left
                </span>
                <Badge variant="default" className="ml-auto text-xs">
                  Upgrade
                </Badge>
              </button>
            ) : subscription.status === "active" ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <CreditCard className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">
                  Active subscription
                </span>
                <Badge variant="success" className="ml-auto text-xs">
                  Pro
                </Badge>
              </div>
            ) : null}
          </div>
        )}

        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#78716C] hover:text-[#1C1917] hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {/* User profile at bottom */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="sm"
              color="#E8526A"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1C1917] truncate">
                {user.name || "You"}
              </p>
              <p className="text-xs text-[#78716C] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
