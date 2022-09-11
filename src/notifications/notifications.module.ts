import { Global, Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { FirebaseService } from './firebase.service';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  providers: [TokensService, FirebaseService, NotificationsService],
  exports: [TokensService, FirebaseService, NotificationsService],
})
export class NotificationsModule {}
