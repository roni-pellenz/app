import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type TabDefinition = {
  label: string;
  href: "/" | "/expenses" | "/account";
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
};

type AppTabBarProps = {
  activeRouteName: string;
};

const tabs: Array<{
  routeName: string;
  definition: TabDefinition;
}> = [
  {
    routeName: "index",
    definition: {
      label: "Home",
      href: "/",
      activeIcon: "home",
      inactiveIcon: "home-outline"
    }
  },
  {
    routeName: "expenses",
    definition: {
      label: "Despesas",
      href: "/expenses",
      activeIcon: "document-text",
      inactiveIcon: "document-text-outline"
    }
  },
  {
    routeName: "account",
    definition: {
      label: "Conta",
      href: "/account",
      activeIcon: "person",
      inactiveIcon: "person-outline"
    }
  }
];

export function AppTabBar({ activeRouteName }: AppTabBarProps) {
  const insets = useSafeAreaInsets();

  function navigate(definition: TabDefinition, selected: boolean): void {
    if (selected) {
      return;
    }

    router.navigate(definition.href);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom - 14, 14)
        }
      ]}
    >
      <BlurView intensity={95} tint="light" style={styles.blur}>
        <View style={styles.bar}>
          {tabs.map(({ routeName, definition }) => {
            const selected = activeRouteName === routeName;

            return (
              <Pressable
                key={routeName}
                onPress={() => {
                  navigate(definition, selected);
                }}
                accessibilityRole="button"
                accessibilityState={
                  selected
                    ? {
                        selected: true
                      }
                    : {}
                }
                hitSlop={4}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <View style={[styles.itemContent, selected && styles.itemContentSelected]}>
                  <Ionicons
                    name={selected ? definition.activeIcon : definition.inactiveIcon}
                    size={24}
                    color={selected ? theme.colors.primary : theme.colors.textSecondary}
                  />

                  <Text style={[styles.label, selected && styles.labelSelected]}>
                    {definition.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 22,
    right: 22
  },

  blur: {
    height: 62,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D3D9E2",
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    ...theme.shadow.tabBar
  },

  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 6
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  itemPressed: {
    opacity: 0.7
  },

  itemContent: {
    width: 96,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29
  },

  itemContentSelected: {
    backgroundColor: theme.colors.primarySoft
  },

  label: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },

  labelSelected: {
    fontWeight: "700",
    color: theme.colors.primary
  }
});
