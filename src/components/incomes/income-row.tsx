import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Income } from "@/income/income.types";
import { formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type IncomeRowProps = {
  income: Income;
  onPress: () => void;
};

export function IncomeRow({ income, onPress }: IncomeRowProps) {
  const recurring = income.recurrenceId !== null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.iconContainer, recurring ? styles.recurringIcon : styles.oneOffIcon]}>
        <Ionicons
          name={recurring ? "briefcase-outline" : "star-outline"}
          size={27}
          color={recurring ? "#F28A00" : "#EFA500"}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.name} numberOfLines={1}>
            {income.name}
          </Text>

          <Text style={styles.meta}>
            {income.receivedDate
              ? `Recebida em ${formatDayMonth(income.receivedDate)}`
              : `Recebimento em ${formatDayMonth(income.expectedDate)}`}
          </Text>
        </View>

        <View style={styles.rightContent}>
          <Text
            style={[styles.amount, income.receivedDate && styles.receivedAmount]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {formatMoney(income.amount)}
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

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingLeft: 13,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  pressed: {
    opacity: 0.68
  },

  iconContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15
  },

  recurringIcon: {
    backgroundColor: "#FFF2DF"
  },

  oneOffIcon: {
    backgroundColor: "#FFF5D9"
  },

  content: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 13,
    paddingRight: 13,
    paddingVertical: 15
  },

  textContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8
  },

  name: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text
  },

  meta: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 17,
    color: "#526D94"
  },

  rightContent: {
    maxWidth: 138,
    flexDirection: "row",
    alignItems: "center"
  },

  amount: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 20,
    textAlign: "right",
    fontWeight: "800",
    color: "#07143A"
  },

  receivedAmount: {
    color: theme.colors.success
  },

  chevron: {
    marginLeft: 7
  }
});
