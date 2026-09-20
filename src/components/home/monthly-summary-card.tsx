import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatMoney } from "@/lib/format";
import type { MonthlyPlanning } from "@/planning/planning.types";
import { theme } from "@/theme/theme";

type MonthlySummaryCardProps = {
  planning: MonthlyPlanning;
  onIncomePress: () => void;
  onExpensePress: () => void;
};

export function MonthlySummaryCard({
  planning,
  onIncomePress,
  onExpensePress
}: MonthlySummaryCardProps) {
  const income = planning.incomes.plannedAmount;

  const expenses = planning.expenses.plannedAmount;

  const available = planning.balance.plannedAmount;

  const hasIncome = income > 0;

  const commitment = hasIncome ? Math.round((expenses / income) * 100) : null;

  const progress = commitment === null ? 0 : Math.max(0, Math.min(commitment, 100));

  const progressWidth = `${progress}%` as `${number}%`;

  const commitmentText =
    commitment === null ? "Sem receitas planejadas" : `${commitment}% comprometido`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumo do mês</Text>

      <View style={styles.valuesRow}>
        <Pressable
          onPress={onIncomePress}
          style={({ pressed }) => [
            styles.valueColumn,
            styles.clickableColumn,
            pressed && styles.columnPressed
          ]}
        >
          <View style={styles.labelRow}>
            <Text style={styles.label}>Receitas</Text>

            <Ionicons name="chevron-forward" size={13} color={theme.colors.textMuted} />
          </View>

          <Text style={[styles.value, styles.incomeValue]} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(income)}
          </Text>
        </Pressable>

        <Pressable
          onPress={onExpensePress}
          style={({ pressed }) => [
            styles.valueColumn,
            styles.clickableColumn,
            pressed && styles.columnPressed
          ]}
        >
          <View style={styles.labelRow}>
            <Text style={styles.label}>Despesas</Text>

            <Ionicons name="chevron-forward" size={13} color={theme.colors.textMuted} />
          </View>

          <Text style={[styles.value, styles.expenseValue]} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(expenses)}
          </Text>
        </Pressable>

        <View style={[styles.valueColumn, styles.availableColumn]}>
          <Text style={styles.label}>Disponível</Text>

          <Text
            style={[styles.value, styles.availableValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatMoney(available)}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        {progress > 0 && (
          <LinearGradient
            colors={["#2BD49B", "#0DBD82"]}
            start={{
              x: 0,
              y: 0.5
            }}
            end={{
              x: 1,
              y: 0.5
            }}
            style={[
              styles.progressFill,
              {
                width: progressWidth
              }
            ]}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{commitmentText}</Text>

        <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 15,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  title: {
    marginBottom: 17,
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text
  },

  valuesRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 7
  },

  valueColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    paddingVertical: 8
  },

  clickableColumn: {
    borderRadius: 12,
    paddingHorizontal: 7
  },

  columnPressed: {
    backgroundColor: theme.colors.surfaceMuted
  },

  availableColumn: {
    borderRadius: 12,
    paddingHorizontal: 9,
    backgroundColor: theme.colors.primarySoft
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5
  },

  label: {
    fontSize: 10,
    color: theme.colors.textSecondary
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.25
  },

  incomeValue: {
    color: theme.colors.success
  },

  expenseValue: {
    color: theme.colors.danger
  },

  availableValue: {
    color: theme.colors.primary
  },

  progressTrack: {
    height: 12,
    overflow: "hidden",
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: theme.colors.progressTrack
  },

  progressFill: {
    height: "100%",
    borderRadius: 999
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9
  },

  footerText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary
  }
});
