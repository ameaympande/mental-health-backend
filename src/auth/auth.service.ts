import { BadRequestException, Body, Injectable, Post } from '@nestjs/common';
import { AuthUserDto } from './dto/auth-user-dto';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { hashPasswordWithKey, verifyPasswordWithKey } from 'src/helper/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async login(@Body() loginUserDto: AuthUserDto) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginUserDto.email)
        .single();

      if (!existingUser) {
        throw new BadRequestException(
          'A user with this email already does not exists.',
        );
      }

      const passwordMatch = verifyPasswordWithKey(
        loginUserDto.password,
        existingUser.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Invalid password.');
      }

      const payload = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      };
      const token = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
        access_token: token,
      };
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

  @Post('/register')
  async signUp(createUserDto: CreateUserDto) {
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

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new BadRequestException(insertError.message);
      }

      return { ...newUser, password: undefined, success: true };
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
}
