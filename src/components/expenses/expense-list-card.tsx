import { StyleSheet, Text, View } from "react-native";
import { ExpenseRow } from "@/components/expenses/expense-row";
import type { Expense } from "@/expense/expense.types";

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

const styles = StyleSheet.create({
  list: {
    gap: 12
  },

  emptyCard: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    paddingHorizontal: 30,
    backgroundColor: "#FFFFFF"
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1437"
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#62759B"
  }
});
