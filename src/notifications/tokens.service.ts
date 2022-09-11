import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

interface TokenObject {
  token: string;
  timestamp: string;
}

@Injectable()
export class TokensService {
  constructor(private firebaseService: FirebaseService) {}
  async storeToken(new_token: string, userId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/tokens`);
    const snapshot = await ref.once('value');
    let tokens = snapshot.val();
    const newTokenObject = {
      token: new_token,
      timestamp: new Date().toISOString(),
    };

    // Verify if any token is already stored
    if (tokens) {
      // Verify if the token is already stored
      const tokenAlreadyExists = tokens.find(
        (token: TokenObject) => token.token === new_token,
      );

      // If the token is already stored, update the timestamp
      if (tokenAlreadyExists) {
        const updatedTokens = tokens.map((token: TokenObject) => {
          if (token.token === new_token) {
            return newTokenObject;
          }
          return token;
        });
        ref.update(updatedTokens);
        return new_token;
      }
    } else {
      tokens = [];
    }

    await ref.set([...tokens, newTokenObject]);

    return newTokenObject;
  }
}
