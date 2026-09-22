import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

export function ExpensesHeader() {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Despesas</Text>

        <Text style={styles.subtitle}>Suas obrigações organizadas por mês.</Text>
      </View>

      <Pressable
        hitSlop={10}
        style={({ pressed }) => [styles.notification, pressed && styles.notificationPressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    textContainer: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12
    },

    title: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "800",
      letterSpacing: -1.1,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 3,
      fontSize: 16,
      lineHeight: 21,
      color: theme.colors.subtitle
    },

    notification: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22
    },

    notificationPressed: {
      backgroundColor: theme.colors.primarySoft
    }
  });
}
