const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export function formatMoney(amountInCents: number): string {
  return currencyFormatter.format(amountInCents / 100);
}

export function formatCompetence(competence: string): string {
  const [yearValue, monthValue] = competence.split("-");

  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return competence;
  }

  return `${monthNames[month - 1]} de ${year}`;
}

export function getCurrentCompetence(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function shiftCompetence(competence: string, offset: number): string {
  const [yearValue, monthValue] = competence.split("-");

  const year = Number(yearValue);
  const month = Number(monthValue);

  const date = new Date(year, month - 1 + offset, 1);

  const nextYear = date.getFullYear();

  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${nextYear}-${nextMonth}`;
}
