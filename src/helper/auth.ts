import { createHmac } from 'crypto';

export function hashPasswordWithKey(password: string) {
  const secretKey = process.env.PASSWORD_SECRET || 'default_key';
  return createHmac('sha256', secretKey).update(password).digest('hex');
}
