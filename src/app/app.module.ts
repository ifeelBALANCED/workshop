import { Logger, Module } from '@nestjs/common';
import { loggingMiddleware } from '../common/middleware/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('Application'))], //  configure your prisma middleware
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
