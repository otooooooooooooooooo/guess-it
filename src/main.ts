import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from './config/config';
import { CustomExceptionFilter } from './exceptions/exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: config.CORS });
  app.useGlobalFilters(new CustomExceptionFilter(new LoggingService()));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('guess-it')
    .setDescription('API for portfolio project guess-it')
    .setVersion('1.0.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, swaggerDocument);
  await app.listen(config.PORT || 300);
}
bootstrap();
