import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoodsService } from './moods.service';
import { MoodsController } from './moods.controller';
import { MoodEntry, MoodEntrySchema } from '../schemas/mood-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MoodEntry.name, schema: MoodEntrySchema }]),
  ],
  controllers: [MoodsController],
  providers: [MoodsService],
})
export class MoodsModule {}
