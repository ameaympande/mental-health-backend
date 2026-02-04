// Update DTO declared explicitly to avoid relying on mapped types.
export class UpdateJournalDto {
  moodEntryId?: string;
  title?: string;
  content?: string;
}
