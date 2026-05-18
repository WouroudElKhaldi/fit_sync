import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Tell Node to look two folders up from apps/backend
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
