import type {
  CreateIncomeInput,
  CreateRecurringIncomeInput,
  Income,
  IncomeDetail,
  UpdateIncomeInput,
  UpdateRecurringIncomeInput
} from "@/income/income.types";
import { apiRequest } from "@/lib/api";

export function getIncomes(token: string, competence: string): Promise<Income[]> {
  const params = new URLSearchParams({
    competence
  });

  return apiRequest<Income[]>(`/incomes?${params.toString()}`, {
    token
  });
}

export function getIncome(token: string, incomeId: string): Promise<IncomeDetail> {
  return apiRequest<IncomeDetail>(`/incomes/${incomeId}`, {
    token
  });
}

export function createIncome(token: string, input: CreateIncomeInput): Promise<Income> {
  return apiRequest<Income>("/incomes", {
    method: "POST",
    token,
    body: input
  });
}

export function createRecurringIncome(
  token: string,
  input: CreateRecurringIncomeInput
): Promise<unknown> {
  return apiRequest("/incomes/recurring", {
    method: "POST",
    token,
    body: input
  });
}

export function updateIncome(
  token: string,
  incomeId: string,
  input: UpdateIncomeInput
): Promise<Income> {
  return apiRequest<Income>(`/incomes/${incomeId}`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function updateRecurringIncome(
  token: string,
  incomeId: string,
  input: UpdateRecurringIncomeInput
): Promise<unknown> {
  return apiRequest(`/incomes/${incomeId}/future`, {
    method: "PATCH",
    token,
    body: input
  });
}
