import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

export function PlanningStatusCard() {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="bulb-outline" size={23} color={theme.colors.warning} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Você está no controle!</Text>

        <Text style={styles.description}>
          Suas finanças deste mês estão planejadas.
          {"\n"}
          Continue assim!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  iconContainer: {
    width: 41,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.warningSoft
  },

  content: {
    flex: 1,
    marginLeft: 12
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text
  },

  description: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: theme.colors.textSecondary
  }
});
