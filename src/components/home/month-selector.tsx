import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCompetence } from "@/lib/format";
import { theme } from "@/theme/theme";

type MonthSelectorProps = {
  competence: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function MonthSelector({ competence, onPrevious, onNext }: MonthSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPrevious}
        hitSlop={10}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
      </Pressable>

      <Text style={styles.label} numberOfLines={1}>
        {formatCompetence(competence)}
      </Text>

      <Pressable
        onPress={onNext}
        hitSlop={10}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 23,
    paddingHorizontal: 7,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  button: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19
  },

  buttonPressed: {
    backgroundColor: theme.colors.primarySoft
  },

  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text
  }
});
