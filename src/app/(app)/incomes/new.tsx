import { router, useLocalSearchParams } from "expo-router";
import { IncomeFormScreen } from "@/components/incomes/income-form-screen";
import { getCurrentCompetence } from "@/lib/format";

export default function NewIncomeScreen() {
  const params = useLocalSearchParams<{
    competence?: string;
  }>();

  const competence =
    typeof params.competence === "string" ? params.competence : getCurrentCompetence();

  return (
    <IncomeFormScreen
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
