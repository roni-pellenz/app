import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";

export default function ExpensesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Despesas</Text>

        <Text style={styles.text}>Esta tela será construída a partir do próximo print.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundTop
  },

  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 110
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text
  },

  text: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSecondary
  }
});
