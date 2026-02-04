import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { MoodEntry } from './mood-entry.schema';

@Schema({ timestamps: true })
export class JournalEntry {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: MoodEntry.name })
  moodEntryId?: Types.ObjectId;

  @Prop()
  title?: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  writtenAt: Date;
}

export type JournalEntryDocument = JournalEntry & Document;

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);

