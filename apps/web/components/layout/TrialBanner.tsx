"use client";

import React, { useState } from "react";
import { Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/billing/PricingModal";
import { pluralize } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  householdId?: string;
  userId?: string;
}

export function TrialBanner({ daysLeft, householdId, userId }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  if (dismissed) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <>
      <div
        className={`flex items-center justify-between px-4 py-2.5 text-sm ${
          isUrgent
            ? "bg-red-500 text-white"
            : "bg-primary-500 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 flex-shrink-0" />
          <span>
            {daysLeft > 0
              ? `${pluralize(daysLeft, "day")} left in your free trial.`
              : "Your free trial has ended."}{" "}
            <span className="opacity-90">
              Upgrade to keep all your data and features.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 bg-white/20 border-white/40 text-white hover:bg-white/30 text-xs"
            onClick={() => setPricingOpen(true)}
          >
            Upgrade Now
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 rounded hover:bg-white/20 transition-colors"
            aria-label="Dismiss trial banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        trialDaysLeft={daysLeft}
        householdId={householdId}
        userId={userId}
      />
    </>
  );
}
