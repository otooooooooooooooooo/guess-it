import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggingModule } from './logging/logging.module';
import { LoggingMiddleware } from './logging/logging.middleware';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'typedoc'),
      serveRoot: '/typedoc',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),
    RoomsModule,
    LoggingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('/');
  }
}
