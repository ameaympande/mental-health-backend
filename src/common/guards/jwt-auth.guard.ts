import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Wraps the 'jwt' strategy so it can be used as a guard.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

