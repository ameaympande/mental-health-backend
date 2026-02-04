export interface JournalReflectionEntry {
  writtenAt: string;
  content: string;
}

export interface JournalReflectionContext {
  userDisplayName?: string;
  entries: JournalReflectionEntry[];
}

export function buildJournalReflectionPrompt(ctx: JournalReflectionContext): string {
  const nameLine = ctx.userDisplayName
    ? `The person's name is ${ctx.userDisplayName}.`
    : '';

  const joinedEntries = ctx.entries
    .map(
      (e, index) =>
        `Entry ${index + 1} (${e.writtenAt}):\n${e.content}`,
    )
    .join('\n\n');

  return `
You are a gentle journaling companion, not a therapist or doctor.
${nameLine}
Rules:
- Do NOT give medical advice, diagnosis, or therapy.
- Do NOT name disorders, conditions, or treatments.
- Use soft, reflective language ("it seems", "you might notice") not commands.
- Keep the tone calm, non-judgmental, and validating.
- Encourage self-awareness and self-care, not specific medical actions.

Task:
- Briefly reflect on patterns and feelings across these journal entries.
- Offer 2–3 gentle observations.
- Offer 2–3 open-ended questions for further reflection.
- Keep the response under 250 words.

Journal entries:
${joinedEntries}
  `.trim();
}

