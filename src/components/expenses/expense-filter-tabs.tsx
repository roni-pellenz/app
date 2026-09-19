import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ExpenseFilter } from "@/expense/expense.types";
import { theme } from "@/theme/theme";

type ExpenseFilterTabsProps = {
  value: ExpenseFilter;
  onChange: (value: ExpenseFilter) => void;
};

type FilterDefinition = {
  value: ExpenseFilter;
  label: string;
};

const filters: FilterDefinition[] = [
  {
    value: "all",
    label: "Todos"
  },
  {
    value: "recurring",
    label: "Recorrentes"
  },
  {
    value: "installment",
    label: "Parceladas"
  },
  {
    value: "one-off",
    label: "Pontuais"
  }
];

export function ExpenseFilterTabs({ value, onChange }: ExpenseFilterTabsProps) {
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            onPress={() => {
              onChange(filter.value);
            }}
            style={({ pressed }) => [
              styles.item,
              selected && styles.itemSelected,
              pressed && styles.itemPressed
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={[styles.label, selected && styles.labelSelected]}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8
  },

  item: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  itemSelected: {
    backgroundColor: theme.colors.primary
  },

  itemPressed: {
    opacity: 0.72
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },

  labelSelected: {
    fontWeight: "700",
    color: "#FFFFFF"
  }
});
