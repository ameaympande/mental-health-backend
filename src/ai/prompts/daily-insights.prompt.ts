export interface DailyMoodEntryForPrompt {
  time: string;
  score: number;
  label?: string | null;
  note?: string | null;
}

export interface DailyInsightContext {
  entryDate: string;
  moods: DailyMoodEntryForPrompt[];
}

export function buildDailyInsightsPrompt(ctx: DailyInsightContext): string {
  const lines = ctx.moods
    .map(
      (m) =>
        `${m.time}: score=${m.score}, label=${m.label ?? '-'}, note=${m.note ?? ''}`,
    )
    .join('\n');

  return `
You are a supportive mood-tracking companion, not a clinician.
Rules:
- No diagnosis, no medical or therapy advice.
- Do not mention disorders or treatments.
- Describe trends in simple, everyday language.
- Use "you may have felt", "it might be helpful to notice", etc.

Task:
- Summarize the overall tone of this day.
- Highlight at most 3 gentle insights about triggers or helpful moments.
- Suggest 1–2 simple reflection questions (not instructions).
- Stay under 180 words.

Date: ${ctx.entryDate}
Mood entries:
${lines}
  `.trim();
}

