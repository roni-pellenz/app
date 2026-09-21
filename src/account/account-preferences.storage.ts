import * as SecureStore from "expo-secure-store";

export type AccountPreferences = {
  showUpcomingExpenses: boolean;
};

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  showUpcomingExpenses: true
};

const PREFERENCES_KEY = "finance.preferences.v2";

const LEGACY_UPCOMING_EXPENSES_KEY = "finance.preferences.show-upcoming-expenses.v1";

export async function loadAccountPreferences(): Promise<AccountPreferences> {
  const rawPreferences = await SecureStore.getItemAsync(PREFERENCES_KEY);

  if (rawPreferences) {
    try {
      const parsed: unknown = JSON.parse(rawPreferences);

      if (isAccountPreferences(parsed)) {
        return parsed;
      }
    } catch {
      // Se o conteúdo estiver inválido, usamos os padrões abaixo.
    }
  }

  const legacyUpcomingExpenses = await SecureStore.getItemAsync(LEGACY_UPCOMING_EXPENSES_KEY);

  if (legacyUpcomingExpenses !== null) {
    return {
      showUpcomingExpenses: legacyUpcomingExpenses === "true"
    };
  }

  return {
    ...DEFAULT_ACCOUNT_PREFERENCES
  };
}

export async function saveAccountPreferences(preferences: AccountPreferences): Promise<void> {
  await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(preferences));
}

export async function loadShowUpcomingExpenses(): Promise<boolean> {
  const preferences = await loadAccountPreferences();

  return preferences.showUpcomingExpenses;
}

export async function saveShowUpcomingExpenses(enabled: boolean): Promise<void> {
  const currentPreferences = await loadAccountPreferences();

  await saveAccountPreferences({
    ...currentPreferences,
    showUpcomingExpenses: enabled
  });
}

function isAccountPreferences(value: unknown): value is AccountPreferences {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const preferences = value as Record<string, unknown>;

  return typeof preferences.showUpcomingExpenses === "boolean";
}
