import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/authentication/auth.context";
import { syncExpenseNotifications } from "@/notification/notification.service";

export default function AppLayout() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      return;
    }

    function synchronize(): void {
      if (!token) {
        return;
      }

      void syncExpenseNotifications(token).catch(() => undefined);
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
  }, [token]);

  useEffect(() => {
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

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!active || !response?.notification) {
        return;
      }

      redirectFromNotification(response.notification);

      void Notifications.clearLastNotificationResponseAsync();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirectFromNotification(response.notification);

      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => {
      active = false;

      subscription.remove();
    };
  }, []);

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
