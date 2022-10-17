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
    // this.messaging.send({
    //   token:
    //     'fQEALcwMZmFZPXmS2PEZ97:APA91bHnBXfFvhMk35BZQ96TgK7kvyKkNuq38DBE6X_fpjEIaipiNHdlwDdqNqhBRHhAXtwz6TDDn3fBG3WPmadhyk0pmfLMw8IQYICUPIi9v_bmem6RBkXX92pOe2SECW9kyCE50Eo3',
    //   data: { test: 'test' },
    // });
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
