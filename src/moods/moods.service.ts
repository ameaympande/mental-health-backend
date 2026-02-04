import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MoodEntry, MoodEntryDocument } from '../schemas/mood-entry.schema';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { MoodResponseDto } from './dto/mood-response.dto';

@Injectable()
export class MoodsService {
  constructor(
    @InjectModel(MoodEntry.name)
    private readonly moodModel: Model<MoodEntryDocument>,
  ) {}

  async create(userId: string, dto: CreateMoodDto): Promise<MoodResponseDto> {
    const created = await this.moodModel.create({
      userId: new Types.ObjectId(userId),
      entryDate: new Date(dto.entryDate),
      moodScore: dto.moodScore,
      moodLabel: dto.moodLabel,
      tags: dto.tags ?? [],
      note: dto.note,
    });

    return MoodResponseDto.fromEntity(created);
  }

  async findAll(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: MoodResponseDto[]; meta: any }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.moodModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ entryDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.moodModel
        .countDocuments({ userId: new Types.ObjectId(userId) })
        .exec(),
    ]);

    return {
      data: items.map(MoodResponseDto.fromEntity),
      meta: {
        page,
        limit,
        total,
        hasNextPage: skip + items.length < total,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<MoodResponseDto> {
    const mood = await this.moodModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();

    if (!mood) {
      throw new NotFoundException('Mood entry not found');
    }

    return MoodResponseDto.fromEntity(mood);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateMoodDto,
  ): Promise<MoodResponseDto> {
    const existing = await this.moodModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!existing) {
      throw new NotFoundException('Mood entry not found');
    }

    const updated = await this.moodModel
      .findByIdAndUpdate(
        id,
        {
          entryDate: dto.entryDate
            ? new Date(dto.entryDate)
            : existing.entryDate,
          moodScore:
            dto.moodScore !== undefined ? dto.moodScore : existing.moodScore,
          moodLabel:
            dto.moodLabel !== undefined ? dto.moodLabel : existing.moodLabel,
          tags: dto.tags ?? existing.tags,
          note: dto.note ?? existing.note,
        },
        { new: true },
      )
      .exec();

    return MoodResponseDto.fromEntity(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.moodModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!existing) {
      throw new NotFoundException('Mood entry not found');
    }

    await this.moodModel.findByIdAndDelete(id).exec();
  }
}
