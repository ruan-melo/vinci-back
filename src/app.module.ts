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
import { FirebaseService } from './notifications/firebase.service';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsModule } from './notifications/notifications.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { UsersResolver } from './users/users.resolver';
import { TokensService } from './notifications/tokens.service';
import { PostsResolver } from './posts/posts.resolver';
import { CommentsResolver } from './posts/comments.resolver';

@Module({
  // providers: [
  //   // FirebaseService,
  //   // TokensService,
  //   UsersService,
  //   PostsService,
  //   UsersResolver,
  //   PostsResolver,
  //   CommentsResolver,
  // ],
  imports: [
    // NotificationsModule,
    // Importando módulo do Multer, que é Global e pode ser acessado por toda a aplicação a partir dessa importação.
    MulterModule.register({
      ...defaultUploadConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/static',
      exclude: ['/graphql'],
    }),
    PrismaModule.forRoot({ isGlobal: true }),
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    StorageModule,
    UsersModule,
    PostsModule,
  ],

  // controllers: [AppController],
})
export class AppModule {}
