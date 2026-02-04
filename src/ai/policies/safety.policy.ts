export class SafetyPolicy {
  static sanitizeFreeText(raw: string): string {
    if (!raw) {
      return raw;
    }

    const bannedPatterns = [
      /diagnos(e|is|ed)/gi,
      /disorder/gi,
      /medication/gi,
      /antidepressant/gi,
      /therapy session/gi,
    ];

    let text = raw;
    for (const pattern of bannedPatterns) {
      text = text.replace(pattern, '');
    }

    return text.trim();
  }

  static fallbackReflection(): string {
    return `
I’m having trouble generating a detailed reflection right now.
You might gently notice what felt heavy or supportive today,
and consider writing about one small moment that stood out to you.
    `.trim();
  }

  static fallbackSummary(): string {
    return `
I couldn’t generate a summary at the moment,
but you could reflect on what gave you energy this week
and what helped you feel a bit more grounded.
    `.trim();
  }
}

