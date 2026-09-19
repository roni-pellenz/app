import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AccountMenuItem } from "@/components/account/account-menu-item";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type AccountMenuCardItem = {
  key: string;
  icon: IoniconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

type AccountMenuCardProps = {
  items: AccountMenuCardItem[];
};

export function AccountMenuCard({ items }: AccountMenuCardProps) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <AccountMenuItem
          key={item.key}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          showDivider={index < items.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  }
});
