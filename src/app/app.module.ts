import { CacheModule, Logger, Module } from '@nestjs/common';
import { loggingMiddleware } from '../common/middleware/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ArticlesModule } from '../common/entities/articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('Application'))], //  configure your prisma middleware
      },
    }),
    ThrottlerModule.forRoot({
      ttl: 30,
      limit: 15,
    }),
    ArticlesModule,
    CacheModule.register({ isGlobal: true }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
