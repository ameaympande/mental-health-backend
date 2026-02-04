export class MoodResponseDto {
  id: string;
  entryDate: string;
  moodScore: number;
  moodLabel?: string | null;
  tags: string[];
  note?: string | null;
  createdAt: string;
  updatedAt: string;

  static fromEntity(entity: any): MoodResponseDto {
    return {
      id: entity.id,
      entryDate: entity.entryDate.toISOString(),
      moodScore: entity.moodScore,
      moodLabel: entity.moodLabel,
      tags: entity.tags ?? [],
      note: entity.note,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

