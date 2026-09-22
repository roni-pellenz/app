import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useColorScheme } from "react-native";
import { loadAccountPreferences, saveThemeMode } from "@/account/account-preferences.storage";
import {
  darkTheme,
  lightTheme,
  type AppTheme,
  type ResolvedThemeMode,
  type ThemeMode
} from "@/theme/theme";

type ThemeContextValue = {
  theme: AppTheme;
  themeMode: ThemeMode;
  resolvedThemeMode: ResolvedThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

type AppThemeProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      try {
        const preferences = await loadAccountPreferences();

        if (active) {
          setThemeModeState(preferences.themeMode);
        }
      } catch {
        if (active) {
          setThemeModeState("system");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const resolvedThemeMode: ResolvedThemeMode =
    themeMode === "system" ? (systemColorScheme === "dark" ? "dark" : "light") : themeMode;

  const theme = resolvedThemeMode === "dark" ? darkTheme : lightTheme;

  const setThemeMode = useCallback(
    async (mode: ThemeMode): Promise<void> => {
      const previousMode = themeMode;

      setThemeModeState(mode);

      try {
        await saveThemeMode(mode);
      } catch (error) {
        setThemeModeState(previousMode);

        throw error;
      }
    },
    [themeMode]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeMode,
      resolvedThemeMode,
      setThemeMode
    }),
    [theme, themeMode, resolvedThemeMode, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme deve ser usado dentro de AppThemeProvider.");
  }

  return context;
}
