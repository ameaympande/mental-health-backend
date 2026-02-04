import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { User, UserDocument } from '../schemas/user.schema';
import { MoodEntry, MoodEntryDocument } from '../schemas/mood-entry.schema';
import { AiInsight, AiInsightDocument } from '../schemas/ai-insight.schema';

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class DailyInsightsJob {
  private readonly logger = new Logger(DailyInsightsJob.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MoodEntry.name)
    private readonly moodModel: Model<MoodEntryDocument>,
    @InjectModel(AiInsight.name)
    private readonly insightModel: Model<AiInsightDocument>,
    private readonly ai: AiService,
  ) {}

  // Run every day at 02:00 UTC
  @Cron('0 2 * * *')
  async runDailyInsights() {
    const now = new Date();
    const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const targetKey = dateKey(target);

    this.logger.log(`Starting daily insights for date ${targetKey}`);

    const users = await this.userModel.find({}, { _id: 1 }).exec();

    for (const user of users) {
      await this.processUserDay(user.id, target, targetKey);
    }
  }

  private async processUserDay(userId: string, day: Date, dayKey: string) {
    const periodKey = `${userId}:${dayKey}`;

    const existing = await this.insightModel
      .findOne({
        userId: new Types.ObjectId(userId),
        type: 'DAILY_INSIGHT',
        periodKey,
      })
      .exec();
    if (existing) {
      this.logger.debug(
        `Daily insight already exists for user=${userId}, period=${periodKey}`,
      );
      return;
    }

    const start = new Date(day);
    const end = new Date(day);
    end.setUTCDate(end.getUTCDate() + 1);

    const moods = await this.moodModel
      .find({
        userId: new Types.ObjectId(userId),
        entryDate: { $gte: start, $lt: end },
      })
      .sort({ entryDate: 1 })
      .exec();

    if (!moods.length) {
      this.logger.debug(
        `No mood data for daily insight user=${userId}, period=${periodKey}`,
      );
      return;
    }

    const moodsForPrompt = moods.map((m) => ({
      time: m.entryDate.toISOString(),
      score: m.moodScore,
      label: m.moodLabel,
      note: m.note,
    }));

    const insightText = await this.ai.generateDailyInsights({
      entryDate: dayKey,
      moods: moodsForPrompt,
    });

    await this.insightModel.create({
      userId: new Types.ObjectId(userId),
      type: 'DAILY_INSIGHT',
      periodKey,
      content: insightText,
    });

    this.logger.log(
      `Stored daily insight for user=${userId}, period=${periodKey}`,
    );
  }
}
