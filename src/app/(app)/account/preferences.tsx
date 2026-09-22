import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_ACCOUNT_PREFERENCES,
  loadAccountPreferences,
  saveHomeMetricsLayout,
  saveShowUpcomingExpenses,
  type AccountPreferences,
  type HomeMetricsLayout
} from "@/account/account-preferences.storage";
import { theme } from "@/theme/theme";

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<AccountPreferences>({
    ...DEFAULT_ACCOUNT_PREFERENCES
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load(): Promise<void> {
        setLoading(true);

        try {
          const result = await loadAccountPreferences();

          if (active) {
            setPreferences(result);
          }
        } catch {
          if (active) {
            Alert.alert(
              "Não foi possível carregar",
              "Não foi possível carregar suas preferências."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void load();

      return () => {
        active = false;
      };
    }, [])
  );

  async function handleUpcomingExpensesChange(enabled: boolean): Promise<void> {
    if (saving) {
      return;
    }

    const previousValue = preferences.showUpcomingExpenses;

    setPreferences((current) => ({
      ...current,
      showUpcomingExpenses: enabled
    }));

    setSaving(true);

    try {
      await saveShowUpcomingExpenses(enabled);
    } catch {
      setPreferences((current) => ({
        ...current,
        showUpcomingExpenses: previousValue
      }));

      Alert.alert("Não foi possível salvar", "Não foi possível atualizar esta preferência.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLayoutChange(layout: HomeMetricsLayout): Promise<void> {
    if (saving || preferences.homeMetricsLayout === layout) {
      return;
    }

    const previousLayout = preferences.homeMetricsLayout;

    setPreferences((current) => ({
      ...current,
      homeMetricsLayout: layout
    }));

    setSaving(true);

    try {
      await saveHomeMetricsLayout(layout);
    } catch {
      setPreferences((current) => ({
        ...current,
        homeMetricsLayout: previousLayout
      }));

      Alert.alert("Não foi possível salvar", "Não foi possível atualizar a visualização da Home.");
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
              <Ionicons name="settings-outline" size={35} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>Preferências</Text>

            <Text style={styles.subtitle}>
              Personalize como as informações aparecem no aplicativo.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Home</Text>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.layoutCard}>
                <View style={styles.layoutHeader}>
                  <View style={styles.layoutHeaderIcon}>
                    <Ionicons name="grid-outline" size={22} color={theme.colors.primary} />
                  </View>

                  <View style={styles.layoutHeaderContent}>
                    <Text style={styles.layoutTitle}>Visualização dos indicadores</Text>

                    <Text style={styles.layoutDescription}>
                      Escolha quanto espaço os indicadores ocupam na Home.
                    </Text>
                  </View>
                </View>

                <View style={styles.segmentedControl}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      void handleLayoutChange("detailed");
                    }}
                    style={({ pressed }) => [
                      styles.segmentedOption,
                      preferences.homeMetricsLayout === "detailed" &&
                        styles.segmentedOptionSelected,
                      pressed && styles.segmentedOptionPressed
                    ]}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={18}
                      color={
                        preferences.homeMetricsLayout === "detailed"
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />

                    <Text
                      style={[
                        styles.segmentedOptionText,
                        preferences.homeMetricsLayout === "detailed" &&
                          styles.segmentedOptionTextSelected
                      ]}
                    >
                      Detalhada
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      void handleLayoutChange("compact");
                    }}
                    style={({ pressed }) => [
                      styles.segmentedOption,
                      preferences.homeMetricsLayout === "compact" && styles.segmentedOptionSelected,
                      pressed && styles.segmentedOptionPressed
                    ]}
                  >
                    <Ionicons
                      name="apps-outline"
                      size={18}
                      color={
                        preferences.homeMetricsLayout === "compact"
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />

                    <Text
                      style={[
                        styles.segmentedOptionText,
                        preferences.homeMetricsLayout === "compact" &&
                          styles.segmentedOptionTextSelected
                      ]}
                    >
                      Compacta
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.layoutHint}>
                  {preferences.homeMetricsLayout === "detailed"
                    ? "Cards maiores e mais espaçados."
                    : "Mais informações em menos espaço."}
                </Text>
              </View>

              <View style={styles.preferencesCard}>
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceIcon}>
                    <Ionicons name="calendar-outline" size={23} color={theme.colors.warning} />
                  </View>

                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceTitle}>Próximos vencimentos</Text>

                    <Text style={styles.preferenceDescription}>
                      Mostrar na Home as despesas que vencem nos próximos 7 dias.
                    </Text>
                  </View>

                  <Switch
                    value={preferences.showUpcomingExpenses}
                    disabled={saving}
                    onValueChange={(enabled) => {
                      void handleUpcomingExpensesChange(enabled);
                    }}
                    trackColor={{
                      false: "#CBD8E7",
                      true: theme.colors.primary
                    }}
                    ios_backgroundColor="#CBD8E7"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="phone-portrait-outline" size={21} color={theme.colors.primary} />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Preferências deste aparelho</Text>

              <Text style={styles.infoText}>
                Estas configurações ficam salvas localmente e não alteram seus dados financeiros.
              </Text>
            </View>
          </View>
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

  sectionTitle: {
    marginTop: 30,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },

  loadingCard: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  layoutCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    padding: 15,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  layoutHeader: {
    flexDirection: "row",
    alignItems: "center"
  },

  layoutHeaderIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft
  },

  layoutHeaderContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13
  },

  layoutTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    color: theme.colors.text
  },

  layoutDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
  },

  segmentedControl: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
    borderRadius: 15,
    padding: 4,
    backgroundColor: theme.colors.surfaceMuted
  },

  segmentedOption: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12
  },

  segmentedOptionSelected: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  segmentedOptionPressed: {
    opacity: 0.7
  },

  segmentedOptionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    color: theme.colors.textSecondary
  },

  segmentedOptionTextSelected: {
    color: theme.colors.primary
  },

  layoutHint: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: theme.colors.textMuted
  },

  preferencesCard: {
    overflow: "hidden",
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  preferenceRow: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14
  },

  preferenceIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.warningSoft
  },

  preferenceContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 10
  },

  preferenceTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    color: theme.colors.text
  },

  preferenceDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: theme.colors.textSecondary
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
    width: 38,
    height: 38,
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
    color: "#49678F"
  }
});
