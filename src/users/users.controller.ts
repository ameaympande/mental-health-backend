import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id') //   GET /users/:id
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get() //   GET /users or /users?role=value
  findAll(@Query('role') role?: 'SUPERUSER' | 'ADMIN' | 'USER') {
    return this.userService.findAll(role);
  }

  @Post() // POST /users
  create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto,
  ) {
    return this.userService.create(createUserDto);
  }

  @Patch(':id') //   PATCH /users/:id
  update(
    @Param('id') id: string,
    @Body(ValidationPipe)
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id') //  DELETE /users/:id
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
