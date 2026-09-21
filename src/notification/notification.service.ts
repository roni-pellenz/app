import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { loadAccountNotificationPreferences } from "@/account/account-notifications.storage";
import { getExpenses } from "@/expense/expense.api";
import type { Expense } from "@/expense/expense.types";
import { formatMoney, getCurrentCompetence, shiftCompetence } from "@/lib/format";

export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export type NotificationPermissionState = {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
};

type ExpenseReminderCandidate = {
  expense: Expense;
  triggerDate: Date;
};

const EXPENSE_NOTIFICATION_TYPE = "expense-reminder";

const TEST_NOTIFICATION_TYPE = "notification-test";

const ANDROID_CHANNEL_ID = "expense-reminders";

const LOOKAHEAD_MONTHS = 12;

const MAX_SCHEDULED_EXPENSE_REMINDERS = 48;

export const EXPENSE_REMINDER_HOUR = 9;

let synchronizationVersion = 0;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const permissions = await Notifications.getPermissionsAsync();

  return mapPermissionState(permissions);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  await configureAndroidNotificationChannel();

  const permissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true
    }
  });

  return mapPermissionState(permissions);
}

export async function syncExpenseNotifications(token: string): Promise<number> {
  const currentVersion = ++synchronizationVersion;

  const preferences = await loadAccountNotificationPreferences();

  if (!preferences.expenseRemindersEnabled) {
    await cancelExpenseNotificationsInternal();

    return 0;
  }

  const permission = await getNotificationPermissionState();

  if (permission.status !== "granted") {
    await cancelExpenseNotificationsInternal();

    return 0;
  }

  await configureAndroidNotificationChannel();

  const candidates = await loadExpenseReminderCandidates(token);

  if (currentVersion !== synchronizationVersion) {
    return 0;
  }

  await cancelExpenseNotificationsInternal();

  if (currentVersion !== synchronizationVersion) {
    return 0;
  }

  let scheduledCount = 0;

  for (const candidate of candidates.slice(0, MAX_SCHEDULED_EXPENSE_REMINDERS)) {
    if (currentVersion !== synchronizationVersion) {
      break;
    }

    await scheduleExpenseReminder(candidate);

    scheduledCount += 1;
  }

  return scheduledCount;
}

export async function cancelExpenseNotifications(): Promise<void> {
  synchronizationVersion += 1;

  await cancelExpenseNotificationsInternal();
}

export async function getScheduledExpenseNotificationCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  return scheduled.filter(
    (notification) => notification.content.data?.notificationType === EXPENSE_NOTIFICATION_TYPE
  ).length;
}

export async function scheduleTestNotification(): Promise<void> {
  const permission = await getNotificationPermissionState();

  if (permission.status !== "granted") {
    throw new Error("Permissão para notificações não concedida.");
  }

  await configureAndroidNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Notificações ativadas",
      body: "Este é um lembrete de teste do Finance.",
      sound: "default",
      data: {
        notificationType: TEST_NOTIFICATION_TYPE
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      ...(Platform.OS === "android" && {
        channelId: ANDROID_CHANNEL_ID
      })
    }
  });
}

async function loadExpenseReminderCandidates(token: string): Promise<ExpenseReminderCandidate[]> {
  const currentCompetence = getCurrentCompetence();

  const competences = Array.from(
    {
      length: LOOKAHEAD_MONTHS + 1
    },
    (_, index) => shiftCompetence(currentCompetence, index)
  );

  const monthlyExpenses = await Promise.all(
    competences.map((competence) => getExpenses(token, competence))
  );

  const uniqueExpenses = new Map<string, Expense>();

  for (const expenses of monthlyExpenses) {
    for (const expense of expenses) {
      uniqueExpenses.set(expense.id, expense);
    }
  }

  const now = new Date();

  const candidates: ExpenseReminderCandidate[] = [];

  for (const expense of uniqueExpenses.values()) {
    if (expense.paidDate || expense.notificationDaysBefore === null) {
      continue;
    }

    const triggerDate = createExpenseReminderDate(expense);

    if (!triggerDate) {
      continue;
    }

    if (triggerDate.getTime() <= now.getTime()) {
      continue;
    }

    candidates.push({
      expense,
      triggerDate
    });
  }

  return candidates.sort((left, right) => left.triggerDate.getTime() - right.triggerDate.getTime());
}

function createExpenseReminderDate(expense: Expense): Date | null {
  const [year, month, day] = expense.dueDate.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day || expense.notificationDaysBefore === null) {
    return null;
  }

  const triggerDate = new Date(year, month - 1, day, EXPENSE_REMINDER_HOUR, 0, 0, 0);

  triggerDate.setDate(triggerDate.getDate() - expense.notificationDaysBefore);

  return triggerDate;
}

async function scheduleExpenseReminder(candidate: ExpenseReminderCandidate): Promise<void> {
  const { expense, triggerDate } = candidate;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Lembrete de despesa",
      body: createReminderBody(expense),
      sound: "default",
      data: {
        notificationType: EXPENSE_NOTIFICATION_TYPE,
        expenseId: expense.id,
        dueDate: expense.dueDate
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      ...(Platform.OS === "android" && {
        channelId: ANDROID_CHANNEL_ID
      })
    }
  });
}

function createReminderBody(expense: Expense): string {
  const daysBefore = expense.notificationDaysBefore ?? 0;

  const amount = formatMoney(expense.amount);

  if (daysBefore === 0) {
    return `${expense.name} vence hoje. Valor: ${amount}.`;
  }

  if (daysBefore === 1) {
    return `${expense.name} vence amanhã. Valor: ${amount}.`;
  }

  return `${expense.name} vence em ${daysBefore} dias. Valor: ${amount}.`;
}

async function cancelExpenseNotificationsInternal(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const expenseNotificationIds = scheduled
    .filter(
      (notification) => notification.content.data?.notificationType === EXPENSE_NOTIFICATION_TYPE
    )
    .map((notification) => notification.identifier);

  await Promise.all(
    expenseNotificationIds.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier)
    )
  );
}

async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Lembretes de despesas",
    description: "Avisos de vencimento das despesas cadastradas.",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250]
  });
}

function mapPermissionState(
  permissions: Notifications.NotificationPermissionsStatus
): NotificationPermissionState {
  if (Platform.OS === "ios") {
    const iosStatus = permissions.ios?.status;

    if (
      iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
      iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
    ) {
      return {
        status: "granted",
        canAskAgain: permissions.canAskAgain
      };
    }

    if (iosStatus === Notifications.IosAuthorizationStatus.DENIED) {
      return {
        status: "denied",
        canAskAgain: permissions.canAskAgain
      };
    }

    return {
      status: "undetermined",
      canAskAgain: permissions.canAskAgain
    };
  }

  if (permissions.granted) {
    return {
      status: "granted",
      canAskAgain: permissions.canAskAgain
    };
  }

  if (permissions.status === "denied") {
    return {
      status: "denied",
      canAskAgain: permissions.canAskAgain
    };
  }

  return {
    status: "undetermined",
    canAskAgain: permissions.canAskAgain
  };
}
