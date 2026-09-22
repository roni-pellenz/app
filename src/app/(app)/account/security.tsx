import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { getApiErrorMessage } from "@/lib/api";
import { theme } from "@/theme/theme";

export default function SecurityScreen() {
  const { changePassword, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [saving, setSaving] = useState(false);

  const canSave =
    currentPassword.length >= 8 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    !saving;

  async function handleSave(): Promise<void> {
    if (!canSave) {
      return;
    }

    if (currentPassword.length > 72) {
      Alert.alert("Senha atual inválida", "A senha deve ter no máximo 72 caracteres.");

      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      Alert.alert("Nova senha inválida", "A nova senha deve ter entre 8 e 72 caracteres.");

      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert("Escolha outra senha", "A nova senha deve ser diferente da senha atual.");

      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Senhas diferentes", "A confirmação não corresponde à nova senha.");

      return;
    }

    setSaving(true);

    try {
      await changePassword({
        currentPassword,
        newPassword
      });

      Alert.alert(
        "Senha alterada",
        "Sua senha foi alterada com sucesso. Por segurança, todas as sessões foram encerradas e você precisará entrar novamente.",
        [
          {
            text: "Entrar novamente",
            onPress: () => {
              void signOut();
            }
          }
        ],
        {
          cancelable: false
        }
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível alterar a senha",
        getApiErrorMessage(error, "Não foi possível atualizar sua senha.")
      );
    } finally {
      setSaving(false);
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
            contentContainerStyle={styles.content}
          >
            <View style={styles.navigation}>
              <Pressable
                onPress={() => {
                  router.back();
                }}
                hitSlop={10}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={27} color={theme.colors.primary} />

                <Text style={styles.backText}>Conta</Text>
              </Pressable>
            </View>

            <View style={styles.header}>
              <View style={styles.heroIcon}>
                <Ionicons name="shield-checkmark-outline" size={35} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>Segurança</Text>

              <Text style={styles.subtitle}>
                Atualize sua senha para manter sua conta protegida.
              </Text>
            </View>

            <View style={styles.formCard}>
              <PasswordField
                label="Senha atual"
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                visible={currentPasswordVisible}
                onToggleVisibility={() => {
                  setCurrentPasswordVisible((current) => !current);
                }}
              />

              <View style={styles.divider} />

              <PasswordField
                label="Nova senha"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChangeText={setNewPassword}
                visible={newPasswordVisible}
                onToggleVisibility={() => {
                  setNewPasswordVisible((current) => !current);
                }}
              />

              <View style={styles.divider} />

              <PasswordField
                label="Confirmar nova senha"
                placeholder="Digite novamente"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                visible={confirmPasswordVisible}
                onToggleVisibility={() => {
                  setConfirmPasswordVisible((current) => !current);
                }}
              />
            </View>

            <View style={styles.requirementCard}>
              <View style={styles.requirementIcon}>
                <Ionicons name="key-outline" size={21} color={theme.colors.primary} />
              </View>

              <View style={styles.requirementContent}>
                <Text style={styles.requirementTitle}>Requisitos da senha</Text>

                <Text style={styles.requirementText}>
                  Sua senha deve ter entre 8 e 72 caracteres.
                </Text>
              </View>
            </View>

            <View style={styles.sessionCard}>
              <View style={styles.sessionIcon}>
                <Ionicons name="log-out-outline" size={22} color={theme.colors.warning} />
              </View>

              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>Sessões ativas</Text>

                <Text style={styles.sessionText}>
                  Ao alterar sua senha, todas as sessões abertas serão encerradas por segurança.
                </Text>
              </View>
            </View>

            <Pressable
              disabled={!canSave}
              onPress={() => {
                void handleSave();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                pressed && canSave && styles.saveButtonPressed
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={21} color="#FFFFFF" />

                  <Text style={styles.saveButtonText}>Alterar senha</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

type PasswordFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
};

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  visible,
  onToggleVisibility
}: PasswordFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.passwordRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={72}
          style={styles.passwordInput}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`
          }
          hitSlop={8}
          onPress={onToggleVisibility}
          style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
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

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40
  },

  navigation: {
    height: 48,
    flexDirection: "row",
    alignItems: "center"
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center"
  },

  backText: {
    marginLeft: -3,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.primary
  },

  header: {
    alignItems: "center",
    marginTop: 22
  },

  heroIcon: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft
  },

  title: {
    marginTop: 14,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: theme.colors.text
  },

  subtitle: {
    marginTop: 5,
    maxWidth: 310,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  formCard: {
    overflow: "hidden",
    marginTop: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  field: {
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 11
  },

  fieldLabel: {
    marginBottom: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },

  passwordRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center"
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    paddingRight: 8,
    fontSize: 16,
    lineHeight: 21,
    color: theme.colors.text
  },

  eyeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18
  },

  eyeButtonPressed: {
    backgroundColor: theme.colors.surfaceMuted
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 17,
    backgroundColor: theme.colors.border
  },

  requirementCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.primarySoft
  },

  requirementIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.68)"
  },

  requirementContent: {
    flex: 1,
    marginLeft: 12
  },

  requirementTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.text
  },

  requirementText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#49678F"
  },

  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.warningSoft
  },

  sessionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.68)"
  },

  sessionContent: {
    flex: 1,
    marginLeft: 12
  },

  sessionTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.text
  },

  sessionText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },

  saveButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: theme.colors.primary
  },

  saveButtonDisabled: {
    opacity: 0.4
  },

  saveButtonPressed: {
    opacity: 0.75
  },

  saveButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: "#FFFFFF"
  }
});
