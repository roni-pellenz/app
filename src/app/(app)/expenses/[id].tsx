import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { ExpenseDetailRow } from "@/components/expenses/expense-detail-row";
import { getExpense } from "@/expense/expense.api";
import { getExpenseAppearance } from "@/expense/expense.appearance";
import type { ExpenseDetail, ExpenseRecurrenceFrequency } from "@/expense/expense.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { formatCompetence, formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

export default function ExpenseDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const { token, signOut } = useAuth();

  const [expense, setExpense] = useState<ExpenseDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadExpense = useCallback(async (): Promise<void> => {
    if (!token || !params.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getExpense(token, params.id);

      setExpense(result);
    } catch (currentError) {
      if (currentError instanceof ApiError && currentError.status === 401) {
        await signOut();

        return;
      }

      setError(getApiErrorMessage(currentError, "Não foi possível carregar a despesa."));
    } finally {
      setLoading(false);
    }
  }, [token, params.id, signOut]);

  useFocusEffect(
    useCallback(() => {
      void loadExpense();
    }, [loadExpense])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "Despesa não encontrada."}</Text>

          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.link}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentExpense = expense;

  const appearance = getExpenseAppearance(currentExpense.name);

  const typeLabel = currentExpense.installmentPlan
    ? "Despesa parcelada"
    : currentExpense.recurrence
      ? "Despesa recorrente"
      : "Despesa pontual";

  function handleEdit(): void {
    router.push({
      pathname: "/expenses/edit/[id]",
      params: {
        id: currentExpense.id
      }
    });
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
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={27} color={theme.colors.primary} />

              <Text style={styles.navButtonText}>Voltar</Text>
            </Pressable>

            <Pressable onPress={handleEdit}>
              <Text style={styles.editText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <View
              style={[
                styles.icon,
                {
                  backgroundColor: appearance.backgroundColor
                }
              ]}
            >
              <Ionicons name={appearance.icon} size={42} color={appearance.color} />
            </View>

            <Text style={styles.name}>{currentExpense.name}</Text>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{typeLabel}</Text>
            </View>

            <Text style={styles.amount}>{formatMoney(currentExpense.amount)}</Text>
          </View>

          {currentExpense.recurrence ? (
            <RecurringExpenseDetails expense={currentExpense} />
          ) : currentExpense.installmentPlan ? (
            <InstallmentExpenseDetails expense={currentExpense} />
          ) : (
            <OneOffExpenseDetails expense={currentExpense} />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function RecurringExpenseDetails({ expense }: { expense: ExpenseDetail }) {
  const recurrence = expense.recurrence;

  if (!recurrence) {
    return null;
  }

  return (
    <View style={styles.detailCard}>
      <ExpenseDetailRow
        icon="calendar-outline"
        label="Vencimento"
        value={`Dia ${formatDayFromDate(expense.dueDate)}`}
      />

      <ExpenseDetailRow
        icon="card-outline"
        label="Pagamento"
        value={
          expense.plannedPaymentDate
            ? `Dia ${formatDayFromDate(expense.plannedPaymentDate)}`
            : "Não definido"
        }
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Competência"
        value="Mesmo mês do vencimento"
      />

      <ExpenseDetailRow
        icon="sync-outline"
        label="Frequência"
        value={formatFrequency(recurrence.frequency)}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Repetir até"
        value={
          recurrence.endCompetence
            ? formatCompetence(recurrence.endCompetence.slice(0, 7))
            : "Sem data final"
        }
        divider={false}
      />
    </View>
  );
}

function InstallmentExpenseDetails({ expense }: { expense: ExpenseDetail }) {
  const plan = expense.installmentPlan;

  if (!plan) {
    return null;
  }

  return (
    <View style={styles.detailCard}>
      <ExpenseDetailRow
        icon="calendar-outline"
        label="Vencimento"
        value={formatDate(expense.dueDate)}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Competência"
        value={formatCompetence(expense.competence.slice(0, 7))}
      />

      <ExpenseDetailRow
        icon="layers-outline"
        label="Parcela"
        value={
          expense.installmentNumber
            ? `${expense.installmentNumber} de ${plan.installments}`
            : `${plan.installments} parcelas`
        }
      />

      <ExpenseDetailRow
        icon="wallet-outline"
        label="Valor total"
        value={formatMoney(plan.totalAmount)}
      />

      <ExpenseDetailRow
        icon="bag-handle-outline"
        label="Data da compra"
        value={formatDate(plan.purchaseDate)}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Primeira parcela"
        value={formatDate(plan.firstInstallmentDate)}
        divider={false}
      />
    </View>
  );
}

function OneOffExpenseDetails({ expense }: { expense: ExpenseDetail }) {
  return (
    <View style={styles.detailCard}>
      <ExpenseDetailRow
        icon="calendar-outline"
        label="Vencimento"
        value={formatDate(expense.dueDate)}
      />

      <ExpenseDetailRow
        icon="card-outline"
        label="Pagamento"
        value={expense.plannedPaymentDate ? formatDate(expense.plannedPaymentDate) : "Não definido"}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Competência"
        value={formatCompetence(expense.competence.slice(0, 7))}
      />

      <ExpenseDetailRow icon="document-text-outline" label="Tipo" value="Pontual" divider={false} />
    </View>
  );
}

function formatDayFromDate(value: string): string {
  const day = value.slice(8, 10);

  return day || "--";
}

function formatDate(value: string): string {
  const datePart = value.slice(0, 10);

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatFrequency(frequency: ExpenseRecurrenceFrequency): string {
  switch (frequency) {
    case "WEEKLY":
      return "Semanal";

    case "YEARLY":
      return "Anual";

    case "MONTHLY":
    default:
      return "Mensal";
  }
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36
  },

  navigation: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  navButton: {
    flexDirection: "row",
    alignItems: "center"
  },

  navButtonText: {
    marginLeft: -3,
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.primary
  },

  editText: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.primary
  },

  hero: {
    alignItems: "center",
    marginTop: 22
  },

  icon: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22
  },

  name: {
    marginTop: 12,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: theme.colors.text
  },

  typeBadge: {
    marginTop: 7,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: theme.colors.primarySoft
  },

  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#526D94"
  },

  amount: {
    marginTop: 17,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#07143A"
  },

  detailCard: {
    overflow: "hidden",
    marginTop: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)"
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },

  errorText: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  link: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary
  }
});
