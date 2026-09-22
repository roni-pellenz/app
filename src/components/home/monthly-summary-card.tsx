import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { formatMoney } from "@/lib/format";
import type { MonthlyPlanning } from "@/planning/planning.types";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

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
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  const income = planning.incomes.plannedAmount;

  const expenses = planning.expenses.plannedAmount;

  const available = planning.balance.plannedAmount;

  const hasIncome = income > 0;

  const commitment = hasIncome ? Math.round((expenses / income) * 100) : null;

  const progress = commitment === null ? 0 : Math.max(0, Math.min(commitment, 100));

  const progressWidth = `${progress}%` as `${number}%`;

  const commitmentText =
    commitment === null ? "Sem receitas planejadas" : `${commitment}% comprometido`;

  const availableValueStyle =
    available < 0
      ? styles.availableValueNegative
      : available > 0
        ? styles.availableValuePositive
        : styles.availableValueNeutral;

  function showPlanningInfo(): void {
    Alert.alert(
      "Receitas e despesas planejadas",
      "O resumo considera os lançamentos da competência selecionada, independentemente da data em que a receita foi recebida ou a despesa foi paga.\n\nO valor disponível é a diferença entre as receitas e as despesas planejadas para o mês."
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumo do mês</Text>

      <View style={styles.valuesRow}>
        <Pressable
          onPress={onIncomePress}
          style={({ pressed }) => [
            styles.valueCard,
            styles.incomeCard,
            pressed && styles.valueCardPressed
          ]}
        >
          <Text style={styles.label}>Receitas</Text>

          <Text
            style={[styles.value, styles.incomeValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatMoney(income)}
          </Text>
        </Pressable>

        <Pressable
          onPress={onExpensePress}
          style={({ pressed }) => [
            styles.valueCard,
            styles.expenseCard,
            pressed && styles.valueCardPressed
          ]}
        >
          <Text style={styles.label}>Despesas</Text>

          <Text
            style={[styles.value, styles.expenseValue]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatMoney(expenses)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.availableCard}>
        <Text style={styles.availableLabel}>Disponível</Text>

        <Text
          style={[styles.availableValue, availableValueStyle]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {formatMoney(available)}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        {progress > 0 ? (
          <LinearGradient
            colors={[theme.colors.success, theme.colors.success]}
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
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{commitmentText}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explicar receitas e despesas planejadas"
          hitSlop={10}
          onPress={showPlanningInfo}
          style={({ pressed }) => [styles.infoButton, pressed && styles.infoButtonPressed]}
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      gap: 10
    },

    valueCard: {
      flex: 1,
      minWidth: 0,
      minHeight: 82,
      justifyContent: "center",
      borderRadius: 17,
      paddingHorizontal: 14,
      paddingVertical: 12
    },

    incomeCard: {
      backgroundColor: theme.colors.successSoft
    },

    expenseCard: {
      backgroundColor: theme.colors.dangerSoft
    },

    valueCardPressed: {
      opacity: 0.68
    },

    label: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
      color: theme.colors.textSecondary
    },

    value: {
      marginTop: 7,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "800",
      letterSpacing: -0.4
    },

    incomeValue: {
      color: theme.colors.success
    },

    expenseValue: {
      color: theme.colors.danger
    },

    availableCard: {
      minHeight: 86,
      justifyContent: "center",
      marginTop: 12,
      borderRadius: 18,
      paddingHorizontal: 17,
      paddingVertical: 13,
      backgroundColor: theme.colors.primarySoft
    },

    availableLabel: {
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600",
      color: theme.colors.textSecondary
    },

    availableValue: {
      marginTop: 3,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: "800",
      letterSpacing: -0.7
    },

    availableValueNegative: {
      color: theme.colors.danger
    },

    availableValuePositive: {
      color: theme.colors.success
    },

    availableValueNeutral: {
      color: theme.colors.primary
    },

    progressTrack: {
      height: 12,
      overflow: "hidden",
      marginTop: 15,
      borderRadius: 999,
      backgroundColor: theme.colors.progressTrack
    },

    progressFill: {
      height: "100%",
      borderRadius: 999
    },

    footer: {
      minHeight: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4
    },

    footerText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary
    },

    infoButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14
    },

    infoButtonPressed: {
      backgroundColor: theme.colors.surfaceMuted
    }
  });
}
