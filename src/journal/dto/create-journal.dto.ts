import {
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateJournalDto {
  @IsOptional()
  @IsUUID()
  moodEntryId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(1)
  content: string;
}

