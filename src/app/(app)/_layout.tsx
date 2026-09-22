import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/authentication/auth.context";
import {
  recordExpenseNotificationInInbox,
  syncNotificationInboxFromPresented
} from "@/notification/notification-inbox.service";
import { syncExpenseNotifications } from "@/notification/notification.service";

export default function AppLayout() {
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    const currentToken = token;
    const userId = user.id;

    function synchronize(): void {
      void syncNotificationInboxFromPresented(userId).catch(() => undefined);

      void syncExpenseNotifications(currentToken).catch(() => undefined);
    }

    synchronize();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        synchronize();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const userId = user.id;

    let active = true;

    function redirectFromNotification(notification: Notifications.Notification): void {
      const expenseId = notification.request.content.data?.expenseId;

      if (typeof expenseId !== "string" || !expenseId) {
        return;
      }

      router.push({
        pathname: "/expenses/[id]",
        params: {
          id: expenseId
        }
      });
    }

    async function handleNotificationResponse(
      notification: Notifications.Notification
    ): Promise<void> {
      try {
        await recordExpenseNotificationInInbox(userId, notification, true);
      } catch {
        // A navegação deve continuar
        // mesmo se o histórico local falhar.
      }

      if (active) {
        redirectFromNotification(notification);
      }
    }

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!active || !response?.notification) {
        return;
      }

      void handleNotificationResponse(response.notification).finally(() => {
        void Notifications.clearLastNotificationResponseAsync();
      });
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      void recordExpenseNotificationInInbox(userId, notification).catch(() => undefined);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleNotificationResponse(response.notification).finally(() => {
          void Notifications.clearLastNotificationResponseAsync();
        });
      }
    );

    return () => {
      active = false;

      receivedSubscription.remove();

      responseSubscription.remove();
    };
  }, [user?.id]);

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
