import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type AddExpenseButtonProps = {
  bottom: number;
  onPress: () => void;
};

export function AddExpenseButton({ bottom, onPress }: AddExpenseButtonProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar despesa"
      style={({ pressed }) => [
        styles.button,
        {
          bottom
        },
        pressed && styles.buttonPressed
      ]}
    >
      <Ionicons name="add" size={34} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    button: {
      position: "absolute",
      right: 27,
      width: 58,
      height: 58,
      zIndex: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 6
      },
      shadowOpacity: 0.27,
      shadowRadius: 12,
      elevation: 8
    },

    buttonPressed: {
      opacity: 0.78,
      transform: [
        {
          scale: 0.96
        }
      ]
    }
  });
}
