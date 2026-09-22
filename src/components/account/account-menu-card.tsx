import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { AccountMenuItem } from "@/components/account/account-menu-item";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type AccountMenuCardItem = {
  key: string;
  icon: IoniconName;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
  onPress?: () => void;
};

type AccountMenuCardProps = {
  items: AccountMenuCardItem[];
};

export function AccountMenuCard({ items }: AccountMenuCardProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <AccountMenuItem
          key={item.key}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          showChevron={item.showChevron}
          showDivider={index < items.length - 1}
        />
      ))}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    }
  });
}
