import { StyleSheet, Text, View } from "react-native";
import { ExpenseRow } from "@/components/expenses/expense-row";
import type { Expense } from "@/expense/expense.types";
import { theme } from "@/theme/theme";

type ExpenseListCardProps = {
  expenses: Expense[];
  onExpensePress: (expense: Expense) => void;
};

export function ExpenseListCard({ expenses, onExpensePress }: ExpenseListCardProps) {
  if (expenses.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Nenhuma despesa</Text>

        <Text style={styles.emptyText}>Não há despesas para este filtro no mês selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {expenses.map((expense, index) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          onPress={() => {
            onExpensePress(expense);
          }}
          showDivider={index < expenses.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  emptyCard: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
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
