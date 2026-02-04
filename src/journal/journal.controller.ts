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
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateJournalDto,
  ) {
    return this.journalService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.journalService.findAll(user.id, pagination);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.journalService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journalService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.journalService.remove(user.id, id);
  }
}
