import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { Message, MulticastMessage } from 'firebase-admin/messaging';
import { FirebaseService } from './firebase.service';
import { TokensService } from './tokens.service';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  NEW_POST = 'NEW_POST',
}
export interface FollowNotification {
  type: NotificationType.FOLLOW;
  followerId: string;
  timestamp: string;
  read: boolean;
}

export interface PostNotification {
  type: NotificationType.NEW_POST;
  postId: string;
  timestamp: string;
  authorId: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private firebaseService: FirebaseService,
    private tokensService: TokensService,
  ) {}

  async markNotificationAsRead(userId: string, notificationId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(
      `/notifications/${userId}/received/${notificationId}/read`,
    );
    await ref.set(true);

    const notificationSnapshot = await ref.once('value');
    const notification = notificationSnapshot.val() as FollowNotification;
    return { ...notification, id: notificationId };
  }

  async markAllNotificationAsRead(userId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/received`);
    const snapshot = await ref.once('value');
    const notifications = snapshot.val() as {
      [key: string]: FollowNotification;
    };

    if (!notifications) {
      return;
    }

    // TODO: Improve this

    await Promise.all(
      Object.keys(notifications).map((notificationId) =>
        ref.child(`${notificationId}/read`).set(true),
      ),
    );

    return Object.keys(notifications).map((id) => ({
      ...notifications[id],
      id,
      read: true,
    }));
  }

  async getAllUserNotifications(userId: string) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(`/notifications/${userId}/received`);
    const snapshot = await ref.once('value');
    const notifications = snapshot.val() as {
      [key: string]: FollowNotification;
    };
    return notifications || [];
  }

  async getUserNotification(
    userId: string,
    notificationId: string,
  ): Promise<FollowNotification & { id: string }> {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(
      `/notifications/${userId}/received/${notificationId}`,
    );
    const snapshot = await ref.once('value');
    const notification = snapshot.val() as FollowNotification;

    if (!notification) {
      return null;
    }

    return { ...notification, id: notificationId };
  }

  async storeToken({ userId, token }: { userId: string; token: string }) {
    const database = this.firebaseService.getDatabase();

    await this.tokensService.storeToken(token, userId);

    const postPreferencesRef = database.ref(
      `/notifications/${userId}/preferences/${NotificationType.NEW_POST}`,
    );

    // get all post preferences
    const postPreferencesSnapshot = await postPreferencesRef.once('value');

    const postPreferences = postPreferencesSnapshot.val() as {
      [key: string]: boolean;
    };

    if (!postPreferences) {
      return;
    }

    // get all post preferences that are true
    const subscribedAuthors = Object.entries(postPreferences)
      .filter(([authorId, preference]) => preference)
      .map(([authorId, preference]) => authorId);

    if (subscribedAuthors.length > 0) {
      // subscribe token to all post topics
      const messaging = this.firebaseService.getMessaging();
      await Promise.all(
        subscribedAuthors.map((authorId) =>
          messaging.subscribeToTopic(
            [token],
            `${authorId}-${NotificationType.NEW_POST}`,
          ),
        ),
      );
    }
  }

  async deleteToken({ userId, token }: { userId: string; token: string }) {
    const database = this.firebaseService.getDatabase();

    // Remove token from user tokens
    await this.tokensService.deleteToken(token, userId);
    const postPreferencesRef = database.ref(
      `/notifications/${userId}/preferences/${NotificationType.NEW_POST}`,
    );

    // get all post preferences
    const postPreferencesSnapshot = await postPreferencesRef.once('value');

    const postPreferences = postPreferencesSnapshot.val() as {
      [key: string]: boolean;
    };

    if (!postPreferences) {
      return;
    }

    // get all post preferences that are true
    const subscribedAuthors = Object.entries(postPreferences)
      .filter(([authorId, preference]) => preference)
      .map(([authorId, preference]) => authorId);

    if (subscribedAuthors.length > 0) {
      // unsubscribe token from all post topics
      const messaging = this.firebaseService.getMessaging();
      await Promise.all(
        subscribedAuthors.map((authorId) =>
          messaging.unsubscribeFromTopic(
            [token],
            `${authorId}-${NotificationType.NEW_POST}`,
          ),
        ),
      );
    }

    // const tokens = await this.tokensService.getUserTokens(userId);
  }

  async updatePostPreference({
    userId,
    authorId,
    preference,
  }: {
    userId: string;
    authorId: string;
    preference: boolean;
  }) {
    // Atualizo nas preferências que o usuário quer ou nao receber notificações de novos posts do autor
    const database = this.firebaseService.getDatabase();

    const ref = database.ref(
      `/notifications/${userId}/preferences/${NotificationType.NEW_POST}/${authorId}`,
    );

    if (preference) {
      await ref.set(preference);
    } else {
      await ref.remove();
    }

    const userTokensObject = await this.tokensService.getUserTokens(userId);

    const userTokens = Object.keys(userTokensObject);

    // Verifico se o usuário tem tokens cadastrados
    if (userTokens.length === 0) {
      return;
    }

    const messaging = this.firebaseService.getMessaging();
    // Se o usuário tem tokens cadastrados, inscrevo ou retiro a inscrição do tópico
    if (preference) {
      await messaging.subscribeToTopic(
        userTokens,
        `${authorId}-${NotificationType.NEW_POST}`,
      );
    } else {
      await messaging.unsubscribeFromTopic(
        userTokens,
        `${authorId}-${NotificationType.NEW_POST}`,
      );
    }
  }

  async updateFollowPreference({
    userId,
    preference,
  }: {
    userId: string;
    preference: boolean;
  }) {
    const database = this.firebaseService.getDatabase();
    const ref = database.ref(
      `/notifications/${userId}/preferences/${NotificationType.FOLLOW}`,
    );
    await ref.set(preference);
  }

  async sendFollowNotification({
    follower,
    followingId,
  }: {
    // token: string;
    follower: {
      id: string;
      profile_name: string;
      name: string;
    };
    followingId: string;
  }) {
    const database = this.firebaseService.getDatabase();

    // Verify if user wants to receive follows notifications
    const followPreferenceRef = database.ref(
      `/notifications/${followingId}/preferences/${NotificationType.FOLLOW}`,
    );

    const followPreferenceSnapshot = await followPreferenceRef.once('value');

    const followPreference = followPreferenceSnapshot.val();

    // If user does not want to receive follow notifications, return
    // If user does not have a preference set (null), it means that he wants to receive notifications
    if (followPreference === false) {
      return;
    }

    const ref = database.ref(`/notifications/${followingId}/received`);
    const newNotificationRef = await ref.push('value');

    const data: FollowNotification = {
      type: NotificationType.FOLLOW,
      followerId: follower.id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await newNotificationRef.set({ ...data, read: false });

    const followingTokensObject = await this.tokensService.getUserTokens(
      followingId,
    );

    const tokens = Object.keys(followingTokensObject);

    if (tokens.length === 0) {
      return;
    }

    const message: MulticastMessage = {
      tokens: tokens,
      notification: {
        // title: 'New follower',
        body: `@${follower.profile_name} is now following you`,
      },
      data: {
        ...data,
        read: 'false',
        // Send follower data to be used in notification click ( profile_name - open profile)
        followerProfileName: follower.profile_name,
      },
      android: {
        notification: {
          imageUrl:
            'https://d849-2804-29b8-513a-40c0-92b7-d728-704b-68c3.sa.ngrok.io/static/assets/logo.png',
        },
      },
      webpush: {
        headers: {
          image:
            'https://d849-2804-29b8-513a-40c0-92b7-d728-704b-68c3.sa.ngrok.io/static/assets/logo.png',
        },
      },
    };

    const messaging = await this.firebaseService.getMessaging();

    const response = await messaging.sendMulticast(message);
  }

  async sendPostNotification({
    author,
    post,
  }: {
    author: {
      id: string;
      name: string;
      profile_name: string;
    };
    post: {
      id: string;
      caption: string;
    };
  }) {
    const database = this.firebaseService.getDatabase();
    const messaging = await this.firebaseService.getMessaging();
    const data: PostNotification = {
      type: NotificationType.NEW_POST,
      authorId: author.id,
      postId: post.id,

      timestamp: new Date().toISOString(),
    };

    // console.log(
    //   'send post notificattion',
    //   `${author.id}-${NotificationType.NEW_POST}`,
    // );

    const response = await messaging.send({
      topic: `${author.id}-${NotificationType.NEW_POST}`,
      notification: {
        title:
          `New post from @${author.profile_name}` +
          `${post.caption.length > 0 ? `: ${post.caption}` : ''}`,
      },
      data: {
        // Send author data to be used in notification click (post id)
        ...data,
      },
    });
  }
}
