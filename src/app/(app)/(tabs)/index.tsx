import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { HomeHeader } from "@/components/home/home-header";
import { HomeMetricsGrid } from "@/components/home/home-metrics-grid";
import { MonthSelector } from "@/components/home/month-selector";
import { MonthlySummaryCard } from "@/components/home/monthly-summary-card";
import { PlanningStatusCard } from "@/components/home/planning-status-card";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { getCurrentCompetence, shiftCompetence } from "@/lib/format";
import { getMonthlyPlanning } from "@/planning/planning.api";
import type { MonthlyPlanning } from "@/planning/planning.types";
import { theme } from "@/theme/theme";

type ScreenState = "loading" | "ready" | "error";

export default function HomeScreen() {
  const { user, token, signOut } = useAuth();

  const [competence, setCompetence] = useState(getCurrentCompetence());

  const [planning, setPlanning] = useState<MonthlyPlanning | null>(null);

  const [state, setState] = useState<ScreenState>("loading");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const loadPlanning = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setState("loading");
    setErrorMessage(null);

    try {
      const response = await getMonthlyPlanning(token, competence);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setPlanning(response);
      setState("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }

      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar o planejamento."));

      setState("error");
    }
  }, [token, competence, signOut]);

  useFocusEffect(
    useCallback(() => {
      void loadPlanning();
    }, [loadPlanning])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <View style={styles.root}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <HomeHeader name={user?.name ?? ""} />

            <View style={styles.monthContainer}>
              <MonthSelector
                competence={competence}
                onPrevious={() => {
                  setCompetence((current) => shiftCompetence(current, -1));
                }}
                onNext={() => {
                  setCompetence((current) => shiftCompetence(current, 1));
                }}
              />
            </View>

            {state === "loading" && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}

            {state === "error" && (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>Não foi possível carregar</Text>

                <Text style={styles.errorText}>{errorMessage}</Text>

                <Pressable
                  onPress={() => {
                    void loadPlanning();
                  }}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}

            {state === "ready" && planning && (
              <>
                <MonthlySummaryCard planning={planning} />

                <View style={styles.metricsContainer}>
                  <HomeMetricsGrid planning={planning} />
                </View>

                <View style={styles.statusContainer}>
                  <PlanningStatusCard />
                </View>
              </>
            )}
          </ScrollView>
        </View>
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

  root: {
    flex: 1
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 112
  },

  monthContainer: {
    marginTop: 25,
    marginBottom: 19
  },

  metricsContainer: {
    marginTop: 16
  },

  statusContainer: {
    marginTop: 17
  },

  loadingContainer: {
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center"
  },

  errorCard: {
    alignItems: "center",
    borderRadius: theme.radius.large,
    padding: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text
  },

  errorText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  retryButton: {
    marginTop: 17,
    borderRadius: theme.radius.medium,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary
  },

  retryPressed: {
    opacity: 0.75
  },

  retryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF"
  }
});
