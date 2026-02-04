import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class AiInsight {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop()
  periodKey?: string;

  @Prop({ required: true })
  content: string;
}

export type AiInsightDocument = AiInsight & Document;

export const AiInsightSchema = SchemaFactory.createForClass(AiInsight);

AiInsightSchema.index({ userId: 1, type: 1, periodKey: 1 }, { unique: true });

