import * as SecureStore from "expo-secure-store";

const UPCOMING_EXPENSES_KEY = "finance.preferences.show-upcoming-expenses.v1";

export async function loadShowUpcomingExpenses(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(UPCOMING_EXPENSES_KEY);

  if (value === null) {
    return true;
  }

  return value === "true";
}

export async function saveShowUpcomingExpenses(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(UPCOMING_EXPENSES_KEY, String(enabled));
}
