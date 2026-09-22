import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { PasswordInput } from "@/components/authentication/password-input";
import { getApiErrorMessage } from "@/lib/api";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn } = useAuth();

  const { theme, resolvedThemeMode } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function submit(): Promise<void> {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Informe seu e-mail e sua senha.");

      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");

      return;
    }

    setError(null);

    setLoading(true);

    try {
      await signIn({
        email: normalizedEmail,
        password
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Ionicons name="wallet-outline" size={30} color={theme.colors.primary} />
              </View>

              <Text style={styles.brandName}>Finance</Text>

              <Text style={styles.brandSubtitle}>Planeje seu mês com clareza.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Bem-vindo</Text>

              <Text style={styles.subtitle}>Entre na sua conta para continuar.</Text>

              <View style={styles.form}>
                <View>
                  <Text style={styles.label}>E-mail</Text>

                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="seu@email.com"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="email-address"
                      keyboardAppearance={resolvedThemeMode}
                      selectionColor={theme.colors.primary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      editable={!loading}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Senha</Text>

                  <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Sua senha"
                    visible={passwordVisible}
                    onToggleVisibility={() => {
                      setPasswordVisible((current) => !current);
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      void submit();
                    }}
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={18} color={theme.colors.danger} />

                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable
                  disabled={loading}
                  onPress={() => {
                    void submit();
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && !loading && styles.buttonPressed,
                    loading && styles.disabled
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.onPrimary} />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Ainda não tem uma conta?</Text>

                <Pressable
                  disabled={loading}
                  onPress={() => {
                    router.push("/signup");
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.signupLink}>Criar conta</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    flex: {
      flex: 1
    },

    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.backgroundTop
    },

    gradient: {
      flex: 1
    },

    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 32
    },

    brand: {
      alignItems: "center",
      marginBottom: 30
    },

    brandIcon: {
      width: 62,
      height: 62,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: theme.colors.primarySoft
    },

    brandName: {
      marginTop: 14,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: theme.colors.text
    },

    brandSubtitle: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },

    card: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 26,
      paddingHorizontal: 20,
      paddingVertical: 22,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    },

    title: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },

    form: {
      gap: 16,
      marginTop: 24
    },

    label: {
      marginBottom: 7,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "700",
      color: theme.colors.text
    },

    inputContainer: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      paddingHorizontal: 14,
      backgroundColor: theme.colors.surfaceMuted
    },

    input: {
      flex: 1,
      height: "100%",
      paddingVertical: 0,
      fontSize: 15,
      color: theme.colors.text
    },

    errorContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.danger,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.dangerSoft
    },

    errorText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.danger
    },

    button: {
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.medium,
      backgroundColor: theme.colors.primary
    },

    buttonPressed: {
      opacity: 0.82
    },

    buttonText: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.colors.onPrimary
    },

    disabled: {
      opacity: 0.6
    },

    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 5,
      marginTop: 22
    },

    signupText: {
      fontSize: 13,
      color: theme.colors.textSecondary
    },

    signupLink: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.colors.primary
    }
  });
}
