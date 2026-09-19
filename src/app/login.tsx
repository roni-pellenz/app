import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { getApiErrorMessage } from "@/lib/api";
import { theme } from "@/theme/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function submit(): Promise<void> {
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");

      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signIn({
        email: email.trim(),
        password
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View>
            <Text style={styles.title}>Finance</Text>

            <Text style={styles.subtitle}>Acesso temporário para desenvolvimento.</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              onSubmitEditing={() => {
                void submit();
              }}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              disabled={loading}
              onPress={() => {
                void submit();
              }}
              style={[styles.button, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },

  title: {
    fontSize: 38,
    fontWeight: "800",
    color: theme.colors.text
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: theme.colors.textSecondary
  },

  form: {
    gap: 14,
    marginTop: 38
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.medium,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface
  },

  error: {
    fontSize: 13,
    color: theme.colors.danger
  },

  button: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.medium,
    backgroundColor: theme.colors.primary
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  disabled: {
    opacity: 0.6
  }
});
