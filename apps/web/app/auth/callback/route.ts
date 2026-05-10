import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, household_id")
        .eq("id", data.user.id)
        .single();

      if (!profile || !profile.household_id) {
        const displayName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "User";

        const { data: household } = await supabase
          .from("households")
          .insert({ name: `${displayName}'s Home` })
          .select()
          .single();

        if (household) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            household_id: household.id,
            display_name: displayName,
            is_primary_member: true,
          });
          return NextResponse.redirect(`${origin}/onboarding/invite`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
