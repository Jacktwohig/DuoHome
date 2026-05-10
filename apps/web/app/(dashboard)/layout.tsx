"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { PricingModal } from "@/components/billing/PricingModal";
import { Button } from "@/components/ui/button";
import { getDaysRemaining } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/finance": "Finance",
  "/dashboard/calendar": "Calendar",
  "/dashboard/chores": "Chores",
  "/dashboard/goals": "Goals",
  "/dashboard/meals": "Meals",
  "/dashboard/habits": "Habits",
  "/dashboard/notes": "Notes & Documents",
  "/dashboard/activities": "Activities & Travel",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null>(null);
  const [partner, setPartner] = useState<{
    name?: string;
    avatar?: string;
    online?: boolean;
  } | null>(null);
  const [trialInfo, setTrialInfo] = useState<{
    status?: string;
    daysLeft?: number;
  }>({});

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return;

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, household_id, trial_ends_at")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser({
          id: authUser.id,
          name: profile.display_name || authUser.email?.split("@")[0],
          email: authUser.email,
          avatar: profile.avatar_url,
        });

        const daysLeft = getDaysRemaining(profile.trial_ends_at);

        // Load subscription
        if (profile.household_id) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("household_id", profile.household_id)
            .single();

          setTrialInfo({
            status: sub?.status || "trialing",
            daysLeft,
          });

          // Load partner
          const { data: partnerProfile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("household_id", profile.household_id)
            .neq("id", authUser.id)
            .single();

          if (partnerProfile) {
            setPartner({
              name: partnerProfile.display_name || "Partner",
              avatar: partnerProfile.avatar_url,
              online: Math.random() > 0.5, // TODO: Replace with real presence from Supabase Realtime
            });
          }
        }
      }
    }

    loadUserData();
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || "DuoHome";
  const showTrialBanner =
    trialInfo.status === "trialing" &&
    trialInfo.daysLeft !== undefined &&
    trialInfo.daysLeft <= 7;

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8] overflow-hidden">
      {/* Trial banner */}
      {showTrialBanner && (
        <TrialBanner
          daysLeft={trialInfo.daysLeft!}
          householdId={undefined}
          userId={user?.id}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            user={user || undefined}
            partner={partner || undefined}
            subscription={{
              status: trialInfo.status,
              trialDaysLeft: trialInfo.daysLeft,
            }}
            onUpgradeClick={() => setPricingOpen(true)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10 flex-shrink-0">
              <Sidebar
                user={user || undefined}
                partner={partner || undefined}
                subscription={{
                  status: trialInfo.status,
                  trialDaysLeft: trialInfo.daysLeft,
                }}
                onUpgradeClick={() => {
                  setSidebarOpen(false);
                  setPricingOpen(true);
                }}
              />
            </div>
            <button
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white text-gray-700"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-[#E7E5E4]">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-base font-semibold text-[#1C1917]">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500" />
              </button>
              <Button
                size="sm"
                className="hidden sm:flex"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add
              </Button>
              <button
                className="sm:hidden p-2 rounded-lg bg-primary-500 text-white"
                aria-label="Add new item"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Pricing modal */}
      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        trialDaysLeft={trialInfo.daysLeft}
        userId={user?.id}
      />
    </div>
  );
}
