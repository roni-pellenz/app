import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";
import { theme } from "@/theme/theme";

type ExpenseSettingsCardProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function ExpenseSettingsCard({ enabled, onChange }: ExpenseSettingsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="settings-outline" size={25} color={theme.colors.text} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          Configurações de despesas
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          Exibir “Vencem em breve”
        </Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={onChange}
        trackColor={{
          false: "#CCD5E0",
          true: theme.colors.primary
        }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#CCD5E0"
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  iconContainer: {
    width: 43,
    alignItems: "flex-start",
    justifyContent: "center"
  },

  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4
  },

  title: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "#526D94"
  },

  switch: {
    transform: [
      {
        scaleX: 0.88
      },
      {
        scaleY: 0.88
      }
    ]
  }
});
