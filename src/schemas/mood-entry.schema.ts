import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class MoodEntry {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  entryDate: Date;

  @Prop({ required: true })
  moodScore: number;

  @Prop()
  moodLabel?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  note?: string;
}

export type MoodEntryDocument = MoodEntry & Document;

export const MoodEntrySchema = SchemaFactory.createForClass(MoodEntry);

