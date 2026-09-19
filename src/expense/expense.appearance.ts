import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type ExpenseAppearance = {
  icon: IoniconName;
  color: string;
  backgroundColor: string;
};

export function getExpenseAppearance(name: string): ExpenseAppearance {
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
