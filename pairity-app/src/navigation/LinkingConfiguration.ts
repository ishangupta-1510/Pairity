import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const config = {
  screens: {
    Auth: {
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        ResetPassword: {
          path: 'reset-password/:token',
          parse: {
            token: (token: string) => token,
          },
        },
        EmailVerification: {
          path: 'verify-email/:email',
          parse: {
            email: (email: string) => decodeURIComponent(email),
          },
        },
      },
    },
    Main: {
      screens: {
        HomeTab: {
          screens: {
            Home: 'home',
            UserProfile: {
              path: 'user/:userId',
              parse: {
                userId: (userId: string) => userId,
              },
            },
            Settings: 'settings',
          },
        },
        DiscoverTab: {
          screens: {
            Discover: 'discover',
            UserDetail: {
              path: 'profile/:userId',
              parse: {
                userId: (userId: string) => userId,
              },
            },
            Filters: 'filters',
          },
        },
        MatchesTab: {
          screens: {
            Matches: 'matches',
            MatchDetail: {
              path: 'match/:matchId',
              parse: {
                matchId: (matchId: string) => matchId,
              },
            },
          },
        },
        ChatTab: {
          screens: {
            ChatList: 'messages',
            ChatRoom: {
              path: 'chat/:chatId',
              parse: {
                chatId: (chatId: string) => chatId,
              },
            },
            VideoCall: {
              path: 'video/:roomId',
              parse: {
                roomId: (roomId: string) => roomId,
              },
            },
          },
        },
        ProfileTab: {
          screens: {
            Profile: 'profile',
            EditProfile: 'edit-profile',
            ProfilePhotos: 'photos',
            AccountSettings: 'account',
            PrivacySettings: 'privacy',
            NotificationSettings: 'notifications',
            PremiumUpgrade: 'premium',
          },
        },
      },
    },
    NotFound: '*',
  },
};

const LinkingConfiguration = {
  prefixes: [prefix, 'pairity://', 'https://pairity.com', 'https://*.pairity.com'],
  config,
  // Handle notification deep links
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check if there is an initial notification
    // const notification = await getInitialNotification();
    // if (notification?.data?.url) {
    //   return notification.data.url;
    // }

    return null;
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);

    // Listen to incoming links from deep linking
    const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

    // Listen to notifications
    // const notificationSubscription = subscribeToNotifications((notification) => {
    //   if (notification?.data?.url) {
    //     listener(notification.data.url);
    //   }
    // });

    return () => {
      // Clean up subscriptions
      eventListenerSubscription.remove();
      // notificationSubscription?.remove();
    };
  },
};

export default LinkingConfiguration;