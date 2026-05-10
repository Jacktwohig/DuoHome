"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  trialDaysLeft?: number;
  householdId?: string;
  userId?: string;
}

const FEATURES = [
  "All 8 home management modules",
  "2 partner accounts linked",
  "AI-powered meal suggestions",
  "Unlimited notes & documents",
  "Budget tracking & analytics",
  "Habit streaks & gamification",
  "Shared goal planning",
  "Activities & travel planner",
];

export function PricingModal({
  open,
  onClose,
  trialDaysLeft,
  householdId,
  userId,
}: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          householdId,
          userId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title="">
      <ModalBody className="px-0 py-0">
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Sparkles className="h-6 w-6 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] mb-2">
            {trialDaysLeft !== undefined && trialDaysLeft > 0
              ? `${trialDaysLeft} days left in your trial`
              : "Upgrade to DuoHome"}
          </h2>
          <p className="text-[#78716C]">
            Keep running your home together — upgrade to continue after your
            trial.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex items-center justify-center gap-3 mb-6 px-8">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all text-left",
              selectedPlan === "monthly"
                ? "border-primary-500 bg-primary-50"
                : "border-[#E7E5E4] hover:border-gray-300"
            )}
          >
            <div className="font-semibold text-[#1C1917]">Monthly</div>
            <div className="text-2xl font-bold text-[#1C1917] mt-1">
              $5
              <span className="text-sm font-normal text-[#78716C]">/mo</span>
            </div>
            <div className="text-xs text-[#78716C] mt-1">Billed monthly</div>
          </button>

          <button
            onClick={() => setSelectedPlan("yearly")}
            className={cn(
              "flex-1 p-4 rounded-xl border-2 transition-all text-left relative",
              selectedPlan === "yearly"
                ? "border-primary-500 bg-primary-50"
                : "border-[#E7E5E4] hover:border-gray-300"
            )}
          >
            <div className="absolute -top-3 right-3">
              <Badge variant="success" className="text-xs">
                Save $10!
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1C1917]">Yearly</span>
              <Badge variant="indigo" className="text-xs">
                Best Value
              </Badge>
            </div>
            <div className="text-2xl font-bold text-[#1C1917] mt-1">
              $50
              <span className="text-sm font-normal text-[#78716C]">/yr</span>
            </div>
            <div className="text-xs text-[#78716C] mt-1">
              Only $4.17/mo — 2 months free
            </div>
          </button>
        </div>

        {/* Features list */}
        <div className="px-8 pb-6">
          <p className="text-xs font-medium text-[#78716C] uppercase tracking-wider mb-3">
            Everything included
          </p>
          <div className="grid grid-cols-1 gap-2">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-sm text-[#1C1917]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubscribe}
          loading={loading}
          leftIcon={<Zap className="h-4 w-4" />}
        >
          {trialDaysLeft !== undefined && trialDaysLeft > 0
            ? "Start My Subscription"
            : "Upgrade Now"}{" "}
          — {selectedPlan === "yearly" ? "$50/yr" : "$5/mo"}
        </Button>
        <button
          onClick={onClose}
          className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors"
        >
          Continue with free trial
        </button>
      </ModalFooter>
    </Modal>
  );
}
