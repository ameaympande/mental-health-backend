import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import bcrypt from 'bcrypt';
import { hashPasswordWithKey } from 'src/helper/auth';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(role?: 'SUPERUSER' | 'ADMIN' | 'USER') {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('users').select(`
    id,
    name,
    email,
    role,
    created_at,
    updated_at
  `);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (role && (!users || users.length === 0)) {
      throw new NotFoundException('User role not found.');
    }

    return users;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('users')
      .select(
        `
    id,
    name,
    email,
    role,
    created_at,
    updated_at
  `,
      )
      .eq('id', id)
      .single();

    const { data: user, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    console.log(user);

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', createUserDto.email)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error checking existing user:', findError);
        throw new BadRequestException(findError.message);
      }

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists.');
      }

      const hashedPassword = hashPasswordWithKey(createUserDto.password);

      const payload = {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'USER',
      };
      console.log('payload', payload);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new BadRequestException(insertError.message);
      }

      return { ...newUser, password: undefined };
    } catch (error) {
      console.error('Create user failed:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'An unexpected error occurred while creating the user.',
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateUserDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update user error:', error);
        throw new BadRequestException(error.message);
      }

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.error('Update failed:', error);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Unexpected error while updating user.');
    }
  }

  async delete(id: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Find user error before delete:', findError);
        throw new BadRequestException(findError.message);
      }

      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete user error:', deleteError);
        throw new BadRequestException(deleteError.message);
      }

      return { message: `User with id ${id} deleted successfully` };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Unexpected error while deleting user.');
    }
  }
}
