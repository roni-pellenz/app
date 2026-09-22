import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions } from "react-native";

type UndoSnackbarProps = {
  message: string | null;
  bottom: number;
  right?: number;
  onUndo: () => void;
};

const ENTER_DURATION = 260;

const EXIT_DURATION = 180;

export function UndoSnackbar({ message, bottom, right = 20, onUndo }: UndoSnackbarProps) {
  const { width } = useWindowDimensions();

  const [displayedMessage, setDisplayedMessage] = useState<string | null>(message);

  const displayedMessageRef = useRef<string | null>(message);

  const latestMessageRef = useRef<string | null>(message);

  const translateX = useRef(new Animated.Value(message ? 0 : -(width + 40))).current;

  const opacity = useRef(new Animated.Value(message ? 1 : 0)).current;

  useEffect(() => {
    latestMessageRef.current = message;

    translateX.stopAnimation();
    opacity.stopAnimation();

    if (message) {
      displayedMessageRef.current = message;

      setDisplayedMessage(message);

      translateX.setValue(-(width + 40));

      opacity.setValue(0);

      const animation = Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ENTER_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }

    if (!displayedMessageRef.current) {
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(translateX, {
        toValue: -(width + 40),
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true
      })
    ]);

    animation.start(({ finished }) => {
      if (finished && latestMessageRef.current === null) {
        displayedMessageRef.current = null;

        setDisplayedMessage(null);
      }
    });

    return () => {
      animation.stop();
    };
  }, [message, opacity, translateX, width]);

  if (!displayedMessage) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={message ? "auto" : "none"}
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          bottom,
          right,
          opacity,
          transform: [
            {
              translateX
            }
          ]
        }
      ]}
    >
      <Text style={styles.message} numberOfLines={2}>
        {displayedMessage}
      </Text>

      <Pressable
        onPress={onUndo}
        disabled={!message}
        hitSlop={8}
        style={({ pressed }) => [styles.undoButton, pressed && styles.undoButtonPressed]}
      >
        <Text style={styles.undoText}>Desfazer</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    zIndex: 50,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingLeft: 17,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: "#172033",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 12
  },

  message: {
    flex: 1,
    paddingRight: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#FFFFFF"
  },

  undoButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 10
  },

  undoButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.10)"
  },

  undoText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#78BFFF"
  }
});
