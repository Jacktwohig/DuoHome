import Anthropic from "@anthropic-ai/sdk";
import type { MealSuggestion } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function suggestMeals(
  preferences: string[],
  restrictions: string[],
  existingMeals: string[],
  mealType: string = "dinner"
): Promise<MealSuggestion[]> {
  const typeLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const prompt = `You are a helpful meal planning assistant for a couple. Generate 6 diverse ${typeLabel} suggestions.

Preferences: ${preferences.length > 0 ? preferences.join(", ") : "None specified"}
Dietary restrictions: ${restrictions.length > 0 ? restrictions.join(", ") : "None"}
Meals they already have: ${existingMeals.length > 0 ? existingMeals.join(", ") : "None yet"}

Suggest 6 varied ${typeLabel.toLowerCase()} options that are different from what they already have.

Respond ONLY with a valid JSON array (no markdown, no explanation):
[
  {
    "name": "Meal Name",
    "description": "Brief appetizing description in 1-2 sentences",
    "ingredients": ["1 cup ingredient", "2 tbsp ingredient"],
    "instructions": ["Step 1: Do this first.", "Step 2: Then do this.", "Step 3: Serve and enjoy."],
    "prep_time_minutes": 20,
    "tags": ["tag1", "tag2"],
    "meal_type": "${mealType}",
    "servings": 2
  }
]

meal_type must be exactly: "${mealType}"
ingredients should include quantities (e.g. "2 cloves garlic")
instructions should be 4-8 clear steps from prep to serving
Make meals realistic, delicious, and varied. Tailor to preferences and avoid restrictions.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let text = content.text.trim();

  // Strip markdown code fences if Claude wraps the JSON
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
  }

  const suggestions: MealSuggestion[] = JSON.parse(text);

  if (!Array.isArray(suggestions)) {
    throw new Error("Invalid response format from Claude");
  }

  return suggestions;
}
