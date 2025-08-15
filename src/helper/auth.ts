import { createHmac } from 'crypto';

export function hashPasswordWithKey(password: string) {
  const secretKey = process.env.PASSWORD_SECRET || 'default_key';
  return createHmac('sha256', secretKey).update(password).digest('hex');
}

export function verifyPasswordWithKey(
  password: string,
  hashedPassword: string,
) {
  const secretKey = process.env.PASSWORD_SECRET || 'default_key';
  const hashToCompare = createHmac('sha256', secretKey)
    .update(password)
    .digest('hex');

  return hashToCompare === hashedPassword;
}
