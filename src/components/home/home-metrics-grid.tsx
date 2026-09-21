import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { HomeMetricsLayout } from "@/account/account-preferences.storage";
import type { MonthlyPlanning, PlanningExpense } from "@/planning/planning.types";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MetricProps = {
  icon: IoniconName;
  value: number;
  label: string;
  iconColor: string;
  iconBackground: string;
};

type DetailedMetricCardProps = MetricProps & {
  fullWidth?: boolean;
};

type CompactMetricProps = MetricProps & {
  showRightDivider?: boolean;
};

type HomeMetricsGridProps = {
  planning: MonthlyPlanning;
  showUpcomingExpenses?: boolean;
  layout?: HomeMetricsLayout;
};

export function HomeMetricsGrid({
  planning,
  showUpcomingExpenses = true,
  layout = "detailed"
}: HomeMetricsGridProps) {
  const installmentCount = planning.items.expenses.filter(
    (expense) => expense.installmentNumber !== null
  ).length;

  const upcomingCount = countUpcomingExpenses(planning.items.expenses);

  if (layout === "compact") {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactRow}>
          <CompactMetric
            icon="arrow-down-outline"
            value={planning.expenses.paidCount}
            label="Pagas"
            iconColor={theme.colors.success}
            iconBackground={theme.colors.successSoft}
            showRightDivider
          />

          <CompactMetric
            icon="arrow-up-outline"
            value={planning.expenses.pendingCount}
            label="Pendentes"
            iconColor={theme.colors.danger}
            iconBackground={theme.colors.dangerSoft}
          />
        </View>

        <View style={styles.compactHorizontalDivider} />

        <View style={styles.compactRow}>
          <CompactMetric
            icon="calendar-outline"
            value={installmentCount}
            label="Parcelas"
            iconColor={theme.colors.primary}
            iconBackground={theme.colors.primarySoft}
            showRightDivider={showUpcomingExpenses}
          />

          {showUpcomingExpenses ? (
            <CompactMetric
              icon="star-outline"
              value={upcomingCount}
              label="Próx. 7 dias"
              iconColor={theme.colors.warning}
              iconBackground={theme.colors.warningSoft}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <DetailedMetricCard
        icon="arrow-down-outline"
        value={planning.expenses.paidCount}
        label="Pagas"
        iconColor={theme.colors.success}
        iconBackground={theme.colors.successSoft}
      />

      <DetailedMetricCard
        icon="arrow-up-outline"
        value={planning.expenses.pendingCount}
        label="Pendentes"
        iconColor={theme.colors.danger}
        iconBackground={theme.colors.dangerSoft}
      />

      <DetailedMetricCard
        icon="calendar-outline"
        value={installmentCount}
        label="Parcelas"
        iconColor={theme.colors.primary}
        iconBackground={theme.colors.primarySoft}
        fullWidth={!showUpcomingExpenses}
      />

      {showUpcomingExpenses ? (
        <DetailedMetricCard
          icon="star-outline"
          value={upcomingCount}
          label="Próximos vencimentos"
          iconColor={theme.colors.warning}
          iconBackground={theme.colors.warningSoft}
        />
      ) : null}
    </View>
  );
}

function DetailedMetricCard({
  icon,
  value,
  label,
  iconColor,
  iconBackground,
  fullWidth = false
}: DetailedMetricCardProps) {
  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth]}>
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

function CompactMetric({
  icon,
  value,
  label,
  iconColor,
  iconBackground,
  showRightDivider = false
}: CompactMetricProps) {
  return (
    <View style={[styles.compactMetric, showRightDivider && styles.compactMetricRightDivider]}>
      <View
        style={[
          styles.compactIconContainer,
          {
            backgroundColor: iconBackground
          }
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.compactTextContainer}>
        <Text style={styles.compactValue}>{value}</Text>

        <Text style={styles.compactLabel} numberOfLines={1}>
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

  cardFullWidth: {
    width: "100%"
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
  },

  compactCard: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  compactRow: {
    flexDirection: "row"
  },

  compactMetric: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 10
  },

  compactMetricRightDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.colors.border
  },

  compactHorizontalDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 13,
    backgroundColor: theme.colors.border
  },

  compactIconContainer: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11
  },

  compactTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9
  },

  compactValue: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
    color: theme.colors.text
  },

  compactLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    color: theme.colors.textSecondary
  }
});
