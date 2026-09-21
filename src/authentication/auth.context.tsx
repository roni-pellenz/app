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
  ChangePasswordInput,
  DeleteAccountInput,
  LoginResponse,
  SignInInput,
  SignUpInput,
  UpdateProfileInput
} from "@/authentication/auth.types";
import { ApiError, apiRequest } from "@/lib/api";
import { cancelExpenseNotifications } from "@/notification/notification.service";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<AuthUser>;
  deleteAccount: (input: DeleteAccountInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
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

  const createSession = useCallback(async (input: SignInInput): Promise<void> => {
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

  const signIn = useCallback(
    async (input: SignInInput): Promise<void> => {
      await createSession({
        email: input.email.trim().toLowerCase(),
        password: input.password
      });
    },
    [createSession]
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<void> => {
      const email = input.email.trim().toLowerCase();

      await apiRequest("/users", {
        method: "POST",
        body: {
          name: input.name.trim(),
          surname: input.surname.trim(),
          email,
          password: input.password
        }
      });

      await createSession({
        email,
        password: input.password
      });
    },
    [createSession]
  );

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
      try {
        await cancelExpenseNotifications();
      } catch {
        // O logout não depende da limpeza
        // das notificações do sistema.
      }

      await clearStoredSession();

      setSession(null);
    }
  }, [session?.token]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<AuthUser> => {
      if (!session?.token) {
        throw new Error("Sessão indisponível.");
      }

      const updatedUser = await apiRequest<AuthUser>("/users/me", {
        method: "PATCH",
        token: session.token,
        body: input
      });

      const nextSession: AuthSession = {
        token: session.token,
        user: updatedUser
      };

      await saveStoredSession(nextSession);

      setSession(nextSession);

      return updatedUser;
    },
    [session]
  );

  const deleteAccount = useCallback(
    async (input: DeleteAccountInput): Promise<void> => {
      if (!session?.token) {
        throw new Error("Sessão indisponível.");
      }

      await apiRequest<{
        success: true;
      }>("/users/me", {
        method: "DELETE",
        token: session.token,
        body: input
      });

      try {
        await cancelExpenseNotifications();
      } catch {
        // A exclusão da conta já ocorreu
        // no servidor.
      }

      await clearStoredSession();

      setSession(null);
    },
    [session?.token]
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput): Promise<void> => {
      if (!session?.token) {
        throw new Error("Sessão indisponível.");
      }

      await apiRequest<{
        success: true;
      }>("/authentication/password", {
        method: "PATCH",
        token: session.token,
        body: input
      });
    },
    [session?.token]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      deleteAccount,
      changePassword
    }),
    [session, isLoading, signIn, signUp, signOut, updateProfile, deleteAccount, changePassword]
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
