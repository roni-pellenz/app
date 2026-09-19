export type ExpenseRecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export type ExpenseRecurrenceDetail = {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseRecurrenceFrequency;
  dueDay: number;
  plannedPaymentDay: number | null;
  startCompetence: string;
  endCompetence: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstallmentPlanDetail = {
  id: string;
  name: string;
  totalAmount: number;
  installments: number;
  purchaseDate: string;
  firstInstallmentDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  recurrenceId: string | null;
  installmentPlanId: string | null;
  installmentNumber: number | null;
  name: string;
  amount: number;
  competence: string;
  dueDate: string;
  plannedPaymentDate: string | null;
  paidDate: string | null;
  paidAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseDetail = Expense & {
  recurrence: ExpenseRecurrenceDetail | null;
  installmentPlan: InstallmentPlanDetail | null;
};

export type ExpenseFilter = "all" | "recurring" | "installment" | "one-off";

export type CreateExpenseInput = {
  name: string;
  amount: number;
  competence: string;
  dueDate: string;
  plannedPaymentDate?: string;
};

export type CreateRecurringExpenseInput = {
  name: string;
  amount: number;
  dueDay: number;
  plannedPaymentDay?: number;
  startCompetence: string;
  endCompetence?: string;
};

export type CreateInstallmentExpenseInput = {
  name: string;
  totalAmount: number;
  installments: number;
  purchaseDate: string;
  firstInstallmentDate: string;
};

export type UpdateExpenseInput = {
  name?: string;
  amount?: number;
  competence?: string;
  dueDate?: string;
  plannedPaymentDate?: string | null;
};

export type UpdateRecurringExpenseInput = {
  name?: string;
  amount?: number;
  dueDay?: number;
  plannedPaymentDay?: number | null;
  endCompetence?: string | null;
};

export type UpdateInstallmentPlanInput = {
  name?: string;
  totalAmount?: number;
  installments?: number;
  purchaseDate?: string;
  firstInstallmentDate?: string;
};
