import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from 'nestjs-prisma';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { defaultUploadConfig } from './storage/config/upload';
import { LocalStorageProvider } from './storage/local-storage-provider';
import { StorageModule } from './storage/storage.module';
import { PostsModule } from './posts/posts.module';

@Global()
@Module({
  imports: [
    // Importando módulo do Multer, que é Global e pode ser acessado por toda a aplicação a partir dessa importação.
    MulterModule.register({
      ...defaultUploadConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    PrismaModule.forRoot({ isGlobal: true }),
    StorageModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
