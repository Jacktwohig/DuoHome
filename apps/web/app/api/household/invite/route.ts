import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Return current invite link for user's household
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id, households(invite_token, name)")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) {
    return NextResponse.json({ error: "No household found" }, { status: 404 });
  }

  const household = profile.households as { invite_token: string; name: string } | null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json({
    invite_link: `${appUrl}/invite/${household?.invite_token}`,
    household_name: household?.name,
    token: household?.invite_token,
  });
}

// POST: Accept an invite token — join user to that household
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Missing invite token" }, { status: 400 });
  }

  // Find household with this token
  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, name")
    .eq("invite_token", token)
    .single();

  if (householdError || !household) {
    return NextResponse.json(
      { error: "Invalid or expired invite token" },
      { status: 404 }
    );
  }

  // Check user isn't already in a household
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (currentProfile?.household_id === household.id) {
    return NextResponse.json(
      { error: "You're already in this household" },
      { status: 400 }
    );
  }

  // Update user's household
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ household_id: household.id })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to join household" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    household_id: household.id,
    household_name: household.name,
  });
}
