import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestMeals } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      preferences = [],
      restrictions = [],
      existingMeals = [],
      mealType = "dinner",
    } = body;

    const suggestions = await suggestMeals(preferences, restrictions, existingMeals, mealType);

    return NextResponse.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Meal suggestion error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
