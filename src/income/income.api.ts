import type { Income } from "@/income/income.types";
import { apiRequest } from "@/lib/api";

export function getIncomes(token: string, competence: string): Promise<Income[]> {
  const params = new URLSearchParams({
    competence
  });

  return apiRequest<Income[]>(`/incomes?${params.toString()}`, {
    token
  });
}

export function getIncome(token: string, incomeId: string): Promise<Income> {
  return apiRequest<Income>(`/incomes/${incomeId}`, {
    token
  });
}
