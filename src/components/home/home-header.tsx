import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { getUnreadNotificationInboxCount } from "@/notification/notification-inbox.storage";
import {
  recordExpenseNotificationInInbox,
  syncNotificationInboxFromPresented
} from "@/notification/notification-inbox.service";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type HomeHeaderProps = {
  name: string;
  userId: string;
};

export function HomeHeader({ name, userId }: HomeHeaderProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    if (!userId) {
      setUnreadCount(0);

      return;
    }

    try {
      await syncNotificationInboxFromPresented(userId);

      const count = await getUnreadNotificationInboxCount(userId);

      setUnreadCount(count);
    } catch {
      // O sino continua utilizável
      // mesmo se o contador falhar.
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void refreshUnreadCount();

      return undefined;
    }, [refreshUnreadCount])
  );

  useEffect(() => {
    const notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (!userId) {
          return;
        }

        void recordExpenseNotificationInInbox(userId, notification)
          .then(() => refreshUnreadCount())
          .catch(() => undefined);
      }
    );

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshUnreadCount();
      }
    });

    return () => {
      notificationSubscription.remove();

      appStateSubscription.remove();
    };
  }, [userId, refreshUnreadCount]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting} numberOfLines={1}>
          Olá, {name}! 👋
        </Text>

        <Text style={styles.subtitle}>Planeje hoje um amanhã mais tranquilo.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"
        }
        onPress={() => {
          router.push("/notifications");
        }}
        hitSlop={10}
        style={({ pressed }) => [styles.notification, pressed && styles.notificationPressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />

        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    textContainer: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12
    },

    greeting: {
      fontSize: 25,
      lineHeight: 30,
      fontWeight: "800",
      letterSpacing: -0.75,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary
    },

    notification: {
      position: "relative",
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22
    },

    notificationPressed: {
      backgroundColor: theme.colors.primarySoft
    },

    badge: {
      position: "absolute",
      top: 3,
      right: 2,
      minWidth: 17,
      height: 17,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.backgroundTop,
      borderRadius: 9,
      paddingHorizontal: 3,
      backgroundColor: theme.colors.danger
    },

    badgeText: {
      fontSize: 9,
      lineHeight: 11,
      fontWeight: "800",
      color: theme.colors.onPrimary
    }
  });
}
