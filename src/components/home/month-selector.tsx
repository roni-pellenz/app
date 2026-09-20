import { Ionicons } from "@expo/vector-icons";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCompetence, shiftCompetence } from "@/lib/format";
import { theme } from "@/theme/theme";

type MonthSelectorProps = {
  competence: string;
  onPrevious: () => void;
  onNext: () => void;
};

type TransitionDirection = "previous" | "next";

const MIN_SWIPE_THRESHOLD = 36;
const MAX_SWIPE_THRESHOLD = 58;
const VELOCITY_THRESHOLD = 0.45;
const TRANSITION_DURATION = 190;

export function MonthSelector({ competence, onPrevious, onNext }: MonthSelectorProps) {
  const [displayedCompetence, setDisplayedCompetence] = useState(competence);

  const [viewportWidth, setViewportWidth] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  const displayedCompetenceRef = useRef(competence);

  const isAnimatingRef = useRef(false);

  const pendingDirectionRef = useRef<TransitionDirection | null>(null);

  const previousCompetence = shiftCompetence(displayedCompetence, -1);

  const nextCompetence = shiftCompetence(displayedCompetence, 1);

  useEffect(() => {
    if (competence === displayedCompetenceRef.current) {
      return;
    }

    displayedCompetenceRef.current = competence;

    pendingDirectionRef.current = null;
    isAnimatingRef.current = false;

    translateX.stopAnimation();
    translateX.setValue(0);

    setDisplayedCompetence(competence);
  }, [competence, translateX]);

  useLayoutEffect(() => {
    const direction = pendingDirectionRef.current;

    if (!direction) {
      return;
    }

    /*
     * Quando a animação termina, o mês que entrou pela lateral
     * já está ocupando o centro visualmente.
     *
     * Atualizamos então a competência interna e zeramos a posição
     * antes do próximo frame, fazendo o carrossel parecer infinito.
     */
    translateX.setValue(0);

    pendingDirectionRef.current = null;
    isAnimatingRef.current = false;

    if (direction === "next") {
      onNext();

      return;
    }

    onPrevious();
  }, [displayedCompetence, onNext, onPrevious, translateX]);

  function resetPosition(): void {
    isAnimatingRef.current = true;

    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 0
    }).start(() => {
      isAnimatingRef.current = false;
    });
  }

  function completeTransition(direction: TransitionDirection): void {
    if (isAnimatingRef.current) {
      return;
    }

    if (viewportWidth <= 0) {
      if (direction === "next") {
        onNext();
      } else {
        onPrevious();
      }

      return;
    }

    isAnimatingRef.current = true;

    /*
     * Regra de navegação escolhida para o app:
     *
     * arrastar para a direita -> próximo mês
     * arrastar para a esquerda -> mês anterior
     *
     * Por isso o próximo mês fica preparado à esquerda
     * e o mês anterior à direita.
     */
    const targetPosition = direction === "next" ? viewportWidth : -viewportWidth;

    Animated.timing(translateX, {
      toValue: targetPosition,
      duration: TRANSITION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (!finished) {
        isAnimatingRef.current = false;

        return;
      }

      const offset = direction === "next" ? 1 : -1;

      const nextDisplayedCompetence = shiftCompetence(displayedCompetenceRef.current, offset);

      displayedCompetenceRef.current = nextDisplayedCompetence;

      pendingDirectionRef.current = direction;

      setDisplayedCompetence(nextDisplayedCompetence);
    });
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => {
      if (isAnimatingRef.current) {
        return false;
      }

      const horizontalDistance = Math.abs(gesture.dx);
      const verticalDistance = Math.abs(gesture.dy);

      return horizontalDistance > 6 && horizontalDistance > verticalDistance * 1.2;
    },

    onPanResponderGrant: () => {
      translateX.stopAnimation();
    },

    onPanResponderMove: (_, gesture) => {
      if (viewportWidth <= 0) {
        return;
      }

      const limitedDistance = Math.max(-viewportWidth, Math.min(viewportWidth, gesture.dx));

      translateX.setValue(limitedDistance);
    },

    onPanResponderRelease: (_, gesture) => {
      const threshold =
        viewportWidth > 0
          ? Math.min(MAX_SWIPE_THRESHOLD, Math.max(MIN_SWIPE_THRESHOLD, viewportWidth * 0.18))
          : MIN_SWIPE_THRESHOLD;

      const shouldGoNext = gesture.dx >= threshold || gesture.vx >= VELOCITY_THRESHOLD;

      const shouldGoPrevious = gesture.dx <= -threshold || gesture.vx <= -VELOCITY_THRESHOLD;

      if (shouldGoNext) {
        completeTransition("next");

        return;
      }

      if (shouldGoPrevious) {
        completeTransition("previous");

        return;
      }

      resetPosition();
    },

    onPanResponderTerminate: () => {
      resetPosition();
    },

    onPanResponderTerminationRequest: () => false
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        onPress={() => {
          completeTransition("previous");
        }}
        hitSlop={10}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
      </Pressable>

      <View
        style={styles.viewport}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;

          if (width > 0 && Math.abs(width - viewportWidth) > 0.5) {
            setViewportWidth(width);

            translateX.setValue(0);
          }
        }}
      >
        {viewportWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.track,
              {
                left: -viewportWidth,
                width: viewportWidth * 3,
                transform: [
                  {
                    translateX
                  }
                ]
              }
            ]}
          >
            <View
              style={[
                styles.slide,
                {
                  width: viewportWidth
                }
              ]}
            >
              <Text style={styles.label} numberOfLines={1}>
                {formatCompetence(nextCompetence)}
              </Text>
            </View>

            <View
              style={[
                styles.slide,
                {
                  width: viewportWidth
                }
              ]}
            >
              <Text style={styles.label} numberOfLines={1}>
                {formatCompetence(displayedCompetence)}
              </Text>
            </View>

            <View
              style={[
                styles.slide,
                {
                  width: viewportWidth
                }
              ]}
            >
              <Text style={styles.label} numberOfLines={1}>
                {formatCompetence(previousCompetence)}
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Text style={styles.label} numberOfLines={1}>
            {formatCompetence(displayedCompetence)}
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        onPress={() => {
          completeTransition("next");
        }}
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

  viewport: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },

  track: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row"
  },

  slide: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },

  label: {
    width: "100%",
    paddingHorizontal: 6,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text
  }
});
