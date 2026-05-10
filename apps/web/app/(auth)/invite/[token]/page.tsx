"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Home, UserPlus, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [primaryMemberName, setPrimaryMemberName] = useState<string | null>(null);

  useEffect(() => {
    async function checkInvite() {
      const supabase = createClient();

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // Fetch household info from token
      const { data: household, error: householdError } = await supabase
        .from("households")
        .select("id, name")
        .eq("invite_token", token)
        .single();

      if (householdError || !household) {
        setError("This invite link is invalid or has expired.");
        setLoading(false);
        return;
      }

      setHouseholdName(household.name);

      // Get primary member name
      const { data: primaryProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("household_id", household.id)
        .eq("is_primary_member", true)
        .single();

      if (primaryProfile?.display_name) {
        setPrimaryMemberName(primaryProfile.display_name);
      }

      setLoading(false);
    }

    checkInvite();
  }, [token]);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to signup with token preserved
      router.push(`/signup?inviteToken=${token}`);
      return;
    }

    // Get household from token
    const { data: household } = await supabase
      .from("households")
      .select("id")
      .eq("invite_token", token)
      .single();

    if (!household) {
      setError("Invalid invite token.");
      setJoining(false);
      return;
    }

    // Update user's profile to join this household
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ household_id: household.id })
      .eq("id", user.id);

    if (updateError) {
      setError("Failed to join household. Please try again.");
      setJoining(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#78716C]">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-red-100 mb-5 mx-auto">
          <Home className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1C1917] mb-2">
          Invalid invite
        </h2>
        <p className="text-[#78716C] mb-6">{error}</p>
        <Link href="/signup">
          <Button>Create your own account</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 mb-5 mx-auto">
        <Home className="h-8 w-8 text-primary-500" />
      </div>

      <h2 className="text-2xl font-bold text-[#1C1917] mb-2">
        You&apos;re invited!
      </h2>
      <p className="text-[#78716C] mb-2">
        {primaryMemberName ? (
          <>
            <strong className="text-[#1C1917]">{primaryMemberName}</strong> has
            invited you to join their household
          </>
        ) : (
          "You've been invited to join a household"
        )}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-100 text-primary-700 font-medium text-sm mb-8">
        <Home className="h-4 w-4" />
        {householdName}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoggedIn ? (
          <Button
            className="w-full"
            size="lg"
            onClick={handleJoin}
            loading={joining}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Join {householdName}
          </Button>
        ) : (
          <>
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push(`/signup?inviteToken=${token}`)}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Create account &amp; join
            </Button>
            <p className="text-sm text-[#78716C]">
              Already have an account?{" "}
              <button
                onClick={() => router.push(`/login?inviteToken=${token}`)}
                className="text-primary-500 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
