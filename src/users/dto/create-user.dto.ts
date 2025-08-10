import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['SUPERUSER', 'ADMIN', 'USER'], { message: 'Valid role required' })
  role: 'SUPERUSER' | 'ADMIN' | 'USER';
}
