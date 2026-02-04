// Update DTO declared explicitly to avoid relying on mapped types.
export class UpdateMoodDto {
  entryDate?: string;
  moodScore?: number;
  moodLabel?: string;
  tags?: string[];
  note?: string;
}
