import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { UndoSnackbar } from "@/components/feedback/undo-snackbar";
import { MonthSelector } from "@/components/home/month-selector";
import { AddIncomeButton } from "@/components/incomes/add-income-button";
import { IncomeFilterTabs } from "@/components/incomes/income-filter-tabs";
import { IncomeRow } from "@/components/incomes/income-row";
import {
  deleteFutureIncomes,
  deleteIncome,
  getIncomes,
  receiveIncome,
  unreceiveIncome
} from "@/income/income.api";
import type { Income, IncomeFilter } from "@/income/income.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { formatMoney, getCurrentCompetence, shiftCompetence } from "@/lib/format";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type ScreenState = "loading" | "ready" | "error";

type DeleteScope = "single" | "future";

type PendingDelete = {
  commit: () => Promise<void>;
};

const UNDO_DURATION_MS = 4000;

const FLOATING_ACTION_BOTTOM_OFFSET = 73;

const UNDO_SNACKBAR_RIGHT = 100;

export default function IncomesScreen() {
  const { token, signOut } = useAuth();

  const { theme } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const insets = useSafeAreaInsets();

  const [competence, setCompetence] = useState(getCurrentCompetence());

  const [filter, setFilter] = useState<IncomeFilter>("all");

  const [incomes, setIncomes] = useState<Income[]>([]);

  const [state, setState] = useState<ScreenState>("loading");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [undoMessage, setUndoMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const undoActionRef = useRef<(() => Promise<void>) | null>(null);

  const pendingDeleteRef = useRef<PendingDelete | null>(null);

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

  function clearUndoTimer(): void {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);

      undoTimerRef.current = null;
    }
  }

  async function flushPendingDelete(): Promise<void> {
    const pending = pendingDeleteRef.current;

    pendingDeleteRef.current = null;

    if (pending) {
      await pending.commit();
    }
  }

  async function prepareForNewUndoAction(): Promise<void> {
    clearUndoTimer();

    setUndoMessage(null);

    undoActionRef.current = null;

    await flushPendingDelete();
  }

  function showUndoFeedback(message: string, onUndo: () => Promise<void>): void {
    clearUndoTimer();

    setUndoMessage(message);

    undoActionRef.current = onUndo;

    undoTimerRef.current = setTimeout(() => {
      undoTimerRef.current = null;

      setUndoMessage(null);

      undoActionRef.current = null;

      const pending = pendingDeleteRef.current;

      pendingDeleteRef.current = null;

      if (pending) {
        void pending.commit();
      }
    }, UNDO_DURATION_MS);
  }

  async function handleUndo(): Promise<void> {
    clearUndoTimer();

    const undoAction = undoActionRef.current;

    undoActionRef.current = null;

    pendingDeleteRef.current = null;

    setUndoMessage(null);

    if (undoAction) {
      await undoAction();
    }
  }

  function restoreIncome(income: Income): void {
    setIncomes((current) => {
      if (current.some((item) => item.id === income.id)) {
        return current;
      }

      return [...current, income].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
    });
  }

  async function handleToggleReceipt(income: Income): Promise<void> {
    if (!token) {
      return;
    }

    await prepareForNewUndoAction();

    const wasReceived = income.receivedDate !== null;

    const originalReceivedDate = income.receivedDate;

    try {
      const updatedIncome = wasReceived
        ? await unreceiveIncome(token, income.id)
        : await receiveIncome(token, income.id, {
            receivedDate: getTodayApiDate()
          });

      setIncomes((current) =>
        current.map((item) => (item.id === updatedIncome.id ? updatedIncome : item))
      );

      showUndoFeedback(
        wasReceived ? "Recebimento desmarcado." : "Receita marcada como recebida.",
        async () => {
          try {
            const revertedIncome =
              wasReceived && originalReceivedDate
                ? await receiveIncome(token, income.id, {
                    receivedDate: originalReceivedDate.slice(0, 10)
                  })
                : await unreceiveIncome(token, income.id);

            setIncomes((current) =>
              current.map((item) => (item.id === revertedIncome.id ? revertedIncome : item))
            );
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              await signOut();

              return;
            }

            Alert.alert(
              "Não foi possível desfazer",
              getApiErrorMessage(error, "Não foi possível restaurar o recebimento.")
            );
          }
        }
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }

      Alert.alert(
        "Não foi possível atualizar",
        getApiErrorMessage(error, "Não foi possível alterar o recebimento da receita.")
      );
    }
  }

  function handleDeleteRequest(income: Income): void {
    if (income.recurrenceId) {
      Alert.alert("Excluir receita recorrente", "Onde deseja aplicar a exclusão?", [
        {
          text: "Somente esta receita",
          style: "destructive",
          onPress: () => {
            void scheduleDelete(income, "single");
          }
        },
        {
          text: "Esta e as próximas",
          style: "destructive",
          onPress: () => {
            void scheduleDelete(income, "future");
          }
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]);

      return;
    }

    void scheduleDelete(income, "single");
  }

  async function scheduleDelete(income: Income, scope: DeleteScope): Promise<void> {
    if (!token) {
      return;
    }

    await prepareForNewUndoAction();

    setIncomes((current) => current.filter((item) => item.id !== income.id));

    pendingDeleteRef.current = {
      commit: async () => {
        try {
          if (scope === "future") {
            await deleteFutureIncomes(token, income.id);
          } else {
            await deleteIncome(token, income.id);
          }
        } catch (error) {
          restoreIncome(income);

          if (error instanceof ApiError && error.status === 401) {
            await signOut();

            return;
          }

          Alert.alert(
            "Não foi possível excluir",
            getApiErrorMessage(error, "A receita foi restaurada.")
          );
        }
      }
    };

    showUndoFeedback(
      scope === "future" ? "Receita e próximas removidas." : "Receita removida.",
      async () => {
        restoreIncome(income);
      }
    );
  }

  async function changeCompetence(offset: number): Promise<void> {
    await prepareForNewUndoAction();

    setCompetence((current) => shiftCompetence(current, offset));
  }

  const tabBarBottom = Math.max(insets.bottom - 14, 14);

  const floatingActionBottom = tabBarBottom + FLOATING_ACTION_BOTTOM_OFFSET;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <View style={styles.root}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Receitas</Text>

              <Text style={styles.subtitle}>Cadastre suas entradas e acompanhe sua renda.</Text>
            </View>

            <View style={styles.monthContainer}>
              <MonthSelector
                competence={competence}
                onPrevious={() => {
                  void changeCompetence(-1);
                }}
                onNext={() => {
                  void changeCompetence(1);
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
                        onToggleReceipt={() => {
                          void handleToggleReceipt(income);
                        }}
                        onDelete={() => {
                          handleDeleteRequest(income);
                        }}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <AddIncomeButton
            bottom={floatingActionBottom}
            onPress={() => {
              router.push({
                pathname: "/incomes/new",
                params: {
                  competence
                }
              });
            }}
          />

          <UndoSnackbar
            message={undoMessage}
            bottom={floatingActionBottom}
            right={UNDO_SNACKBAR_RIGHT}
            onUndo={() => {
              void handleUndo();
            }}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function getTodayApiDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      paddingTop: 20,
      paddingBottom: 155
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
      color: theme.colors.subtitle
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
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
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
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
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
      color: theme.colors.onPrimary
    },

    emptyCard: {
      minHeight: 150,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
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
}
