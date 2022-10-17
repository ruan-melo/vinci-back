import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

interface TokenObject {
  timestamp: string;
}

@Injectable()
export class TokensService {
  constructor(private firebaseService: FirebaseService) {}
  async storeToken(new_token: string, userId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/tokens/${new_token}`);

    const newTokenObject = {
      timestamp: new Date().toISOString(),
    };

    // Verify if any token is already stored
    await ref.update(newTokenObject);
    return newTokenObject;
  }

  async deleteToken(token: string, userId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/tokens/${token}`);
    await ref.remove();
  }

  async getUserTokens(userId: string): Promise<{ [key: string]: TokenObject }> {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/tokens`);
    const snapshot = await ref.once('value');
    const tokens = snapshot.val() as { [key: string]: TokenObject };
    return tokens || {};
  }
}
