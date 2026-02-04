import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiInsight, AiInsightDocument } from '../schemas/ai-insight.schema';

@Injectable()
export class MaintenanceJob {
  private readonly logger = new Logger(MaintenanceJob.name);

  constructor(
    @InjectModel(AiInsight.name)
    private readonly insightModel: Model<AiInsightDocument>,
  ) {}

  // Example maintenance job: run daily at 04:00 UTC
  @Cron('0 4 * * *')
  async cleanupOldInsights() {
    this.logger.log('Starting cleanupOldInsights job');

    const cutoff = new Date();
    cutoff.setUTCMonth(cutoff.getUTCMonth() - 6);

    const result = await this.insightModel.deleteMany({
      createdAt: { $lt: cutoff },
    });

    this.logger.log(
      `cleanupOldInsights completed; deleted=${result.deletedCount ?? 0} old AI insights`,
    );
  }
}
