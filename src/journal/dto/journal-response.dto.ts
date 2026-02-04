export class JournalResponseDto {
  id: string;
  moodEntryId?: string | null;
  title?: string | null;
  content: string;
  writtenAt: string;
  createdAt: string;
  updatedAt: string;

  static fromEntity(entity: any): JournalResponseDto {
    return {
      id: entity.id,
      moodEntryId: entity.moodEntryId ?? null,
      title: entity.title ?? null,
      content: entity.content,
      writtenAt: entity.writtenAt.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

