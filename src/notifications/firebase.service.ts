import { applicationDefault, initializeApp, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getDatabase, Database } from 'firebase-admin/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly app: App;
  private readonly messaging: Messaging;
  private readonly database: Database;

  constructor() {
    this.app = initializeApp({
      credential: applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    this.messaging = getMessaging(this.app);
    this.database = getDatabase(this.app);
  }

  getApp(): App {
    return this.app;
  }

  getMessaging(): Messaging {
    return this.messaging;
  }

  getDatabase(): Database {
    return this.database;
  }
}
