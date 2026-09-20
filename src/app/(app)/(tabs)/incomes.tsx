import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { IncomeFilterTabs } from "@/components/incomes/income-filter-tabs";
import { IncomeRow } from "@/components/incomes/income-row";
import { MonthSelector } from "@/components/home/month-selector";
import { getIncomes } from "@/income/income.api";
import type { Income, IncomeFilter } from "@/income/income.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { formatMoney, getCurrentCompetence, shiftCompetence } from "@/lib/format";
import { theme } from "@/theme/theme";

type ScreenState = "loading" | "ready" | "error";

export default function IncomesScreen() {
  const { token, signOut } = useAuth();

  const [competence, setCompetence] = useState(getCurrentCompetence());

  const [filter, setFilter] = useState<IncomeFilter>("all");

  const [incomes, setIncomes] = useState<Income[]>([]);

  const [state, setState] = useState<ScreenState>("loading");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const loadIncomes = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setState("loading");
    setErrorMessage(null);

    try {
      const response = await getIncomes(token, competence);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setIncomes(response);
      setState("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }

      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar as receitas."));

      setState("error");
    }
  }, [token, competence, signOut]);

  useFocusEffect(
    useCallback(() => {
      void loadIncomes();
    }, [loadIncomes])
  );

  const filteredIncomes = useMemo(() => {
    switch (filter) {
      case "recurring":
        return incomes.filter((income) => income.recurrenceId !== null);

      case "one-off":
        return incomes.filter((income) => income.recurrenceId === null);

      case "all":
      default:
        return incomes;
    }
  }, [filter, incomes]);

  const totalAmount = useMemo(
    () => filteredIncomes.reduce((total, income) => total + income.amount, 0),
    [filteredIncomes]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Receitas</Text>

            <Text style={styles.subtitle}>Cadastre suas entradas e acompanhe sua renda.</Text>
          </View>

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

          <IncomeFilterTabs value={filter} onChange={setFilter} />

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
                  void loadIncomes();
                }}
                style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          )}

          {state === "ready" && (
            <>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Receitas previstas</Text>

                <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoney(totalAmount)}
                </Text>
              </View>

              {filteredIncomes.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Nenhuma receita</Text>

                  <Text style={styles.emptyText}>
                    Não há receitas para este filtro no mês selecionado.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {filteredIncomes.map((income) => (
                    <IncomeRow
                      key={income.id}
                      income={income}
                      onPress={() => {
                        router.push({
                          pathname: "/incomes/[id]",
                          params: {
                            id: income.id
                          }
                        });
                      }}
                    />
                  ))}
                </View>
              )}
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
    paddingTop: 20,
    paddingBottom: 110
  },

  header: {
    paddingHorizontal: 1
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -1.1,
    color: theme.colors.text
  },

  subtitle: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 21,
    color: "#49678F"
  },

  monthContainer: {
    marginTop: 20,
    marginBottom: 16
  },

  summary: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 18,
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  summaryLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: theme.colors.text
  },

  summaryValue: {
    maxWidth: "55%",
    fontSize: 20,
    lineHeight: 24,
    textAlign: "right",
    fontWeight: "800",
    color: theme.colors.success
  },

  list: {
    marginTop: 14,
    gap: 12
  },

  loadingContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center"
  },

  errorCard: {
    alignItems: "center",
    marginTop: 18,
    borderRadius: 22,
    padding: 24,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text
  },

  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  retryButton: {
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: theme.colors.primary
  },

  retryPressed: {
    opacity: 0.75
  },

  retryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  emptyCard: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    borderRadius: 22,
    paddingHorizontal: 30,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: theme.colors.textSecondary
  }
});
