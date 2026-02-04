export interface SentimentContext {
  text: string;
}

export function buildSentimentPrompt(ctx: SentimentContext): string {
  return `
You analyze emotional tone in text.
Rules:
- Do not diagnose.
- Do not speculate about causes.
- Only describe emotion categories.

Return a single JSON object with this shape:
{
  "overall": "positive" | "neutral" | "mixed" | "negative",
  "emotions": {
    "joy": number between 0 and 1,
    "sadness": number between 0 and 1,
    "anxiety": number between 0 and 1,
    "anger": number between 0 and 1,
    "calm": number between 0 and 1
  }
}

Text:
${ctx.text}
  `.trim();
}

