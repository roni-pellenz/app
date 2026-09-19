import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";

type AddExpenseButtonProps = {
  bottom: number;
  onPress: () => void;
};

export function AddExpenseButton({ bottom, onPress }: AddExpenseButtonProps) {
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
      <Ionicons name="add" size={34} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    shadowColor: "#087CFA",
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
