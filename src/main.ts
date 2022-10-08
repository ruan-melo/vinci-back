import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory(validationErrors: ValidationError[]) {
        return new BadRequestException(validationErrors);
      },
    }),
  );

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
