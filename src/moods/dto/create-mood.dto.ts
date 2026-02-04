import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMoodDto {
  @IsDateString()
  entryDate: string;

  @IsInt()
  @Min(1)
  @Max(10)
  moodScore: number;

  @IsOptional()
  @IsString()
  moodLabel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

