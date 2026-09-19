import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type ExpenseDetailRowProps = {
  icon: IoniconName;
  label: string;
  value: string;
  divider?: boolean;
};

export function ExpenseDetailRow({ icon, label, value, divider = true }: ExpenseDetailRowProps) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Ionicons name={icon} size={22} color="#526D94" />

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14
  },

  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border
  },

  label: {
    flexShrink: 1,
    marginLeft: 14,
    fontSize: 14,
    color: "#526D94"
  },

  value: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "right",
    fontWeight: "700",
    color: "#07143A"
  }
});
