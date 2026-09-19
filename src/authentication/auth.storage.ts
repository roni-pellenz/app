import * as SecureStore from "expo-secure-store";
import type { AuthSession, AuthUser } from "@/authentication/auth.types";

const SESSION_KEY = "finance.session.v1";

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.surname === "string" &&
    typeof user.email === "string"
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;

  return typeof session.token === "string" && session.token.length > 0 && isAuthUser(session.user);
}

export async function loadStoredSession(): Promise<AuthSession | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session: unknown = JSON.parse(rawSession);

    if (!isAuthSession(session)) {
      await clearStoredSession();

      return null;
    }

    return session;
  } catch {
    await clearStoredSession();

    return null;
  }
}

export async function saveStoredSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
