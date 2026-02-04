import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // MongoDB connection string, e.g. mongodb://localhost:27017/mental-health
  url: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mental-health',
}));
