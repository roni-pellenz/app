import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type HomeHeaderProps = {
  name: string;
};

export function HomeHeader({ name }: HomeHeaderProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting} numberOfLines={1}>
          Olá, {name}! 👋
        </Text>

        <Text style={styles.subtitle}>Planeje hoje um amanhã mais tranquilo.</Text>
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

    greeting: {
      fontSize: 25,
      lineHeight: 30,
      fontWeight: "800",
      letterSpacing: -0.75,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary
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
