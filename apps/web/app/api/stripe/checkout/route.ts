import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, householdId } = body;

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's household if not provided
    let targetHouseholdId = householdId;
    if (!targetHouseholdId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();
      targetHouseholdId = profile?.household_id;
    }

    if (!targetHouseholdId) {
      return NextResponse.json({ error: "No household found" }, { status: 400 });
    }

    const session = await createCheckoutSession(
      targetHouseholdId,
      plan as "monthly" | "yearly",
      user.id,
      user.email
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
