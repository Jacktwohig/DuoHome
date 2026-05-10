"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Home,
  CreditCard,
  LogOut,
  Copy,
  Check,
  Link2,
  Trash2,
  Bell,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  household_id: string | null;
  trial_ends_at: string | null;
};

type Household = {
  id: string;
  name: string;
  invite_token: string;
};

type HouseholdMember = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_primary_member: boolean;
};

type Subscription = {
  status: string;
  plan: string | null;
  current_period_end: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Edit states
  const [displayName, setDisplayName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingHousehold, setSavingHousehold] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [householdSaved, setHouseholdSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, household_id, trial_ends_at")
          .eq("id", user.id)
          .single();

        if (!profileData) return;

        setProfile({ ...profileData, email: user.email || null });
        setDisplayName(profileData.display_name || "");

        if (profileData.household_id) {
          const [{ data: householdData }, { data: membersData }, { data: subData }] = await Promise.all([
            supabase.from("households").select("id, name, invite_token").eq("id", profileData.household_id).single(),
            supabase.from("profiles").select("id, display_name, avatar_url, is_primary_member").eq("household_id", profileData.household_id),
            supabase.from("subscriptions").select("status, plan, current_period_end").eq("household_id", profileData.household_id).single(),
          ]);

          if (householdData) {
            setHousehold(householdData);
            setHouseholdName(householdData.name);
          }
          setMembers(membersData || []);
          if (subData) setSubscription(subData);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveProfile() {
    if (!profile || !displayName.trim()) return;
    setSavingProfile(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ display_name: displayName }).eq("id", profile.id);
    setProfile((p) => p ? { ...p, display_name: displayName } : p);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function saveHousehold() {
    if (!household || !householdName.trim()) return;
    setSavingHousehold(true);
    const supabase = createClient();
    await supabase.from("households").update({ name: householdName }).eq("id", household.id);
    setHousehold((h) => h ? { ...h, name: householdName } : h);
    setSavingHousehold(false);
    setHouseholdSaved(true);
    setTimeout(() => setHouseholdSaved(false), 2000);
  }

  async function copyInviteLink() {
    if (!household) return;
    const url = `${window.location.origin}/invite/${household.invite_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }

  async function openBillingPortal() {
    // TODO: call billing portal API
    window.location.href = "/api/stripe/portal";
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const inviteUrl = household ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${household.invite_token}` : "";

  const subStatusBadge = () => {
    if (!subscription) return <Badge variant="secondary">Free Trial</Badge>;
    if (subscription.status === "active") return <Badge variant="success">Active</Badge>;
    if (subscription.status === "trialing") return <Badge variant="default">Trial</Badge>;
    if (subscription.status === "canceled") return <Badge variant="destructive">Canceled</Badge>;
    if (subscription.status === "past_due") return <Badge variant="destructive">Past Due</Badge>;
    return <Badge variant="secondary">{subscription.status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <h2 className="text-base font-semibold text-[#1C1917]">Your Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <Avatar name={profile?.display_name || profile?.email || "?"} size="lg" color="#E8526A" />
            <div>
              <p className="text-sm font-medium text-[#1C1917]">{profile?.display_name || "No name set"}</p>
              <p className="text-xs text-[#78716C]">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={profile?.email || ""}
              disabled
              helperText="Email cannot be changed here"
            />
            <Button onClick={saveProfile} loading={savingProfile}>
              {profileSaved ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Saved!</span>
              ) : "Save Profile"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Household */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Home className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-[#1C1917]">Household</h2>
          </div>

          {/* Members */}
          <div className="mb-5">
            <p className="text-xs font-medium text-[#78716C] uppercase tracking-wider mb-3">Members</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Avatar name={member.display_name || "?"} size="sm" color={member.id === profile?.id ? "#E8526A" : "#6366F1"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917]">{member.display_name || "Unnamed"}</p>
                    {member.id === profile?.id && <p className="text-xs text-[#78716C]">You</p>}
                  </div>
                  {member.is_primary_member && <Badge variant="secondary" className="text-xs">Owner</Badge>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Household name"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="Our Home"
            />
            <Button onClick={saveHousehold} loading={savingHousehold} variant="outline">
              {householdSaved ? (
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Saved!</span>
              ) : "Save Household Name"}
            </Button>
          </div>

          {/* Invite link */}
          {members.length < 2 && household && (
            <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-indigo-800">Invite your partner</p>
              </div>
              <p className="text-xs text-indigo-600 mb-3">Share this link with your partner to join your household.</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 h-9 px-3 rounded-lg border border-indigo-200 bg-white text-xs text-[#1C1917] focus:outline-none"
                />
                <Button size="sm" onClick={copyInviteLink} leftIcon={copiedInvite ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
                  {copiedInvite ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Billing */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-[#1C1917]">Billing</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-[#1C1917]">
                  {subscription?.plan === "yearly" ? "Yearly Plan" : subscription?.plan === "monthly" ? "Monthly Plan" : "Free Trial"}
                </p>
                {subStatusBadge()}
              </div>
              {subscription?.current_period_end && (
                <p className="text-xs text-[#78716C]">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              {!subscription && profile?.trial_ends_at && (
                <p className="text-xs text-[#78716C]">
                  Trial ends {new Date(profile.trial_ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#1C1917]">
                {subscription?.plan === "yearly" ? "$50/yr" : subscription?.plan === "monthly" ? "$5/mo" : "Free"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {(!subscription || subscription.status === "trialing") && (
              <Button className="flex-1" onClick={() => {}}>Upgrade to Pro</Button>
            )}
            {subscription && subscription.status === "active" && (
              <Button variant="outline" className="flex-1" onClick={openBillingPortal}>Manage Billing</Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Notifications (placeholder) */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-[#1C1917]">Notifications</h2>
          </div>
          <p className="text-sm text-[#78716C]">Notification preferences coming soon.</p>
        </Card>
      </motion.div>

      {/* Account actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-[#1C1917]">Account</h2>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-[#78716C]"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
