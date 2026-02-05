import { IsDate, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @MinLength(4)
  name: string;

  @IsEmail()
  email: string;

  @IsDate()
  dateOfBirth: string;

  @IsString()
  @MinLength(8)
  password: string;
}
