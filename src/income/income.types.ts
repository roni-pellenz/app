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

export type IncomeFilter = "all" | "recurring" | "one-off";
