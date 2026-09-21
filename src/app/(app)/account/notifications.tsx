import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_ACCOUNT_NOTIFICATION_PREFERENCES,
  loadAccountNotificationPreferences,
  saveExpenseRemindersEnabled,
  type AccountNotificationPreferences
} from "@/account/account-notifications.storage";
import { useAuth } from "@/authentication/auth.context";
import {
  cancelExpenseNotifications,
  EXPENSE_REMINDER_HOUR,
  getNotificationPermissionState,
  getScheduledExpenseNotificationCount,
  requestNotificationPermission,
  scheduleTestNotification,
  syncExpenseNotifications,
  type NotificationPermissionState
} from "@/notification/notification.service";
import { theme } from "@/theme/theme";

export default function NotificationsScreen() {
  const { token } = useAuth();

  const [preferences, setPreferences] = useState<AccountNotificationPreferences>({
    ...DEFAULT_ACCOUNT_NOTIFICATION_PREFERENCES
  });

  const [permission, setPermission] = useState<NotificationPermissionState | null>(null);

  const [scheduledCount, setScheduledCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [testing, setTesting] = useState(false);

  const refreshState = useCallback(async (showLoading = true): Promise<void> => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [storedPreferences, currentPermission, currentScheduledCount] = await Promise.all([
        loadAccountNotificationPreferences(),
        getNotificationPermissionState(),
        getScheduledExpenseNotificationCount()
      ]);

      setPreferences(storedPreferences);

      setPermission(currentPermission);

      setScheduledCount(currentScheduledCount);
    } catch {
      if (showLoading) {
        Alert.alert(
          "Não foi possível carregar",
          "Não foi possível consultar as configurações de notificações."
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshState();

      return undefined;
    }, [refreshState])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshState(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshState]);

  async function handleReminderToggle(enabled: boolean): Promise<void> {
    if (saving || !token) {
      return;
    }

    setSaving(true);

    try {
      if (!enabled) {
        await saveExpenseRemindersEnabled(false);

        await cancelExpenseNotifications();

        setPreferences((current) => ({
          ...current,
          expenseRemindersEnabled: false
        }));

        setScheduledCount(0);

        return;
      }

      let currentPermission = await getNotificationPermissionState();

      if (currentPermission.status !== "granted") {
        currentPermission = await requestNotificationPermission();

        setPermission(currentPermission);
      }

      if (currentPermission.status !== "granted") {
        await saveExpenseRemindersEnabled(false);

        setPreferences((current) => ({
          ...current,
          expenseRemindersEnabled: false
        }));

        showPermissionDeniedAlert();

        return;
      }

      await saveExpenseRemindersEnabled(true);

      setPreferences((current) => ({
        ...current,
        expenseRemindersEnabled: true
      }));

      try {
        const count = await syncExpenseNotifications(token);

        setScheduledCount(count);
      } catch {
        Alert.alert(
          "Notificações ativadas",
          "A permissão foi concedida, mas não foi possível sincronizar os lembretes agora. O aplicativo tentará novamente automaticamente."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleTest(): Promise<void> {
    if (testing) {
      return;
    }

    setTesting(true);

    try {
      await scheduleTestNotification();

      Alert.alert("Teste agendado", "Uma notificação de teste será exibida em alguns segundos.");
    } catch {
      Alert.alert(
        "Não foi possível testar",
        "Verifique se as notificações estão permitidas nos ajustes do aparelho."
      );
    } finally {
      setTesting(false);
    }
  }

  function showPermissionDeniedAlert(): void {
    Alert.alert(
      "Notificações bloqueadas",
      "O Finance não possui permissão para exibir notificações neste aparelho.",
      [
        {
          text: "Agora não",
          style: "cancel"
        },
        {
          text: "Abrir Ajustes",
          onPress: () => {
            void Linking.openSettings();
          }
        }
      ]
    );
  }

  const permissionGranted = permission?.status === "granted";

  const permissionDenied = permission?.status === "denied";

  const remindersAvailable = preferences.expenseRemindersEnabled && permissionGranted;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
              <Ionicons name="notifications-outline" size={35} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>Notificações</Text>

            <Text style={styles.subtitle}>
              Receba lembretes antes do vencimento das suas despesas.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Lembretes</Text>

              <View style={styles.settingsCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="calendar-outline" size={23} color={theme.colors.primary} />
                  </View>

                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Vencimentos de despesas</Text>

                    <Text style={styles.settingDescription}>
                      Usa o prazo de notificação definido em cada despesa.
                    </Text>
                  </View>

                  <Switch
                    value={preferences.expenseRemindersEnabled}
                    disabled={saving}
                    onValueChange={(enabled) => {
                      void handleReminderToggle(enabled);
                    }}
                    trackColor={{
                      false: "#CBD8E7",
                      true: theme.colors.primary
                    }}
                    ios_backgroundColor="#CBD8E7"
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Status</Text>

              <View style={styles.statusCard}>
                <View
                  style={[
                    styles.statusIcon,
                    permissionGranted
                      ? styles.statusIconSuccess
                      : permissionDenied
                        ? styles.statusIconDanger
                        : styles.statusIconNeutral
                  ]}
                >
                  <Ionicons
                    name={
                      permissionGranted
                        ? "checkmark-circle-outline"
                        : permissionDenied
                          ? "notifications-off-outline"
                          : "help-circle-outline"
                    }
                    size={24}
                    color={
                      permissionGranted
                        ? theme.colors.success
                        : permissionDenied
                          ? theme.colors.danger
                          : theme.colors.textSecondary
                    }
                  />
                </View>

                <View style={styles.statusContent}>
                  <Text style={styles.statusTitle}>
                    {permissionGranted
                      ? "Permitidas no aparelho"
                      : permissionDenied
                        ? "Bloqueadas no aparelho"
                        : "Permissão ainda não solicitada"}
                  </Text>

                  <Text style={styles.statusText}>
                    {remindersAvailable
                      ? `${scheduledCount} lembrete${scheduledCount === 1 ? "" : "s"} agendado${scheduledCount === 1 ? "" : "s"}.`
                      : permissionDenied
                        ? "Ative as notificações nos ajustes do sistema."
                        : "Ative os lembretes acima para começar."}
                  </Text>
                </View>
              </View>

              {permissionDenied ? (
                <Pressable
                  onPress={() => {
                    void Linking.openSettings();
                  }}
                  style={({ pressed }) => [
                    styles.settingsButton,
                    pressed && styles.settingsButtonPressed
                  ]}
                >
                  <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />

                  <Text style={styles.settingsButtonText}>Abrir ajustes do aparelho</Text>
                </Pressable>
              ) : null}

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons name="time-outline" size={22} color={theme.colors.warning} />
                </View>

                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Horário dos lembretes</Text>

                  <Text style={styles.infoText}>
                    Os avisos são programados para {String(EXPENSE_REMINDER_HOUR).padStart(2, "0")}
                    :00, respeitando a quantidade de dias configurada em cada despesa.
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={!remindersAvailable || testing}
                onPress={() => {
                  void handleTest();
                }}
                style={({ pressed }) => [
                  styles.testButton,
                  (!remindersAvailable || testing) && styles.testButtonDisabled,
                  pressed && remindersAvailable && !testing && styles.testButtonPressed
                ]}
              >
                {testing ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <Ionicons name="notifications-outline" size={21} color={theme.colors.primary} />

                    <Text style={styles.testButtonText}>Enviar notificação de teste</Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.footerText}>
                Somente despesas com lembrete configurado e ainda não pagas geram notificações.
              </Text>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    maxWidth: 310,
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  loadingContainer: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center"
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },

  settingsCard: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  settingRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14
  },

  settingIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft
  },

  settingContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 10
  },

  settingTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    color: theme.colors.text
  },

  settingDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },

  statusCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    padding: 15,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  statusIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14
  },

  statusIconSuccess: {
    backgroundColor: theme.colors.successSoft
  },

  statusIconDanger: {
    backgroundColor: theme.colors.dangerSoft
  },

  statusIconNeutral: {
    backgroundColor: theme.colors.surfaceMuted
  },

  statusContent: {
    flex: 1,
    marginLeft: 13
  },

  statusTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: theme.colors.text
  },

  statusText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },

  settingsButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft
  },

  settingsButtonPressed: {
    opacity: 0.7
  },

  settingsButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.warningSoft
  },

  infoIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.68)"
  },

  infoContent: {
    flex: 1,
    marginLeft: 12
  },

  infoTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.text
  },

  infoText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },

  testButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    backgroundColor: theme.colors.surface
  },

  testButtonDisabled: {
    opacity: 0.4
  },

  testButtonPressed: {
    backgroundColor: theme.colors.primarySoft
  },

  testButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary
  },

  footerText: {
    marginTop: 14,
    paddingHorizontal: 10,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: theme.colors.textMuted
  }
});
