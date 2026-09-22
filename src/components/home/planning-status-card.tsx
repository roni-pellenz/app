import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatMoney } from "@/lib/format";
import type { MonthlyPlanning } from "@/planning/planning.types";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type PlanningStatusCardProps = {
  planning: MonthlyPlanning;
};

type PlanningStatus = {
  icon: IoniconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
};

export function PlanningStatusCard({ planning }: PlanningStatusCardProps) {
  const status = getPlanningStatus(planning);

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: status.iconBackground
          }
        ]}
      >
        <Ionicons name={status.icon} size={23} color={status.iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{status.title}</Text>

        <Text style={styles.description}>{status.description}</Text>
      </View>
    </View>
  );
}

function getPlanningStatus(planning: MonthlyPlanning): PlanningStatus {
  const hasPlanning = planning.incomes.totalCount > 0 || planning.expenses.totalCount > 0;

  if (!hasPlanning) {
    return {
      icon: "calendar-outline",
      iconColor: theme.colors.primary,
      iconBackground: theme.colors.primarySoft,
      title: "Comece seu planejamento",
      description: "Cadastre receitas e despesas para acompanhar este mês."
    };
  }

  const plannedBalance = planning.balance.plannedAmount;

  if (plannedBalance < 0) {
    return {
      icon: "alert-circle-outline",
      iconColor: theme.colors.danger,
      iconBackground: theme.colors.dangerSoft,
      title: "Atenção ao planejamento",
      description: `As despesas previstas superam as receitas em ${formatMoney(
        Math.abs(plannedBalance)
      )} neste mês.`
    };
  }

  if (plannedBalance === 0) {
    return {
      icon: "checkmark-circle-outline",
      iconColor: theme.colors.warning,
      iconBackground: theme.colors.warningSoft,
      title: "Planejamento equilibrado",
      description: "As receitas previstas cobrem exatamente as despesas deste mês."
    };
  }

  return {
    icon: "checkmark-circle-outline",
    iconColor: theme.colors.success,
    iconBackground: theme.colors.successSoft,
    title: "Planejamento positivo",
    description: `Seu planejamento prevê ${formatMoney(plannedBalance)} disponíveis neste mês.`
  };
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  iconContainer: {
    width: 41,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14
  },

  content: {
    flex: 1,
    marginLeft: 12
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text
  },

  description: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: theme.colors.textSecondary
  }
});
