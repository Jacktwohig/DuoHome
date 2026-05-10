"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ArrowRight, Users, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const router = useRouter();
  const [inviteLink, setInviteLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [householdName, setHouseholdName] = useState("Your Home");

  useEffect(() => {
    async function loadInviteLink() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id, households(invite_token, name)")
        .eq("id", user.id)
        .single();

      if (profile?.households) {
        const h = profile.households as { invite_token: string; name: string };
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        setInviteLink(`${appUrl}/invite/${h.invite_token}`);
        setHouseholdName(h.name);
      }
    }

    loadInviteLink();
  }, []);

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 mb-5">
          <Users className="h-8 w-8 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1C1917] mb-2">
          Invite your partner
        </h2>
        <p className="text-[#78716C]">
          Share this link with your partner to connect your accounts under{" "}
          <strong className="text-[#1C1917]">{householdName}</strong>.
        </p>
      </div>

      {/* Invite link box */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[#1C1917] mb-2 block">
          Your personal invite link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-[#E7E5E4] text-sm text-[#78716C] font-mono truncate">
            {inviteLink || "Generating your invite link..."}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyInviteLink}
            disabled={!inviteLink}
            aria-label="Copy invite link"
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Copied to clipboard!
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex gap-3">
          <Heart className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900 mb-1">
              How it works
            </p>
            <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
              <li>Copy the invite link above</li>
              <li>Share it with your partner via text or email</li>
              <li>They sign up and are automatically joined to your household</li>
              <li>You both share the same data and can collaborate in real-time</li>
            </ol>
          </div>
        </div>
      </div>

      {/* QR-style display */}
      <div className="mb-8 text-center p-6 rounded-xl border-2 border-dashed border-[#E7E5E4]">
        <p className="text-xs text-[#78716C] mb-3 uppercase tracking-wider font-medium">
          Or share this link directly
        </p>
        <p className="text-sm font-mono text-[#1C1917] break-all">
          {inviteLink}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={copyInviteLink}
          disabled={!inviteLink}
          leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copied ? "Link copied!" : "Copy invite link"}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          size="lg"
          onClick={() => router.push("/dashboard")}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Skip for now, go to dashboard
        </Button>
      </div>
    </div>
  );
}
