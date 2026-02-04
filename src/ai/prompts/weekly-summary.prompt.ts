export interface WeeklySummaryDay {
  date: string;
  averageScore: number;
  notesSummary?: string;
}

export interface WeeklySummaryContext {
  weekRange: string;
  days: WeeklySummaryDay[];
}

export function buildWeeklySummaryPrompt(ctx: WeeklySummaryContext): string {
  const lines = ctx.days
    .map(
      (d) =>
        `${d.date}: avg=${d.averageScore}, notes=${d.notesSummary ?? ''}`,
    )
    .join('\n');

  return `
You are a weekly reflection assistant for a mood journal.
Rules:
- No diagnosis, no treatment recommendations, no therapy claims.
- Focus on patterns, not causes or labels.
- Encourage curiosity and self-compassion.

Task:
- Give a short summary of the week (2–3 sentences).
- Mention at most 3 observable patterns (e.g., energy on certain days, effects of rest).
- Offer 2–3 reflection questions for the coming week.
- Avoid imperatives like "you should"; use "you could consider" or "it may help".

Week: ${ctx.weekRange}
Daily data:
${lines}
  `.trim();
}

