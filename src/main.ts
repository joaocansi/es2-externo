import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import CustomValidationPipe from './common/pipes/error-validation.pipe';
import { CustomErrorValidationFilter } from './common/filters/error-validation.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new CustomErrorValidationFilter());
  await app.listen(process.env.PORT ?? 8002);
}
bootstrap();
