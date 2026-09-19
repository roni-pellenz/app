export type PlanningIncomeSummary = {
  plannedAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  totalCount: number;
  receivedCount: number;
  pendingCount: number;
};

export type PlanningExpenseSummary = {
  plannedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  varianceAmount: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
};

export type PlanningBalance = {
  plannedAmount: number;
  realizedAmount: number;
  pendingIncomeAmount: number;
  pendingExpenseAmount: number;
};

export type PlanningIncome = {
  id: string;
  recurrenceId: string | null;
  name: string;
  amount: number;
  competence: string;
  expectedDate: string;
  receivedDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanningExpense = {
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

export type MonthlyPlanning = {
  competence: string;

  incomes: PlanningIncomeSummary;

  expenses: PlanningExpenseSummary;

  balance: PlanningBalance;

  items: {
    incomes: PlanningIncome[];
    expenses: PlanningExpense[];
  };
};
