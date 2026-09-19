import type {
  CreateExpenseInput,
  CreateInstallmentExpenseInput,
  CreateRecurringExpenseInput,
  Expense,
  ExpenseDetail,
  UpdateExpenseInput,
  UpdateInstallmentPlanInput,
  UpdateRecurringExpenseInput
} from "@/expense/expense.types";
import { apiRequest } from "@/lib/api";

type PayExpenseInput = {
  paidDate: string;
  paidAmount?: number;
};

type DeleteExpenseResponse = {
  success: true;
};

export function getExpenses(token: string, competence: string): Promise<Expense[]> {
  const params = new URLSearchParams({
    competence
  });

  return apiRequest<Expense[]>(`/expenses?${params.toString()}`, {
    token
  });
}

export function getExpense(token: string, expenseId: string): Promise<ExpenseDetail> {
  return apiRequest<ExpenseDetail>(`/expenses/${expenseId}`, {
    token
  });
}

export function createExpense(token: string, input: CreateExpenseInput): Promise<Expense> {
  return apiRequest<Expense>("/expenses", {
    method: "POST",
    token,
    body: input
  });
}

export function createRecurringExpense(
  token: string,
  input: CreateRecurringExpenseInput
): Promise<unknown> {
  return apiRequest("/expenses/recurring", {
    method: "POST",
    token,
    body: input
  });
}

export function createInstallmentExpense(
  token: string,
  input: CreateInstallmentExpenseInput
): Promise<unknown> {
  return apiRequest("/expenses/installments", {
    method: "POST",
    token,
    body: input
  });
}

export function payExpense(
  token: string,
  expenseId: string,
  input: PayExpenseInput
): Promise<Expense> {
  return apiRequest<Expense>(`/expenses/${expenseId}/payment`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function unpayExpense(token: string, expenseId: string): Promise<Expense> {
  return apiRequest<Expense>(`/expenses/${expenseId}/payment`, {
    method: "DELETE",
    token
  });
}

export function updateExpense(
  token: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Expense> {
  return apiRequest<Expense>(`/expenses/${expenseId}`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function updateRecurringExpense(
  token: string,
  expenseId: string,
  input: UpdateRecurringExpenseInput
): Promise<unknown> {
  return apiRequest(`/expenses/${expenseId}/future`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function updateInstallmentPlan(
  token: string,
  expenseId: string,
  input: UpdateInstallmentPlanInput
): Promise<unknown> {
  return apiRequest(`/expenses/${expenseId}/installment-plan`, {
    method: "PATCH",
    token,
    body: input
  });
}

export function deleteExpense(token: string, expenseId: string): Promise<DeleteExpenseResponse> {
  return apiRequest<DeleteExpenseResponse>(`/expenses/${expenseId}`, {
    method: "DELETE",
    token
  });
}

export function deleteFutureExpenses(
  token: string,
  expenseId: string
): Promise<DeleteExpenseResponse> {
  return apiRequest<DeleteExpenseResponse>(`/expenses/${expenseId}/future`, {
    method: "DELETE",
    token
  });
}
