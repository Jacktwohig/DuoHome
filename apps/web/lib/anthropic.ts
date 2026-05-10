import Anthropic from "@anthropic-ai/sdk";
import type { MealSuggestion } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function suggestMeals(
  preferences: string[],
  restrictions: string[],
  existingMeals: string[]
): Promise<MealSuggestion[]> {
  const prompt = `You are a helpful meal planning assistant for a couple. Generate 6 diverse meal suggestions based on their preferences and dietary restrictions.

Preferences: ${preferences.length > 0 ? preferences.join(", ") : "None specified"}
Dietary restrictions: ${restrictions.length > 0 ? restrictions.join(", ") : "None"}
Meals they already have this week: ${existingMeals.length > 0 ? existingMeals.join(", ") : "None yet"}

Please suggest 6 varied meals that are different from what they already have. Include a mix of breakfast, lunch, and dinner options.

Respond ONLY with a valid JSON array in this exact format (no markdown, no explanation):
[
  {
    "name": "Meal Name",
    "description": "Brief appetizing description in 1-2 sentences",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "prep_time_minutes": 30,
    "tags": ["tag1", "tag2"],
    "meal_type": "dinner",
    "servings": 2
  }
]

meal_type must be one of: breakfast, lunch, dinner, snack
Make the meals realistic, delicious, and varied. Tailor to the preferences and avoid all restrictions.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
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

  const text = content.text.trim();

  // Parse the JSON response
  const suggestions: MealSuggestion[] = JSON.parse(text);

  if (!Array.isArray(suggestions)) {
    throw new Error("Invalid response format from Claude");
  }

  return suggestions;
}
