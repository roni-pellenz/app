import * as SecureStore from "expo-secure-store";
import type { ThemeMode } from "@/theme/theme";

export type HomeMetricsLayout = "detailed" | "compact";

export type AccountPreferences = {
  showUpcomingExpenses: boolean;
  homeMetricsLayout: HomeMetricsLayout;
  themeMode: ThemeMode;
};

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  showUpcomingExpenses: true,
  homeMetricsLayout: "detailed",
  themeMode: "system"
};

const PREFERENCES_KEY = "finance.preferences.v2";

const LEGACY_UPCOMING_EXPENSES_KEY = "finance.preferences.show-upcoming-expenses.v1";

export async function loadAccountPreferences(): Promise<AccountPreferences> {
  const rawPreferences = await SecureStore.getItemAsync(PREFERENCES_KEY);

  if (rawPreferences) {
    try {
      const parsed: unknown = JSON.parse(rawPreferences);

      const preferences = parseAccountPreferences(parsed);

      if (preferences) {
        return preferences;
      }
    } catch {
      // Se o conteúdo estiver inválido,
      // usamos os valores padrão abaixo.
    }
  }

  const legacyUpcomingExpenses = await SecureStore.getItemAsync(LEGACY_UPCOMING_EXPENSES_KEY);

  if (legacyUpcomingExpenses !== null) {
    return {
      ...DEFAULT_ACCOUNT_PREFERENCES,
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

export async function saveHomeMetricsLayout(layout: HomeMetricsLayout): Promise<void> {
  const currentPreferences = await loadAccountPreferences();

  await saveAccountPreferences({
    ...currentPreferences,
    homeMetricsLayout: layout
  });
}

export async function saveThemeMode(themeMode: ThemeMode): Promise<void> {
  const currentPreferences = await loadAccountPreferences();

  await saveAccountPreferences({
    ...currentPreferences,
    themeMode
  });
}

function parseAccountPreferences(value: unknown): AccountPreferences | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const preferences = value as Record<string, unknown>;

  if (typeof preferences.showUpcomingExpenses !== "boolean") {
    return null;
  }

  const storedLayout = preferences.homeMetricsLayout;

  if (storedLayout !== undefined && storedLayout !== "detailed" && storedLayout !== "compact") {
    return null;
  }

  const storedThemeMode = preferences.themeMode;

  if (
    storedThemeMode !== undefined &&
    storedThemeMode !== "system" &&
    storedThemeMode !== "light" &&
    storedThemeMode !== "dark"
  ) {
    return null;
  }

  return {
    showUpcomingExpenses: preferences.showUpcomingExpenses,

    homeMetricsLayout: storedLayout === "compact" ? "compact" : "detailed",

    themeMode:
      storedThemeMode === "light" || storedThemeMode === "dark" ? storedThemeMode : "system"
  };
}
