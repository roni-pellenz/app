import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Expense } from "@/expense/expense.types";
import { getExpenseAppearance } from "@/expense/expense.appearance";
import { formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type ExpenseRowProps = {
  expense: Expense;
  showDivider: boolean;
  onPress: () => void;
};

export function ExpenseRow({ expense, showDivider, onPress }: ExpenseRowProps) {
  const appearance = getExpenseAppearance(expense.name);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: appearance.backgroundColor
          }
        ]}
      >
        <Ionicons name={appearance.icon} size={26} color={appearance.color} />
      </View>

      <View style={[styles.content, showDivider && styles.contentDivider]}>
        <View style={styles.textContent}>
          <Text style={styles.name} numberOfLines={1}>
            {expense.name}
          </Text>

          <Text style={styles.meta}>Vence em {formatDayMonth(expense.dueDate)}</Text>

          <Text style={styles.meta}>Competência: {formatShortCompetence(expense.competence)}</Text>
        </View>

        <View style={styles.rightContent}>
          <Text
            style={styles.amount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {formatMoney(expense.amount)}
          </Text>

          <Ionicons name="chevron-forward" size={20} color="#52719B" style={styles.chevron} />
        </View>
      </View>
    </Pressable>
  );
}

function formatDayMonth(value: string): string {
  const [, month, day] = value.slice(0, 10).split("-");

  if (!month || !day) {
    return value;
  }

  return `${day}/${month}`;
}

function formatShortCompetence(value: string): string {
  const [year, month] = value.slice(0, 7).split("-");

  const monthNumber = Number(month);

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ];

  if (!year || monthNumber < 1 || monthNumber > 12) {
    return value;
  }

  return `${months[monthNumber - 1]}/${year}`;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: "row",
    paddingLeft: 13
  },

  pressed: {
    opacity: 0.65
  },

  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 15
  },

  content: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 13,
    paddingRight: 13,
    paddingVertical: 10
  },

  contentDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border
  },

  textContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8
  },

  name: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text
  },

  meta: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "#526D94"
  },

  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 122
  },

  amount: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 19,
    textAlign: "right",
    fontWeight: "800",
    color: "#07143A"
  },

  chevron: {
    marginLeft: 7
  }
});
