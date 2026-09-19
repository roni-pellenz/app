import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ExpenseCategory } from "@/expense/expense.types";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type ExpenseAppearance = {
  icon: IoniconName;
  color: string;
  backgroundColor: string;
};

export type ExpenseCategoryOption = ExpenseAppearance & {
  value: ExpenseCategory;
  label: string;
};

export const EXPENSE_CATEGORY_OPTIONS: readonly ExpenseCategoryOption[] = [
  {
    value: "HOUSING",
    label: "Moradia",
    icon: "home-outline",
    color: "#FF3E55",
    backgroundColor: "#FFE9ED"
  },
  {
    value: "FOOD",
    label: "Alimentação",
    icon: "restaurant-outline",
    color: "#F28A00",
    backgroundColor: "#FFF1DB"
  },
  {
    value: "TRANSPORT",
    label: "Transporte",
    icon: "car-outline",
    color: "#1769F5",
    backgroundColor: "#E8F1FF"
  },
  {
    value: "HEALTH",
    label: "Saúde",
    icon: "medkit-outline",
    color: "#E83D61",
    backgroundColor: "#FFE8EE"
  },
  {
    value: "EDUCATION",
    label: "Educação",
    icon: "school-outline",
    color: "#6533E8",
    backgroundColor: "#EEE9FF"
  },
  {
    value: "LEISURE",
    label: "Lazer",
    icon: "game-controller-outline",
    color: "#7A45E5",
    backgroundColor: "#F0EAFF"
  },
  {
    value: "SUBSCRIPTIONS",
    label: "Assinaturas",
    icon: "repeat-outline",
    color: "#1769F5",
    backgroundColor: "#E8F1FF"
  },
  {
    value: "UTILITIES",
    label: "Contas e serviços",
    icon: "flash-outline",
    color: "#F5A400",
    backgroundColor: "#FFF4D8"
  },
  {
    value: "ELECTRONICS",
    label: "Eletrônicos",
    icon: "hardware-chip-outline",
    color: "#5364D9",
    backgroundColor: "#EBEDFF"
  },
  {
    value: "SHOPPING",
    label: "Compras",
    icon: "bag-handle-outline",
    color: "#D94790",
    backgroundColor: "#FFE9F4"
  },
  {
    value: "TAXES",
    label: "Impostos",
    icon: "document-text-outline",
    color: "#C66B00",
    backgroundColor: "#FFF0DF"
  },
  {
    value: "FINANCIAL",
    label: "Financeiro",
    icon: "wallet-outline",
    color: theme.colors.success,
    backgroundColor: theme.colors.successSoft
  },
  {
    value: "OTHER",
    label: "Outros",
    icon: "receipt-outline",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  }
];

export function getExpenseCategoryOption(
  category: ExpenseCategory
): ExpenseCategoryOption | undefined {
  return EXPENSE_CATEGORY_OPTIONS.find((option) => option.value === category);
}

export function getExpenseCategoryLabel(category: ExpenseCategory | null): string {
  if (!category) {
    return "Não definida";
  }

  return getExpenseCategoryOption(category)?.label ?? "Outros";
}

export function getExpenseAppearance(
  name: string,
  category: ExpenseCategory | null = null
): ExpenseAppearance {
  if (category) {
    const categoryOption = getExpenseCategoryOption(category);

    if (categoryOption) {
      return {
        icon: categoryOption.icon,
        color: categoryOption.color,
        backgroundColor: categoryOption.backgroundColor
      };
    }
  }

  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("aluguel")) {
    return {
      icon: "home",
      color: "#FF3E55",
      backgroundColor: "#FFE9ED"
    };
  }

  if (normalized.includes("internet") || normalized.includes("wifi")) {
    return {
      icon: "wifi",
      color: "#1769F5",
      backgroundColor: "#EBE9FF"
    };
  }

  if (normalized.includes("academia")) {
    return {
      icon: "barbell",
      color: "#6533E8",
      backgroundColor: "#EEE9FF"
    };
  }

  if (normalized.includes("condominio")) {
    return {
      icon: "business",
      color: "#1E7CE7",
      backgroundColor: "#E8F4FF"
    };
  }

  if (normalized.includes("energia") || normalized.includes("luz")) {
    return {
      icon: "flash",
      color: "#F5A400",
      backgroundColor: "#FFF4D8"
    };
  }

  if (
    normalized.includes("stream") ||
    normalized.includes("netflix") ||
    normalized.includes("youtube")
  ) {
    return {
      icon: "play",
      color: "#FF253D",
      backgroundColor: "#FFE8ED"
    };
  }

  if (normalized.includes("tv") || normalized.includes("televisao")) {
    return {
      icon: "tv-outline",
      color: "#6533E8",
      backgroundColor: "#EEE9FF"
    };
  }

  if (normalized.includes("agua")) {
    return {
      icon: "water",
      color: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft
    };
  }

  if (normalized.includes("telefone") || normalized.includes("celular")) {
    return {
      icon: "phone-portrait-outline",
      color: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft
    };
  }

  return {
    icon: "receipt-outline",
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  };
}
