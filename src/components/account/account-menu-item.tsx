import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type AccountMenuItemProps = {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  showDivider?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
};

export function AccountMenuItem({
  icon,
  title,
  subtitle,
  showDivider = false,
  showChevron = true,
  onPress
}: AccountMenuItemProps) {
  const content = (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={theme.colors.text} />
      </View>

      <View style={[styles.textContainer, showDivider && styles.textContainerDivider]}>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {showChevron ? <Ionicons name="chevron-forward" size={20} color="#52719B" /> : null}
      </View>
    </View>
  );

  if (!onPress) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 66
  },

  pressed: {
    opacity: 0.62
  },

  content: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "stretch",
    paddingLeft: 16
  },

  iconContainer: {
    width: 46,
    alignItems: "flex-start",
    justifyContent: "center"
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16
  },

  textContainerDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border
  },

  textBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    paddingVertical: 10,
    paddingRight: 8
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
    fontSize: 13,
    lineHeight: 17,
    color: "#526D94"
  }
});
