import * as SecureStore from "expo-secure-store";

export type AccountNotificationPreferences = {
  expenseRemindersEnabled: boolean;
};

export const DEFAULT_ACCOUNT_NOTIFICATION_PREFERENCES: AccountNotificationPreferences = {
  expenseRemindersEnabled: false
};

const NOTIFICATION_PREFERENCES_KEY = "finance.notifications.preferences.v1";

export async function loadAccountNotificationPreferences(): Promise<AccountNotificationPreferences> {
  const rawPreferences = await SecureStore.getItemAsync(NOTIFICATION_PREFERENCES_KEY);

  if (!rawPreferences) {
    return {
      ...DEFAULT_ACCOUNT_NOTIFICATION_PREFERENCES
    };
  }

  try {
    const parsed: unknown = JSON.parse(rawPreferences);

    if (isAccountNotificationPreferences(parsed)) {
      return parsed;
    }
  } catch {
    // Se o conteúdo estiver inválido,
    // voltamos para os valores padrão.
  }

  return {
    ...DEFAULT_ACCOUNT_NOTIFICATION_PREFERENCES
  };
}

export async function saveAccountNotificationPreferences(
  preferences: AccountNotificationPreferences
): Promise<void> {
  await SecureStore.setItemAsync(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
}

export async function saveExpenseRemindersEnabled(enabled: boolean): Promise<void> {
  const current = await loadAccountNotificationPreferences();

  await saveAccountNotificationPreferences({
    ...current,
    expenseRemindersEnabled: enabled
  });
}

function isAccountNotificationPreferences(value: unknown): value is AccountNotificationPreferences {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const preferences = value as Record<string, unknown>;

  return typeof preferences.expenseRemindersEnabled === "boolean";
}
