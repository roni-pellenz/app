import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { MonthlyPlanning, PlanningExpense } from "@/planning/planning.types";
import { theme } from "@/theme/theme";

type MetricCardProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  value: number;
  label: string;
  iconColor: string;
  iconBackground: string;
};

type HomeMetricsGridProps = {
  planning: MonthlyPlanning;
};

export function HomeMetricsGrid({ planning }: HomeMetricsGridProps) {
  const installmentCount = planning.items.expenses.filter(
    (expense) => expense.installmentNumber !== null
  ).length;

  const upcomingCount = countUpcomingExpenses(planning.items.expenses);

  return (
    <View style={styles.grid}>
      <MetricCard
        icon="arrow-down-outline"
        value={planning.expenses.paidCount}
        label="Pagas"
        iconColor={theme.colors.success}
        iconBackground={theme.colors.successSoft}
      />

      <MetricCard
        icon="arrow-up-outline"
        value={planning.expenses.pendingCount}
        label="Pendentes"
        iconColor={theme.colors.danger}
        iconBackground={theme.colors.dangerSoft}
      />

      <MetricCard
        icon="calendar-outline"
        value={installmentCount}
        label="Parcela"
        iconColor={theme.colors.primary}
        iconBackground={theme.colors.primarySoft}
      />

      <MetricCard
        icon="star-outline"
        value={upcomingCount}
        label="Próximos vencimentos"
        iconColor={theme.colors.warning}
        iconBackground={theme.colors.warningSoft}
      />
    </View>
  );
}

function MetricCard({ icon, value, label, iconColor, iconBackground }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBackground
          }
        ]}
      >
        <Ionicons name={icon} size={23} color={iconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.value}>{value}</Text>

        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function countUpcomingExpenses(expenses: PlanningExpense[]): number {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);

  limit.setDate(limit.getDate() + 7);

  return expenses.filter((expense) => {
    if (expense.paidDate) {
      return false;
    }

    const [year, month, day] = expense.dueDate.slice(0, 10).split("-").map(Number);

    if (!year || !month || !day) {
      return false;
    }

    const dueDate = new Date(year, month - 1, day);

    return dueDate >= today && dueDate <= limit;
  }).length;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13
  },

  card: {
    width: "47.8%",
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11
  },

  value: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
    color: theme.colors.text
  },

  label: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: theme.colors.textSecondary
  }
});
