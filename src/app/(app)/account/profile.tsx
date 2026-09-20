import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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

export default function ProfileScreen() {
  const { user, updateProfile, deleteAccount } = useAuth();

  const [name, setName] = useState(user?.name ?? "");

  const [surname, setSurname] = useState(user?.surname ?? "");

  const [email, setEmail] = useState(user?.email ?? "");

  const [saving, setSaving] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const trimmedName = name.trim();

  const trimmedSurname = surname.trim();

  const normalizedEmail = email.trim().toLowerCase();

  const hasChanges = useMemo(() => {
    if (!user) {
      return false;
    }

    return (
      trimmedName !== user.name || trimmedSurname !== user.surname || normalizedEmail !== user.email
    );
  }, [normalizedEmail, trimmedName, trimmedSurname, user]);

  const canDelete =
    deletePassword.length >= 8 && deleteConfirmation.trim().toUpperCase() === "EXCLUIR";

  async function handleSave(): Promise<void> {
    if (saving || !hasChanges) {
      return;
    }

    if (!trimmedName) {
      Alert.alert("Nome obrigatório", "Informe seu nome.");

      return;
    }

    if (!trimmedSurname) {
      Alert.alert("Sobrenome obrigatório", "Informe seu sobrenome.");

      return;
    }

    if (trimmedName.length > 120) {
      Alert.alert("Nome muito longo", "O nome deve ter no máximo 120 caracteres.");

      return;
    }

    if (trimmedSurname.length > 120) {
      Alert.alert("Sobrenome muito longo", "O sobrenome deve ter no máximo 120 caracteres.");

      return;
    }

    if (normalizedEmail.length > 254 || !isValidEmail(normalizedEmail)) {
      Alert.alert("E-mail inválido", "Informe um endereço de e-mail válido.");

      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        name: trimmedName,
        surname: trimmedSurname,
        email: normalizedEmail
      });

      router.back();
    } catch (error) {
      Alert.alert(
        "Não foi possível salvar",
        getApiErrorMessage(error, "Não foi possível atualizar seus dados.")
      );
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal(): void {
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeletePasswordVisible(false);
    setDeleteModalVisible(true);
  }

  function closeDeleteModal(): void {
    if (deleting) {
      return;
    }

    setDeleteModalVisible(false);
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeletePasswordVisible(false);
  }

  async function handleDeleteAccount(): Promise<void> {
    if (!canDelete || deleting) {
      return;
    }

    setDeleting(true);

    try {
      await deleteAccount({
        password: deletePassword
      });

      setDeleteModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Não foi possível excluir",
        getApiErrorMessage(error, "Não foi possível excluir sua conta.")
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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

              <Pressable
                disabled={!hasChanges || saving}
                onPress={() => {
                  void handleSave();
                }}
                hitSlop={10}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>
                    Salvar
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{getInitials(name, surname)}</Text>
              </View>

              <Text style={styles.title}>Meus dados</Text>

              <Text style={styles.subtitle}>Atualize as informações usadas na sua conta.</Text>
            </View>

            <View style={styles.formCard}>
              <Field
                label="Nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={120}
                returnKeyType="next"
              />

              <View style={styles.divider} />

              <Field
                label="Sobrenome"
                value={surname}
                onChangeText={setSurname}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={120}
                returnKeyType="next"
              />

              <View style={styles.divider} />

              <Field
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={254}
                returnKeyType="done"
              />
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>

              <Text style={styles.infoText}>
                Alterações feitas aqui também serão atualizadas automaticamente no restante do
                aplicativo.
              </Text>
            </View>

            <View style={styles.dangerSection}>
              <Text style={styles.dangerTitle}>Excluir conta</Text>

              <Text style={styles.dangerDescription}>
                A exclusão remove definitivamente sua conta e todos os dados financeiros associados
                a ela.
              </Text>

              <Pressable
                onPress={openDeleteModal}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed
                ]}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />

                <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDeleteModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeDeleteModal}>
            <Pressable style={styles.modalCard} onPress={() => undefined}>
              <View style={styles.modalDangerIcon}>
                <Ionicons name="warning-outline" size={28} color={theme.colors.danger} />
              </View>

              <Text style={styles.modalTitle}>Excluir conta definitivamente?</Text>

              <Text style={styles.modalDescription}>
                Esta ação não pode ser desfeita. Para continuar, informe sua senha e digite EXCLUIR.
              </Text>

              <Text style={styles.modalFieldLabel}>Senha</Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Sua senha atual"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!deletePasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!deleting}
                  style={styles.passwordInput}
                />

                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    setDeletePasswordVisible((current) => !current);
                  }}
                >
                  <Ionicons
                    name={deletePasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              </View>

              <Text style={styles.modalFieldLabel}>Confirmação</Text>

              <TextInput
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                placeholder="Digite EXCLUIR"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!deleting}
                style={styles.confirmInput}
              />

              <View style={styles.modalActions}>
                <Pressable
                  disabled={deleting}
                  onPress={closeDeleteModal}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.actionButtonPressed
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  disabled={!canDelete || deleting}
                  onPress={() => {
                    void handleDeleteAccount();
                  }}
                  style={({ pressed }) => [
                    styles.confirmDeleteButton,
                    (!canDelete || deleting) && styles.confirmDeleteButtonDisabled,
                    pressed && canDelete && !deleting && styles.actionButtonPressed
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  autoCorrect?: boolean;
  maxLength?: number;
  returnKeyType?: "done" | "next";
};

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  maxLength,
  returnKeyType
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        style={styles.input}
      />
    </View>
  );
}

