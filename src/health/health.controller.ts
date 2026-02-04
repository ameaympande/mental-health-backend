import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  liveness() {
    // Basic liveness probe: app is up and responding.
    return { status: 'ok' };
  }

  @Get('ready')
  readiness() {
    // In a real app, check dependencies (DB, queues, etc).
    return { status: 'ok' };
  }
}

