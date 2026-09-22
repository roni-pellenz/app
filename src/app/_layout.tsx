import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/authentication/auth.context";
import { AppThemeProvider, useAppTheme } from "@/theme/theme.context";

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  const { theme } = useAppTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loading,
          {
            backgroundColor: theme.colors.backgroundTop
          }
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.backgroundTop
        }
      }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />

        <Stack.Screen name="signup" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

function ThemedApplication() {
  const { resolvedThemeMode } = useAppTheme();

  return (
    <>
      <StatusBar style={resolvedThemeMode === "dark" ? "light" : "dark"} />

      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <ThemedApplication />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
