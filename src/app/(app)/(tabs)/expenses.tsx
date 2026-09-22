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
import { AddExpenseButton } from "@/components/expenses/add-expense-button";
import { ExpenseFilterTabs } from "@/components/expenses/expense-filter-tabs";
import { ExpenseListCard } from "@/components/expenses/expense-list-card";
import { ExpensesHeader } from "@/components/expenses/expenses-header";
import { UndoSnackbar } from "@/components/feedback/undo-snackbar";
import { MonthSelector } from "@/components/home/month-selector";
import {
  deleteExpense,
  deleteFutureExpenses,
  getExpenses,
  payExpense,
  unpayExpense
} from "@/expense/expense.api";
import type { Expense, ExpenseFilter } from "@/expense/expense.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { getCurrentCompetence, shiftCompetence } from "@/lib/format";
import { syncExpenseNotifications } from "@/notification/notification.service";
import { theme } from "@/theme/theme";

type ScreenState = "loading" | "ready" | "error";

type DeleteScope = "single" | "future";

type PendingDelete = {
  commit: () => Promise<void>;
};

const UNDO_DURATION_MS = 4000;

const FLOATING_ACTION_BOTTOM_OFFSET = 73;

const UNDO_SNACKBAR_RIGHT = 100;

export default function ExpensesScreen() {
  const { token, signOut } = useAuth();

  const insets = useSafeAreaInsets();

  const [competence, setCompetence] = useState(getCurrentCompetence());

  const [filter, setFilter] = useState<ExpenseFilter>("all");

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [state, setState] = useState<ScreenState>("loading");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [undoMessage, setUndoMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const undoActionRef = useRef<(() => Promise<void>) | null>(null);

  const pendingDeleteRef = useRef<PendingDelete | null>(null);

  const loadExpenses = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    const requestId = ++requestIdRef.current;

    setState("loading");
    setErrorMessage(null);

    try {
      const response = await getExpenses(token, competence);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setExpenses(response);

      setState("ready");
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        await signOut();

        return;
      }

      setErrorMessage(getApiErrorMessage(error, "Não foi possível carregar as despesas."));

      setState("error");
    }
  }, [token, competence, signOut]);

  useFocusEffect(
    useCallback(() => {
      void loadExpenses();
    }, [loadExpenses])
  );

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return;
      }

      void syncExpenseNotifications(token).catch(() => undefined);
    }, [token])
  );

  const filteredExpenses = useMemo(() => {
    switch (filter) {
      case "recurring":
        return expenses.filter((expense) => expense.recurrenceId !== null);

      case "installment":
        return expenses.filter((expense) => expense.installmentPlanId !== null);

      case "one-off":
        return expenses.filter(
          (expense) => expense.recurrenceId === null && expense.installmentPlanId === null
        );

      case "all":
      default:
        return expenses;
    }
  }, [expenses, filter]);

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

  function restoreExpense(expense: Expense): void {
    setExpenses((current) => {
      if (current.some((item) => item.id === expense.id)) {
        return current;
      }

      return [...current, expense].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    });
  }

  async function handleTogglePayment(expense: Expense): Promise<void> {
    if (!token) {
      return;
    }

    await prepareForNewUndoAction();

    const wasPaid = expense.paidDate !== null;

    const originalPaidDate = expense.paidDate;

    const originalPaidAmount = expense.paidAmount;

    try {
      const updatedExpense = wasPaid
        ? await unpayExpense(token, expense.id)
        : await payExpense(token, expense.id, {
            paidDate: getTodayApiDate(),
            paidAmount: expense.amount
          });

      setExpenses((current) =>
        current.map((item) => (item.id === updatedExpense.id ? updatedExpense : item))
      );

      void syncExpenseNotifications(token).catch(() => undefined);

      showUndoFeedback(
        wasPaid ? "Pagamento desmarcado." : "Despesa marcada como paga.",
        async () => {
          try {
            const revertedExpense =
              wasPaid && originalPaidDate
                ? await payExpense(token, expense.id, {
                    paidDate: originalPaidDate.slice(0, 10),
                    paidAmount: originalPaidAmount ?? expense.amount
                  })
                : await unpayExpense(token, expense.id);

            setExpenses((current) =>
              current.map((item) => (item.id === revertedExpense.id ? revertedExpense : item))
            );

            void syncExpenseNotifications(token).catch(() => undefined);
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              await signOut();

              return;
            }

            Alert.alert(
              "Não foi possível desfazer",
              getApiErrorMessage(error, "Não foi possível restaurar o pagamento.")
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
        getApiErrorMessage(error, "Não foi possível alterar o pagamento da despesa.")
      );
    }
  }

  function handleDeleteRequest(expense: Expense): void {
    if (expense.recurrenceId) {
      Alert.alert("Excluir despesa recorrente", "Onde deseja aplicar a exclusão?", [
        {
          text: "Somente esta despesa",
          style: "destructive",
          onPress: () => {
            void scheduleDelete(expense, "single");
          }
        },
        {
          text: "Esta e as próximas",
          style: "destructive",
          onPress: () => {
            void scheduleDelete(expense, "future");
          }
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]);

      return;
    }

    void scheduleDelete(expense, "single");
  }

  async function scheduleDelete(expense: Expense, scope: DeleteScope): Promise<void> {
    if (!token) {
      return;
    }

    await prepareForNewUndoAction();

    setExpenses((current) => current.filter((item) => item.id !== expense.id));

    pendingDeleteRef.current = {
      commit: async () => {
        try {
          if (scope === "future") {
            await deleteFutureExpenses(token, expense.id);
          } else {
            await deleteExpense(token, expense.id);
          }

          void syncExpenseNotifications(token).catch(() => undefined);
        } catch (error) {
          restoreExpense(expense);

          if (error instanceof ApiError && error.status === 401) {
            await signOut();

            return;
          }

          Alert.alert(
            "Não foi possível excluir",
            getApiErrorMessage(error, "A despesa foi restaurada.")
          );
        }
      }
    };

    showUndoFeedback(
      scope === "future"
        ? "Despesa e próximas removidas."
        : expense.installmentPlanId
          ? "Parcela removida."
          : "Despesa removida.",
      async () => {
        restoreExpense(expense);
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
            <ExpensesHeader />

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

            <ExpenseFilterTabs value={filter} onChange={setFilter} />

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
                    void loadExpenses();
                  }}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}

            {state === "ready" && (
              <View style={styles.listContainer}>
                <ExpenseListCard
                  expenses={filteredExpenses}
                  onExpensePress={(expense) => {
                    router.push({
                      pathname: "/expenses/[id]",
                      params: {
                        id: expense.id
                      }
                    });
                  }}
                  onTogglePayment={(expense) => {
                    void handleTogglePayment(expense);
                  }}
                  onDeleteExpense={handleDeleteRequest}
                />
              </View>
            )}
          </ScrollView>

          <AddExpenseButton
            bottom={floatingActionBottom}
            onPress={() => {
              router.push({
                pathname: "/expenses/new",
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
    paddingTop: 20,
    paddingBottom: 155
  },

  monthContainer: {
    marginTop: 20,
    marginBottom: 16
  },

  listContainer: {
    marginTop: 15
  },

  loadingContainer: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center"
  },

  errorCard: {
    alignItems: "center",
    marginTop: 15,
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
  }
});
