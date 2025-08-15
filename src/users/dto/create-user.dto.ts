import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(['SUPERUSER', 'ADMIN', 'USER'], { message: 'Valid role required' })
  @Transform(({ value }) => value || 'USER')
  role: 'SUPERUSER' | 'ADMIN' | 'USER';
}
