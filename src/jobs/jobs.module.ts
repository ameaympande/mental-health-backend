import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { WeeklySummaryJob } from './weekly-summary.job';
import { DailyInsightsJob } from './daily-insights.job';
import { MaintenanceJob } from './maintenance.job';
import { User, UserSchema } from '../schemas/user.schema';
import { MoodEntry, MoodEntrySchema } from '../schemas/mood-entry.schema';
import { AiInsight, AiInsightSchema } from '../schemas/ai-insight.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: MoodEntry.name, schema: MoodEntrySchema },
      { name: AiInsight.name, schema: AiInsightSchema },
    ]),
    AiModule,
  ],
  providers: [WeeklySummaryJob, DailyInsightsJob, MaintenanceJob],
})
export class JobsModule {}
