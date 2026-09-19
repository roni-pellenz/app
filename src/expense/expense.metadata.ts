export type ExpenseNotificationOption = {
  value: number | null;
  label: string;
};

export const EXPENSE_NOTIFICATION_OPTIONS: readonly ExpenseNotificationOption[] = [
  {
    value: null,
    label: "Desativada"
  },
  {
    value: 0,
    label: "No dia do vencimento"
  },
  {
    value: 1,
    label: "1 dia antes"
  },
  {
    value: 2,
    label: "2 dias antes"
  },
  {
    value: 3,
    label: "3 dias antes"
  },
  {
    value: 5,
    label: "5 dias antes"
  },
  {
    value: 7,
    label: "7 dias antes"
  },
  {
    value: 10,
    label: "10 dias antes"
  },
  {
    value: 15,
    label: "15 dias antes"
  },
  {
    value: 30,
    label: "30 dias antes"
  }
];

export function formatExpenseNotification(daysBefore: number | null): string {
  if (daysBefore === null) {
    return "Desativada";
  }

  if (daysBefore === 0) {
    return "No dia do vencimento";
  }

  if (daysBefore === 1) {
    return "1 dia antes";
  }

  return `${daysBefore} dias antes`;
}
