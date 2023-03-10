import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';
import { AppModule } from './app/app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as env from 'env-var';

const logger = new Logger('Application');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: ['error', 'warn', 'log'],
    }
  );

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // enable shutdown hook
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Prisma Client Exception Filter for unhandled exceptions
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const origin = env.get('ORIGIN').asString();
  const port = env.get('SERVER_PORT').asInt();
  const host = env.get('HOST').asString();

  const corsOrigin = {
    origin,
    credentials: true,
  };
  app.enableCors(corsOrigin);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );
  const config = new DocumentBuilder()
    .setTitle('workshop API')
    .setDescription('The workshop API description')
    .setVersion('1.0')
    .build();
  const swaggerOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, swaggerOptions);

  await app.listen(port, host);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
