import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { MoodsService } from './moods.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateMoodDto,
  ) {
    return this.moodsService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.moodsService.findAll(user.id, pagination);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.moodsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateMoodDto,
  ) {
    return this.moodsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.moodsService.remove(user.id, id);
  }
}
