import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession
} from "@/authentication/auth.storage";
import type {
  AuthSession,
  AuthUser,
  LoginResponse,
  SignInInput
} from "@/authentication/auth.types";
import { ApiError, apiRequest } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const stored = await loadStoredSession();

        if (!stored) {
          return;
        }

        try {
          const user = await apiRequest<AuthUser>("/users/me", {
            token: stored.token
          });

          const refreshedSession: AuthSession = {
            token: stored.token,
            user
          };

          await saveStoredSession(refreshedSession);

          if (!cancelled) {
            setSession(refreshedSession);
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await clearStoredSession();

            return;
          }

          if (!cancelled) {
            setSession(stored);
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (input: SignInInput): Promise<void> => {
    const response = await apiRequest<LoginResponse>("/authentication/login", {
      method: "POST",
      body: input
    });

    const nextSession: AuthSession = {
      token: response.token,
      user: response.user
    };

    await saveStoredSession(nextSession);

    setSession(nextSession);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const currentToken = session?.token;

    try {
      if (currentToken) {
        await apiRequest("/authentication/logout", {
          method: "POST",
          token: currentToken
        });
      }
    } catch {
      // A sessão local sempre será encerrada.
    } finally {
      await clearStoredSession();
      setSession(null);
    }
  }, [session?.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoading,
      signIn,
      signOut
    }),
    [session, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
