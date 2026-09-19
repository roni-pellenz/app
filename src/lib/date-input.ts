export type DateInputMode = "date" | "month-year";

export function formatDateForInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = String(date.getFullYear());

  return `${day}/${month}/${year}`;
}

export function formatMonthYearForInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = String(date.getFullYear());

  return `${month}/${year}`;
}

export function formatDateInputValue(date: Date, mode: DateInputMode): string {
  if (mode === "month-year") {
    return formatMonthYearForInput(date);
  }

  return formatDateForInput(date);
}

export function parseDateInputValue(value: string, mode: DateInputMode): Date | null {
  if (mode === "month-year") {
    const match = /^(\d{2})\/(\d{4})$/.exec(value.trim());

    if (!match) {
      return null;
    }

    const month = Number(match[1]);

    const year = Number(match[2]);

    if (month < 1 || month > 12) {
      return null;
    }

    return new Date(year, month - 1, 1);
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const day = Number(match[1]);

  const month = Number(match[2]);

  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function parseBrazilianDate(value: string): string | null {
  const date = parseDateInputValue(value, "date");

  if (!date) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseMonthYear(value: string): string | null {
  const date = parseDateInputValue(value, "month-year");

  if (!date) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}
