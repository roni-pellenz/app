export type IncomeRecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export type IncomeRecurrenceDetail = {
  id: string;
  name: string;
  amount: number;
  frequency: IncomeRecurrenceFrequency;
  receiptDay: number;
  startCompetence: string;
  endCompetence: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
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

export type IncomeDetail = Income & {
  recurrence: IncomeRecurrenceDetail | null;
};

export type IncomeFilter = "all" | "recurring" | "one-off";

export type CreateIncomeInput = {
  name: string;
  amount: number;
  competence: string;
  expectedDate: string;
};

export type CreateRecurringIncomeInput = {
  name: string;
  amount: number;
  receiptDay: number;
  startCompetence: string;
  endCompetence?: string;
};

export type UpdateIncomeInput = {
  name?: string;
  amount?: number;
  competence?: string;
  expectedDate?: string;
};

export type UpdateRecurringIncomeInput = {
  name?: string;
  amount?: number;
  receiptDay?: number;
  endCompetence?: string | null;
};

export type ReceiveIncomeInput = {
  receivedDate: string;
};
