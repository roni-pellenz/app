import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type BarMetrics = {
  left: number;
  width: number;
};

type TabLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const HOLD_TO_DRAG_MS = 120;

const DRAG_ACTIVATION_DISTANCE = 6;

const HORIZONTAL_DOMINANCE_RATIO = 1.15;

const PRESS_SUPPRESSION_MS = 120;

const TAP_TRANSITION_DURATION = 190;

const RELEASE_SNAP_DURATION = 110;

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

  const barRef = useRef<View>(null);

  const barMetricsRef = useRef<BarMetrics>({
    left: 0,
    width: 0
  });

  const tabLayoutsRef = useRef<Array<TabLayout | null>>([null, null, null]);

  const activeRouteNameRef = useRef(activeRouteName);

  const touchStartedAtRef = useRef(0);

  const isDraggingRef = useRef(false);

  const suppressNextPressRef = useRef(false);

  const lastDragIndexRef = useRef<number | null>(null);

  const interactionSelectedIndexRef = useRef<number | null>(null);

  const indicatorInitializedRef = useRef(false);

  const indicatorX = useRef(new Animated.Value(0)).current;

  const [interactionSelectedIndex, setInteractionSelectedIndex] = useState<number | null>(null);

  const [tabLayouts, setTabLayouts] = useState<Array<TabLayout | null>>([null, null, null]);

  activeRouteNameRef.current = activeRouteName;

  const supportsNativeLiquidGlass =
    Platform.OS === "ios" && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

  const selectedColor: ColorValue = resolvedThemeMode === "dark" ? "#0A84FF" : "#007AFF";

  const inactiveColor: ColorValue = resolvedThemeMode === "dark" ? "#A5ADB8" : "#525B66";

  const selectedGlassTint =
    resolvedThemeMode === "dark" ? "rgba(10,132,255,0.20)" : "rgba(0,122,255,0.10)";

  const routeSelectedIndex = getSelectedTabIndex(activeRouteName);

  const visualSelectedIndex = interactionSelectedIndex ?? routeSelectedIndex;

  const indicatorGeometry = tabLayouts[0] ?? tabLayouts[1] ?? tabLayouts[2];

  const measureBar = useCallback((): void => {
    barRef.current?.measureInWindow((x, _y, width) => {
      if (width <= 0) {
        return;
      }

      barMetricsRef.current = {
        left: x,
        width
      };
    });
  }, []);

  const registerTabLayout = useCallback((index: number, layout: TabLayout): void => {
    const previous = tabLayoutsRef.current[index];

    if (
      previous &&
      Math.abs(previous.x - layout.x) < 0.5 &&
      Math.abs(previous.y - layout.y) < 0.5 &&
      Math.abs(previous.width - layout.width) < 0.5 &&
      Math.abs(previous.height - layout.height) < 0.5
    ) {
      return;
    }

    const nextRef = [...tabLayoutsRef.current];

    nextRef[index] = layout;

    tabLayoutsRef.current = nextRef;

    setTabLayouts(nextRef);
  }, []);

  const animateIndicatorToIndex = useCallback(
    (index: number, duration: number): void => {
      const layout = tabLayoutsRef.current[index];

      if (!layout) {
        return;
      }

      indicatorX.stopAnimation();

      if (!indicatorInitializedRef.current) {
        indicatorX.setValue(layout.x);

        indicatorInitializedRef.current = true;

        return;
      }

      Animated.timing(indicatorX, {
        toValue: layout.x,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    },
    [indicatorX]
  );

  const getNearestTabIndex = useCallback((pageX: number): number | null => {
    const { left, width } = barMetricsRef.current;

    if (width <= 0) {
      return null;
    }

    const relativeX = pageX - left;

    const layouts = tabLayoutsRef.current;

    let nearestIndex: number | null = null;

    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < layouts.length; index += 1) {
      const layout = layouts[index];

      if (!layout) {
        continue;
      }

      const center = layout.x + layout.width / 2;

      const distance = Math.abs(relativeX - center);

      if (distance < nearestDistance) {
        nearestDistance = distance;

        nearestIndex = index;
      }
    }

    if (nearestIndex !== null) {
      return nearestIndex;
    }

    const tabWidth = width / tabs.length;

    return Math.max(
      0,
      Math.min(
        tabs.length - 1,
        Math.floor(Math.max(0, Math.min(width - 0.001, relativeX)) / tabWidth)
      )
    );
  }, []);

  const getIndicatorXForFinger = useCallback((pageX: number): number | null => {
    const { left, width } = barMetricsRef.current;

    if (width <= 0) {
      return null;
    }

    const layouts = tabLayoutsRef.current;

    const firstLayout = layouts[0];

    const lastLayout = layouts[layouts.length - 1];

    if (!firstLayout || !lastLayout) {
      return null;
    }

    const relativeX = pageX - left;

    const indicatorWidth = firstLayout.width;

    const desiredX = relativeX - indicatorWidth / 2;

    const minimumX = firstLayout.x;

    const maximumX = lastLayout.x;

    return Math.max(minimumX, Math.min(maximumX, desiredX));
  }, []);

  const updateDragFromPageX = useCallback(
    (pageX: number): void => {
      const nextX = getIndicatorXForFinger(pageX);

      if (nextX !== null) {
        indicatorX.stopAnimation();

        indicatorX.setValue(nextX);

        indicatorInitializedRef.current = true;
      }

      const index = getNearestTabIndex(pageX);

      if (index === null || lastDragIndexRef.current === index) {
        return;
      }

      lastDragIndexRef.current = index;

      interactionSelectedIndexRef.current = index;

      setInteractionSelectedIndex(index);

      const tab = tabs[index];

      if (!tab) {
        return;
      }

      router.navigate(tab.definition.href);
    },
    [getIndicatorXForFinger, getNearestTabIndex, indicatorX]
  );

  const finishDrag = useCallback((): void => {
    const finalIndex =
      interactionSelectedIndexRef.current ?? getSelectedTabIndex(activeRouteNameRef.current);

    isDraggingRef.current = false;

    lastDragIndexRef.current = null;

    animateIndicatorToIndex(finalIndex, RELEASE_SNAP_DURATION);

    if (getSelectedTabIndex(activeRouteNameRef.current) === finalIndex) {
      interactionSelectedIndexRef.current = null;

      setInteractionSelectedIndex(null);
    }

    setTimeout(() => {
      suppressNextPressRef.current = false;
    }, PRESS_SUPPRESSION_MS);
  }, [animateIndicatorToIndex]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,

        onStartShouldSetPanResponderCapture: () => false,

        onMoveShouldSetPanResponder: (_, gesture) => {
          const elapsed = Date.now() - touchStartedAtRef.current;

          const horizontalDistance = Math.abs(gesture.dx);

          const verticalDistance = Math.abs(gesture.dy);

          return (
            elapsed >= HOLD_TO_DRAG_MS &&
            horizontalDistance >= DRAG_ACTIVATION_DISTANCE &&
            horizontalDistance > verticalDistance * HORIZONTAL_DOMINANCE_RATIO
          );
        },

        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const elapsed = Date.now() - touchStartedAtRef.current;

          const horizontalDistance = Math.abs(gesture.dx);

          const verticalDistance = Math.abs(gesture.dy);

          return (
            elapsed >= HOLD_TO_DRAG_MS &&
            horizontalDistance >= DRAG_ACTIVATION_DISTANCE &&
            horizontalDistance > verticalDistance * HORIZONTAL_DOMINANCE_RATIO
          );
        },

        onPanResponderGrant: (event) => {
          isDraggingRef.current = true;

          suppressNextPressRef.current = true;

          indicatorX.stopAnimation();

          const currentIndex = getSelectedTabIndex(activeRouteNameRef.current);

          lastDragIndexRef.current = currentIndex;

          interactionSelectedIndexRef.current = currentIndex;

          setInteractionSelectedIndex(currentIndex);

          measureBar();

          updateDragFromPageX(event.nativeEvent.pageX);
        },

        onPanResponderMove: (event) => {
          updateDragFromPageX(event.nativeEvent.pageX);
        },

        onPanResponderRelease: () => {
          finishDrag();
        },

        onPanResponderTerminate: () => {
          finishDrag();
        },

        onPanResponderTerminationRequest: () => false
      }),
    [finishDrag, indicatorX, measureBar, updateDragFromPageX]
  );

  useEffect(() => {
    const layout = tabLayouts[routeSelectedIndex];

    if (!layout || isDraggingRef.current) {
      return;
    }

    if (!indicatorInitializedRef.current) {
      indicatorX.setValue(layout.x);

      indicatorInitializedRef.current = true;

      return;
    }

    const pendingIndex = interactionSelectedIndexRef.current;

    if (pendingIndex !== null) {
      if (pendingIndex === routeSelectedIndex) {
        interactionSelectedIndexRef.current = null;

        setInteractionSelectedIndex(null);
      }

      return;
    }

    animateIndicatorToIndex(routeSelectedIndex, TAP_TRANSITION_DURATION);
  }, [activeRouteName, animateIndicatorToIndex, indicatorX, routeSelectedIndex, tabLayouts]);

  function navigate(index: number, definition: TabDefinition, exactSelected: boolean): void {
    if (suppressNextPressRef.current) {
      return;
    }

    if (exactSelected) {
      return;
    }

    interactionSelectedIndexRef.current = index;

    setInteractionSelectedIndex(index);

    animateIndicatorToIndex(index, TAP_TRANSITION_DURATION);

    router.navigate(definition.href);
  }

  function handleTouchStart(): void {
    touchStartedAtRef.current = Date.now();

    suppressNextPressRef.current = false;

    measureBar();
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

        <View
          ref={barRef}
          style={styles.bar}
          onLayout={() => {
            measureBar();
          }}
          onTouchStart={handleTouchStart}
          {...panResponder.panHandlers}
        >
          {indicatorGeometry ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.selectionIndicator,
                {
                  top: indicatorGeometry.y,
                  width: indicatorGeometry.width,
                  height: indicatorGeometry.height,
                  transform: [
                    {
                      translateX: indicatorX
                    }
                  ]
                }
              ]}
            >
              {supportsNativeLiquidGlass ? (
                <GlassView
                  pointerEvents="none"
                  colorScheme={resolvedThemeMode}
                  glassEffectStyle="regular"
                  tintColor={selectedGlassTint}
                  style={styles.indicatorGlass}
                />
              ) : (
                <View pointerEvents="none" style={styles.indicatorFallback} />
              )}
            </Animated.View>
          ) : null}

          {tabs.map(({ routeName, definition }, index) => {
            const exactSelected = activeRouteName === routeName;

            const selected = visualSelectedIndex === index;

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
                onLayout={(event) => {
                  const { x, y, width, height } = event.nativeEvent.layout;

                  registerTabLayout(index, {
                    x,
                    y,
                    width,
                    height
                  });
                }}
                onPress={() => {
                  navigate(index, definition, exactSelected);
                }}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
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

function getSelectedTabIndex(activeRouteName: string): number {
  if (activeRouteName === "expenses") {
    return 1;
  }

  if (activeRouteName === "account") {
    return 2;
  }

  return 0;
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
      position: "relative",
      flex: 1,
      flexDirection: "row",
      alignItems: "stretch",
      paddingHorizontal: 5,
      paddingVertical: 5
    },

    selectionIndicator: {
      position: "absolute",
      left: 0,
      overflow: "hidden",
      borderRadius: 29,
      zIndex: 0
    },

    indicatorGlass: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.82)",
      borderRadius: 29
    },

    indicatorFallback: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.72)",
      borderRadius: 29,
      backgroundColor: theme.colors.primarySoft
    },

    item: {
      position: "relative",
      flex: 1,
      zIndex: 1,
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
