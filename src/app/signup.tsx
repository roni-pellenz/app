import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
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
import { theme } from "@/theme/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");

  const [surname, setSurname] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function submit(): Promise<void> {
    const normalizedName = name.trim();

    const normalizedSurname = surname.trim();

    const normalizedEmail = email.trim();

    if (
      !normalizedName ||
      !normalizedSurname ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Preencha todos os campos.");

      return;
    }

    if (normalizedName.length > 120 || normalizedSurname.length > 120) {
      setError("Nome e sobrenome devem ter no máximo 120 caracteres.");

      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Informe um e-mail válido.");

      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");

      return;
    }

    if (password.length > 72) {
      setError("A senha deve ter no máximo 72 caracteres.");

      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");

      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signUp({
        name: normalizedName,
        surname: normalizedSurname,
        email: normalizedEmail,
        password
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível criar sua conta."));
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
            <Pressable
              disabled={loading}
              onPress={() => {
                router.back();
              }}
              hitSlop={8}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.text} />

              <Text style={styles.backText}>Voltar</Text>
            </Pressable>

            <View style={styles.header}>
              <View style={styles.brandIcon}>
                <Ionicons name="wallet-outline" size={28} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>Crie sua conta</Text>

              <Text style={styles.subtitle}>Comece a se organizar financeiramente</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <Text style={styles.label}>Nome</Text>

                    <View style={styles.inputContainer}>
                      <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Nome"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="given-name"
                        textContentType="givenName"
                        editable={!loading}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View style={styles.nameField}>
                    <Text style={styles.label}>Sobrenome</Text>

                    <View style={styles.inputContainer}>
                      <TextInput
                        value={surname}
                        onChangeText={setSurname}
                        placeholder="Sobrenome"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="family-name"
                        textContentType="familyName"
                        editable={!loading}
                        style={styles.input}
                      />
                    </View>
                  </View>
                </View>

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
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
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
                    placeholder="Mínimo de 8 caracteres"
                    visible={passwordVisible}
                    onToggleVisibility={() => {
                      setPasswordVisible((current) => !current);
                    }}
                    disabled={loading}
                    autoComplete="new-password"
                    textContentType="newPassword"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Confirmar senha</Text>

                  <PasswordInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repita sua senha"
                    visible={confirmPasswordVisible}
                    onToggleVisibility={() => {
                      setConfirmPasswordVisible((current) => !current);
                    }}
                    disabled={loading}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      void submit();
                    }}
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={18} color={theme.colors.danger} />

                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

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
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Criar conta</Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Já possui uma conta?</Text>

                <Pressable
                  disabled={loading}
                  onPress={() => {
                    router.back();
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.loginLink}>Entrar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32
  },

  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
    marginLeft: -5
  },

  backText: {
    marginLeft: 1,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text
  },

  pressed: {
    opacity: 0.55
  },

  header: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24
  },

  brandIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: theme.colors.primarySoft
  },

  title: {
    marginTop: 14,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: theme.colors.text
  },

  subtitle: {
    maxWidth: 290,
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
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

  form: {
    gap: 16
  },

  nameRow: {
    flexDirection: "row",
    gap: 10
  },

  nameField: {
    flex: 1
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
    color: "#FFFFFF"
  },

  disabled: {
    opacity: 0.6
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 22
  },

  loginText: {
    fontSize: 13,
    color: theme.colors.textSecondary
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.primary
  }
});
