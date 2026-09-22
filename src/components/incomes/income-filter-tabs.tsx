import { Pressable, StyleSheet, Text, View } from "react-native";
import type { IncomeFilter } from "@/income/income.types";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type IncomeFilterTabsProps = {
  value: IncomeFilter;
  onChange: (value: IncomeFilter) => void;
};

type FilterDefinition = {
  value: IncomeFilter;
  label: string;
};

const filters: FilterDefinition[] = [
  {
    value: "all",
    label: "Todas"
  },
  {
    value: "recurring",
    label: "Recorrentes"
  },
  {
    value: "one-off",
    label: "Pontuais"
  }
];

export function IncomeFilterTabs({ value, onChange }: IncomeFilterTabsProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

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

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 10
    },

    item: {
      flex: 1,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 22,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    },

    itemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary
    },

    itemPressed: {
      opacity: 0.72
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary
    },

    labelSelected: {
      fontWeight: "700",
      color: theme.colors.onPrimary
    }
  });
}
