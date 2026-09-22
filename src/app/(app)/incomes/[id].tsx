import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { ExpenseDetailRow } from "@/components/expenses/expense-detail-row";
import { getIncome } from "@/income/income.api";
import type { IncomeDetail, IncomeRecurrenceFrequency } from "@/income/income.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { formatCompetence, formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type IncomeStatus = {
  label: string;
  icon: IoniconName;
};

export default function IncomeDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const { token, signOut } = useAuth();

  const [income, setIncome] = useState<IncomeDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadIncome = useCallback(async (): Promise<void> => {
    if (!token || !params.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getIncome(token, params.id);

      setIncome(result);
    } catch (currentError) {
      if (currentError instanceof ApiError && currentError.status === 401) {
        await signOut();

        return;
      }

      setError(getApiErrorMessage(currentError, "Não foi possível carregar a receita."));
    } finally {
      setLoading(false);
    }
  }, [token, params.id, signOut]);

  useFocusEffect(
    useCallback(() => {
      void loadIncome();
    }, [loadIncome])
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

  if (!income) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "Receita não encontrada."}</Text>

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

  const currentIncome = income;

  const recurring = currentIncome.recurrence !== null;

  function handleEdit(): void {
    router.push({
      pathname: "/incomes/edit/[id]",
      params: {
        id: currentIncome.id
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
            <View style={[styles.icon, recurring ? styles.recurringIcon : styles.oneOffIcon]}>
              <Ionicons
                name={recurring ? "briefcase-outline" : "star-outline"}
                size={40}
                color={recurring ? "#F28A00" : "#EFA500"}
              />
            </View>

            <Text style={styles.name}>{currentIncome.name}</Text>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {recurring ? "Receita recorrente" : "Receita pontual"}
              </Text>
            </View>

            <Text style={[styles.amount, currentIncome.receivedDate && styles.receivedAmount]}>
              {formatMoney(currentIncome.amount)}
            </Text>
          </View>

          {currentIncome.recurrence ? (
            <RecurringIncomeDetails income={currentIncome} />
          ) : (
            <OneOffIncomeDetails income={currentIncome} />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function RecurringIncomeDetails({ income }: { income: IncomeDetail }) {
  const recurrence = income.recurrence;

  if (!recurrence) {
    return null;
  }

  const status = getIncomeStatus(income);

  return (
    <View style={styles.detailCard}>
      <ExpenseDetailRow
        icon="calendar-outline"
        label="Recebimento previsto"
        value={formatDate(income.expectedDate)}
      />

      <ExpenseDetailRow
        icon="repeat-outline"
        label="Dia da recorrência"
        value={`Dia ${recurrence.receiptDay}`}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Competência"
        value={formatCompetence(income.competence.slice(0, 7))}
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
      />

      <ExpenseDetailRow icon={status.icon} label="Status" value={status.label} />

      <ExpenseDetailRow
        icon="cash-outline"
        label="Recebida em"
        value={income.receivedDate ? formatDate(income.receivedDate) : "Ainda não recebida"}
        divider={false}
      />
    </View>
  );
}

function OneOffIncomeDetails({ income }: { income: IncomeDetail }) {
  const status = getIncomeStatus(income);

  return (
    <View style={styles.detailCard}>
      <ExpenseDetailRow
        icon="calendar-outline"
        label="Recebimento previsto"
        value={formatDate(income.expectedDate)}
      />

      <ExpenseDetailRow
        icon="calendar-outline"
        label="Competência"
        value={formatCompetence(income.competence.slice(0, 7))}
      />

      <ExpenseDetailRow icon="document-text-outline" label="Tipo" value="Pontual" />

      <ExpenseDetailRow icon={status.icon} label="Status" value={status.label} />

      <ExpenseDetailRow
        icon="cash-outline"
        label="Recebida em"
        value={income.receivedDate ? formatDate(income.receivedDate) : "Ainda não recebida"}
        divider={false}
      />
    </View>
  );
}

function getIncomeStatus(income: IncomeDetail): IncomeStatus {
  if (income.receivedDate !== null) {
    return {
      label: "Recebida",
      icon: "checkmark-circle-outline"
    };
  }

  const expectedDate = income.expectedDate.slice(0, 10);

  const today = getTodayDateKey();

  if (expectedDate < today) {
    return {
      label: "Atrasada",
      icon: "alert-circle-outline"
    };
  }

  return {
    label: "A receber",
    icon: "time-outline"
  };
}

function getTodayDateKey(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatFrequency(frequency: IncomeRecurrenceFrequency): string {
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

  recurringIcon: {
    backgroundColor: "#FFF2DF"
  },

  oneOffIcon: {
    backgroundColor: "#FFF5D9"
  },

  name: {
    marginTop: 12,
    fontSize: 27,
    lineHeight: 32,
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: -0.8,
    color: theme.colors.text
  },

  typeBadge: {
    marginTop: 7,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: "#FFF2DF"
  },

  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A86400"
  },

  amount: {
    marginTop: 17,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#07143A"
  },

  receivedAmount: {
    color: theme.colors.success
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
