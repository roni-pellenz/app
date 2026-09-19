import { router, useLocalSearchParams } from "expo-router";
import { ExpenseFormScreen } from "@/components/expenses/expense-form-screen";
import { getCurrentCompetence } from "@/lib/format";

export default function NewExpenseScreen() {
  const params = useLocalSearchParams<{
    competence?: string;
  }>();

  const competence =
    typeof params.competence === "string" ? params.competence : getCurrentCompetence();

  return (
    <ExpenseFormScreen
      mode="create"
      competence={competence}
      onCancel={() => {
        router.back();
      }}
      onSaved={() => {
        router.back();
      }}
    />
  );
}
