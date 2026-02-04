import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? '6000', 10),
}));

