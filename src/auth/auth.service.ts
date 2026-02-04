import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
    });

    return this.buildAuthTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthTokens(user.id, user.email);
  }

  private async buildAuthTokens(userId: string, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    const secret = this.configService.get<string>('auth.jwtSecret');
    const expiresIn =
      this.configService.get<string>('auth.jwtExpiresIn') ?? '15m';

    const accessToken = await this.jwtService.signAsync(payload, {
      // Cast options because JwtSignOptions expects StringValue | number for expiresIn.
      secret,
      expiresIn,
    } as any);

    // Refresh tokens can be added here in the future.

    return {
      accessToken,
    };
  }
}