function getInitials(name: string, surname: string): string {
  const firstInitial = name.trim().charAt(0);

  const lastInitial = surname.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40
  },

  navigation: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
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

  saveText: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.primary
  },

  saveTextDisabled: {
    opacity: 0.35
  },

  header: {
    alignItems: "center",
    marginTop: 22
  },

  avatar: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
    backgroundColor: "#DCEBFC"
  },

  initials: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.9,
    color: "#06183C"
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
    paddingHorizontal: 18,
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
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },

  input: {
    minHeight: 30,
    padding: 0,
    fontSize: 16,
    lineHeight: 21,
    color: theme.colors.text
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 17,
    backgroundColor: theme.colors.border
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.primarySoft
  },

  infoIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.65)"
  },

  infoText: {
    flex: 1,
    marginLeft: 11,
    fontSize: 12,
    lineHeight: 17,
    color: "#49678F"
  },

  dangerSection: {
    marginTop: 30,
    borderRadius: 22,
    padding: 17,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  dangerTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    color: theme.colors.danger
  },

  dangerDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary
  },

  deleteButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 15,
    backgroundColor: theme.colors.dangerSoft
  },

  deleteButtonPressed: {
    opacity: 0.7
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.danger
  },

  modalRoot: {
    flex: 1
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: "rgba(8, 18, 40, 0.44)"
  },

  modalCard: {
    borderRadius: 26,
    padding: 20,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  modalDangerIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 17,
    backgroundColor: theme.colors.dangerSoft
  },

  modalTitle: {
    marginTop: 14,
    fontSize: 20,
    lineHeight: 25,
    textAlign: "center",
    fontWeight: "800",
    color: theme.colors.text
  },

  modalDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  modalFieldLabel: {
    marginTop: 18,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#344B70"
  },

  passwordInputContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C9D8EA",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceMuted
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: theme.colors.text
  },

  confirmInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#C9D8EA",
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22
  },

  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceMuted
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text
  },

  confirmDeleteButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: theme.colors.danger
  },

  confirmDeleteButtonDisabled: {
    opacity: 0.4
  },

  confirmDeleteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  actionButtonPressed: {
    opacity: 0.7
  }
});
