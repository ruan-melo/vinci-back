import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private firebaseService: FirebaseService) {}
  // async sendNotification() {}
}
