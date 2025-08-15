import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import supabase from './config/db.js';
import { createClient } from '@supabase/supabase-js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const supabase = createClient(
    process.env.DATABASE_URL || '',
    process.env.DATABASE_KEY || '',
  );

  try {
    app.listen(process.env.PORT || '', () =>
      console.log(
        new Date().toLocaleTimeString() +
          `: Server is running on port ${process.env.PORT}...`,
      ),
    );
    console.log('Connected to Database successfully.');
  } catch (error) {
    console.error('Error while connecting database :', error);
  }
}
bootstrap();
