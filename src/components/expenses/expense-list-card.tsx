import { StyleSheet, Text, View } from "react-native";
import { ExpenseRow } from "@/components/expenses/expense-row";
import type { Expense } from "@/expense/expense.types";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type ExpenseListCardProps = {
  expenses: Expense[];
  onExpensePress: (expense: Expense) => void;
  onTogglePayment: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
};

export function ExpenseListCard({
  expenses,
  onExpensePress,
  onTogglePayment,
  onDeleteExpense
}: ExpenseListCardProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Nenhuma despesa</Text>

        <Text style={styles.emptyText}>Não há despesas para este filtro no mês selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          onPress={() => {
            onExpensePress(expense);
          }}
          onTogglePayment={() => {
            onTogglePayment(expense);
          }}
          onDelete={() => {
            onDeleteExpense(expense);
          }}
        />
      ))}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    list: {
      gap: 12
    },

    emptyCard: {
      minHeight: 150,
      alignItems: "center",
      justifyContent: "center",
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
