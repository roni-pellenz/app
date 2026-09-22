import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppTheme, ResolvedThemeMode } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type SymbolName = ComponentProps<typeof SymbolView>["name"];

type TabDefinition = {
  label: string;
  href: "/" | "/expenses" | "/account";
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
  activeSymbol: SymbolName;
  inactiveSymbol: SymbolName;
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
      inactiveIcon: "home-outline",
      activeSymbol: "house.fill",
      inactiveSymbol: "house"
    }
  },
  {
    routeName: "expenses",
    definition: {
      label: "Despesas",
      href: "/expenses",
      activeIcon: "document-text",
      inactiveIcon: "document-text-outline",
      activeSymbol: "doc.text.fill",
      inactiveSymbol: "doc.text"
    }
  },
  {
    routeName: "account",
    definition: {
      label: "Conta",
      href: "/account",
      activeIcon: "person",
      inactiveIcon: "person-outline",
      activeSymbol: "person.fill",
      inactiveSymbol: "person"
    }
  }
];

export function AppTabBar({ activeRouteName }: AppTabBarProps) {
  const { theme, resolvedThemeMode } = useAppTheme();

  const insets = useSafeAreaInsets();

  const styles = createStyles(theme, resolvedThemeMode);

  const supportsNativeLiquidGlass =
    Platform.OS === "ios" && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

  const selectedColor: ColorValue = resolvedThemeMode === "dark" ? "#0A84FF" : "#007AFF";

  const inactiveColor: ColorValue = resolvedThemeMode === "dark" ? "#A5ADB8" : "#525B66";

  const selectedGlassTint =
    resolvedThemeMode === "dark" ? "rgba(10,132,255,0.20)" : "rgba(0,122,255,0.10)";

  function navigate(definition: TabDefinition, exactSelected: boolean): void {
    if (exactSelected) {
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
      <View style={styles.shadowContainer}>
        {supportsNativeLiquidGlass ? (
          <GlassView
            colorScheme={resolvedThemeMode}
            glassEffectStyle="regular"
            style={styles.backgroundGlass}
          />
        ) : (
          <BlurView
            intensity={resolvedThemeMode === "dark" ? 70 : 80}
            tint={resolvedThemeMode === "dark" ? "dark" : "light"}
            style={styles.backgroundGlass}
          >
            <View style={styles.fallbackGlassTint} />
          </BlurView>
        )}

        <View pointerEvents="none" style={styles.outerGlassBorder} />

        <View style={styles.bar}>
          {tabs.map(({ routeName, definition }) => {
            const exactSelected = activeRouteName === routeName;

            const selected =
              exactSelected || (activeRouteName === "incomes" && routeName === "index");

            const iconColor = selected ? selectedColor : inactiveColor;

            return (
              <Pressable
                key={routeName}
                accessibilityRole="button"
                accessibilityLabel={definition.label}
                accessibilityState={
                  selected
                    ? {
                        selected: true
                      }
                    : {}
                }
                hitSlop={4}
                onPress={() => {
                  navigate(definition, exactSelected);
                }}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                {selected ? (
                  supportsNativeLiquidGlass ? (
                    <GlassView
                      pointerEvents="none"
                      colorScheme={resolvedThemeMode}
                      glassEffectStyle="regular"
                      tintColor={selectedGlassTint}
                      style={styles.selectedGlass}
                    />
                  ) : (
                    <View pointerEvents="none" style={styles.selectedFallback} />
                  )
                ) : null}

                <View pointerEvents="none" style={styles.itemContent}>
                  {Platform.OS === "ios" ? (
                    <SymbolView
                      name={selected ? definition.activeSymbol : definition.inactiveSymbol}
                      size={25}
                      weight={selected ? "semibold" : "regular"}
                      tintColor={iconColor}
                      resizeMode="scaleAspectFit"
                    />
                  ) : (
                    <Ionicons
                      name={selected ? definition.activeIcon : definition.inactiveIcon}
                      size={24}
                      color={iconColor}
                    />
                  )}

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      {
                        color: iconColor
                      },
                      selected && styles.labelSelected
                    ]}
                  >
                    {definition.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme, resolvedThemeMode: ResolvedThemeMode) {
  const isDark = resolvedThemeMode === "dark";

  return StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 22,
      right: 22
    },

    shadowContainer: {
      position: "relative",
      height: 68,
      overflow: "visible",
      borderRadius: 34,

      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 5
      },
      shadowOpacity: isDark ? 0.28 : 0.12,
      shadowRadius: 17,
      elevation: 8
    },

    backgroundGlass: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
      borderRadius: 34
    },

    fallbackGlassTint: {
      flex: 1,
      backgroundColor: isDark ? "rgba(18,30,47,0.58)" : "rgba(255,255,255,0.43)"
    },

    outerGlassBorder: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 34,
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(121,132,145,0.33)"
    },

    bar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
      paddingHorizontal: 5,
      paddingVertical: 5
    },

    item: {
      position: "relative",
      flex: 1,
      alignItems: "stretch",
      justifyContent: "center",
      marginHorizontal: 1
    },

    itemPressed: {
      transform: [
        {
          scale: 0.985
        }
      ]
    },

    selectedGlass: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 1,
      right: 1,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.82)",
      borderRadius: 29
    },

    selectedFallback: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 1,
      right: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.72)",
      borderRadius: 29,
      backgroundColor: theme.colors.primarySoft
    },

    itemContent: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 1
    },

    label: {
      marginTop: 2,
      fontSize: 11.5,
      lineHeight: 14,
      fontWeight: "600",
      letterSpacing: -0.15
    },

    labelSelected: {
      fontWeight: "700"
    }
  });
}
