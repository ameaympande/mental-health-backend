import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { User, UserDocument } from '../schemas/user.schema';
import { MoodEntry, MoodEntryDocument } from '../schemas/mood-entry.schema';
import { AiInsight, AiInsightDocument } from '../schemas/ai-insight.schema';

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class WeeklySummaryJob {
  private readonly logger = new Logger(WeeklySummaryJob.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MoodEntry.name)
    private readonly moodModel: Model<MoodEntryDocument>,
    @InjectModel(AiInsight.name)
    private readonly insightModel: Model<AiInsightDocument>,
    private readonly ai: AiService,
  ) {}

  // Run every Monday at 03:00 UTC
  @Cron('0 3 * * 1')
  async runWeeklySummaries() {
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6);

    const weekRange = `${formatDateKey(start)} to ${formatDateKey(end)}`;

    this.logger.log(`Starting weekly summaries for range ${weekRange}`);

    const users = await this.userModel.find({}, { _id: 1 }).exec();

    for (const user of users) {
      await this.processUserWeek(user.id, start, end, weekRange);
    }
  }

  private async processUserWeek(
    userId: string,
    start: Date,
    end: Date,
    weekRange: string,
  ) {
    const periodKey = `${userId}:${weekRange}`;

    const existing = await this.insightModel
      .findOne({ userId: new Types.ObjectId(userId), type: 'WEEKLY_SUMMARY', periodKey })
      .exec();
    if (existing) {
      this.logger.debug(
        `Weekly summary already exists for user=${userId}, period=${periodKey}`,
      );
      return;
    }

    const moods = await this.moodModel
      .find({
        userId: new Types.ObjectId(userId),
        entryDate: { $gte: start, $lte: end },
      })
      .sort({ entryDate: 1 })
      .exec();

    if (!moods.length) {
      this.logger.debug(
        `No mood data for weekly summary user=${userId}, period=${periodKey}`,
      );
      return;
    }

    const byDate = new Map<string, { scores: number[]; notes: string[] }>();
    for (const mood of moods) {
      const key = formatDateKey(mood.entryDate);
      if (!byDate.has(key)) {
        byDate.set(key, { scores: [], notes: [] });
      }
      const entry = byDate.get(key)!;
      entry.scores.push(mood.moodScore);
      if (mood.note) {
        entry.notes.push(mood.note);
      }
    }

    const days = Array.from(byDate.entries()).map(([date, value]) => {
      const averageScore =
        value.scores.reduce((sum, s) => sum + s, 0) / value.scores.length;
      const notesSummary =
        value.notes.length > 0
          ? value.notes.slice(0, 3).join(' | ')
          : undefined;
      return {
        date,
        averageScore: Number(averageScore.toFixed(2)),
        notesSummary,
      };
    });

    const summaryText = await this.ai.generateWeeklySummary({
      weekRange,
      days,
    });

    await this.insightModel.create({
      userId: new Types.ObjectId(userId),
      type: 'WEEKLY_SUMMARY',
      periodKey,
      content: summaryText,
    });

    this.logger.log(
      `Stored weekly summary for user=${userId}, period=${periodKey}`,
    );
  }
}
