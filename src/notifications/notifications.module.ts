import { forwardRef, Global, Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { FirebaseService } from './firebase.service';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    TokensService,
    FirebaseService,
    NotificationsService,
    NotificationsResolver,
  ],
  exports: [
    TokensService,
    FirebaseService,
    NotificationsService,
    NotificationsResolver,
  ],
})
export class NotificationsModule {}
