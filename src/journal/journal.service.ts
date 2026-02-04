import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JournalEntry, JournalEntryDocument } from '../schemas/journal-entry.schema';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JournalResponseDto } from './dto/journal-response.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectModel(JournalEntry.name)
    private readonly journalModel: Model<JournalEntryDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateJournalDto,
  ): Promise<JournalResponseDto> {
    const created = await this.journalModel.create({
      userId: new Types.ObjectId(userId),
      moodEntryId: dto.moodEntryId
        ? new Types.ObjectId(dto.moodEntryId)
        : undefined,
      title: dto.title,
      content: dto.content,
    });

    return JournalResponseDto.fromEntity(created);
  }

  async findAll(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: JournalResponseDto[]; meta: any }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.journalModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ writtenAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.journalModel
        .countDocuments({ userId: new Types.ObjectId(userId) })
        .exec(),
    ]);

    return {
      data: items.map(JournalResponseDto.fromEntity),
      meta: {
        page,
        limit,
        total,
        hasNextPage: skip + items.length < total,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<JournalResponseDto> {
    const entry = await this.journalModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return JournalResponseDto.fromEntity(entry);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateJournalDto,
  ): Promise<JournalResponseDto> {
    const existing = await this.journalModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!existing) {
      throw new NotFoundException('Journal entry not found');
    }

    const updated = await this.journalModel
      .findByIdAndUpdate(
        id,
        {
          moodEntryId:
            dto.moodEntryId !== undefined
              ? new Types.ObjectId(dto.moodEntryId)
              : existing.moodEntryId,
          title: dto.title ?? existing.title,
          content: dto.content ?? existing.content,
        },
        { new: true },
      )
      .exec();

    return JournalResponseDto.fromEntity(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.journalModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!existing) {
      throw new NotFoundException('Journal entry not found');
    }

    await this.journalModel.findByIdAndDelete(id).exec();
  }
}
