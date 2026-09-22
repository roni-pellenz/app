import * as Notifications from "expo-notifications";
import {
  upsertNotificationInboxItem,
  type NotificationInboxItem
} from "@/notification/notification-inbox.storage";

const EXPENSE_NOTIFICATION_TYPE = "expense-reminder";

export async function recordExpenseNotificationInInbox(
  userId: string,
  notification: Notifications.Notification,
  read = false
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const data = notification.request.content.data;

  if (data?.notificationType !== EXPENSE_NOTIFICATION_TYPE) {
    return false;
  }

  const expenseId = typeof data.expenseId === "string" ? data.expenseId : null;

  const dueDate = typeof data.dueDate === "string" ? data.dueDate : null;

  const notificationDate = Number.isFinite(notification.date)
    ? new Date(notification.date)
    : new Date();

  const item: NotificationInboxItem = {
    id: notification.request.identifier,
    title: notification.request.content.title?.trim() || "Lembrete de despesa",
    body: notification.request.content.body?.trim() || "Você recebeu um novo lembrete do Finance.",
    receivedAt: notificationDate.toISOString(),
    expenseId,
    dueDate,
    read
  };

  await upsertNotificationInboxItem(userId, item);

  return true;
}

export async function syncNotificationInboxFromPresented(userId: string): Promise<void> {
  if (!userId) {
    return;
  }

  const notifications = await Notifications.getPresentedNotificationsAsync();

  for (const notification of notifications) {
    await recordExpenseNotificationInInbox(userId, notification);
  }
}
