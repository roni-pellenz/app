import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type AccountProfileCardProps = {
  name: string;
  surname: string;
  email: string;
  onPress: () => void;
};

export function AccountProfileCard({ name, surname, email, onPress }: AccountProfileCardProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  const fullName = [name.trim(), surname.trim()].filter(Boolean).join(" ");

  const initials = getInitials(name, surname);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir meus dados"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
          {fullName}
        </Text>

        <Text style={styles.email} numberOfLines={1} adjustsFontSizeToFit>
          {email}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={21} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

function getInitials(name: string, surname: string): string {
  const firstInitial = name.trim().charAt(0);

  const lastInitial = surname.trim().charAt(0);

  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  return initials || "?";
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      minHeight: 100,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 22,
      paddingHorizontal: 17,
      paddingVertical: 13,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    },

    pressed: {
      opacity: 0.68
    },

    avatar: {
      width: 68,
      height: 68,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 34,
      backgroundColor: theme.colors.primarySoft
    },

    initials: {
      fontSize: 25,
      lineHeight: 30,
      fontWeight: "800",
      letterSpacing: -0.9,
      color: theme.colors.primary
    },

    content: {
      flex: 1,
      minWidth: 0,
      marginLeft: 18,
      marginRight: 8
    },

    name: {
      fontSize: 19,
      lineHeight: 24,
      fontWeight: "800",
      letterSpacing: -0.55,
      color: theme.colors.text
    },

    email: {
      marginTop: 3,
      fontSize: 15,
      lineHeight: 19,
      color: theme.colors.textSecondary
    }
  });
}
