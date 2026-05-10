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
    console.error("Meal suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal suggestions" },
      { status: 500 }
    );
  }
}
