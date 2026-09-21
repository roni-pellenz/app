import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { getExpenseAppearance } from "@/expense/expense.appearance";
import type { Expense } from "@/expense/expense.types";
import { formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type ExpenseRowProps = {
  expense: Expense;
  onPress: () => void;
  onTogglePayment: () => void;
  onDelete: () => void;
};

type ExpenseStatus = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

type OpenSide = -1 | 0 | 1;

const ACTION_WIDTH = 92;

const SNAP_THRESHOLD = 42;

const CLOSE_THRESHOLD = 18;

const OPEN_VELOCITY_THRESHOLD = 0.35;

const CLOSE_VELOCITY_THRESHOLD = 0.2;

const FULL_SWIPE_RATIO = 0.72;

const FULL_SWIPE_MIN_DISTANCE = ACTION_WIDTH + 70;

const FULL_SWIPE_ANIMATION_DURATION = 110;

export function ExpenseRow({ expense, onPress, onTogglePayment, onDelete }: ExpenseRowProps) {
  const appearance = getExpenseAppearance(expense.name, expense.category);

  const status = getExpenseStatus(expense);

  const translateX = useRef(new Animated.Value(0)).current;

  const rowWidthRef = useRef(0);

  const gestureStartX = useRef(0);

  const gestureStartSide = useRef<OpenSide>(0);

  const openPosition = useRef(0);

  const onTogglePaymentRef = useRef(onTogglePayment);

  const onDeleteRef = useRef(onDelete);

  onTogglePaymentRef.current = onTogglePayment;

  onDeleteRef.current = onDelete;

  function getRowWidth(): number {
    return Math.max(rowWidthRef.current, ACTION_WIDTH * 3);
  }

  function getFullSwipeThreshold(): number {
    return Math.max(FULL_SWIPE_MIN_DISTANCE, getRowWidth() * FULL_SWIPE_RATIO);
  }

  function snapTo(position: number): void {
    openPosition.current = position;

    Animated.spring(translateX, {
      toValue: position,
      useNativeDriver: true,
      bounciness: 0,
      speed: 22
    }).start();
  }

  function closeRow(): void {
    snapTo(0);
  }

  function executeFullSwipe(direction: -1 | 1): void {
    const target = direction * getRowWidth();

    openPosition.current = 0;

    Animated.timing(translateX, {
      toValue: target,
      duration: FULL_SWIPE_ANIMATION_DURATION,
      useNativeDriver: true
    }).start(() => {
      translateX.setValue(0);

      if (direction === 1) {
        onTogglePaymentRef.current();

        return;
      }

      onDeleteRef.current();
    });
  }

  function handleRowPress(): void {
    if (openPosition.current !== 0) {
      closeRow();

      return;
    }

    onPress();
  }

  function handlePayment(): void {
    closeRow();

    onTogglePaymentRef.current();
  }

  function handleDelete(): void {
    closeRow();

    onDeleteRef.current();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) => {
        const horizontal = Math.abs(gesture.dx);

        const vertical = Math.abs(gesture.dy);

        return horizontal > 8 && horizontal > vertical * 1.3;
      },

      onPanResponderGrant: () => {
        if (openPosition.current > 0) {
          gestureStartSide.current = 1;
        } else if (openPosition.current < 0) {
          gestureStartSide.current = -1;
        } else {
          gestureStartSide.current = 0;
        }

        translateX.stopAnimation((value) => {
          gestureStartX.current = value;
        });
      },

      onPanResponderMove: (_, gesture) => {
        const proposed = gestureStartX.current + gesture.dx;

        const maxTranslation = getRowWidth();

        let clamped: number;

        if (gestureStartSide.current === 1) {
          clamped = Math.max(0, Math.min(maxTranslation, proposed));
        } else if (gestureStartSide.current === -1) {
          clamped = Math.max(-maxTranslation, Math.min(0, proposed));
        } else {
          clamped = Math.max(-maxTranslation, Math.min(maxTranslation, proposed));
        }

        translateX.setValue(clamped);
      },

      onPanResponderRelease: (_, gesture) => {
        const maxTranslation = getRowWidth();

        const fullThreshold = getFullSwipeThreshold();

        let current = gestureStartX.current + gesture.dx;

        if (gestureStartSide.current === 1) {
          current = Math.max(0, Math.min(maxTranslation, current));

          if (current >= fullThreshold && gesture.dx > 0) {
            executeFullSwipe(1);

            return;
          }

          if (gesture.dx <= -CLOSE_THRESHOLD || gesture.vx <= -CLOSE_VELOCITY_THRESHOLD) {
            snapTo(0);

            return;
          }

          snapTo(ACTION_WIDTH);

          return;
        }

        if (gestureStartSide.current === -1) {
          current = Math.max(-maxTranslation, Math.min(0, current));

          if (current <= -fullThreshold && gesture.dx < 0) {
            executeFullSwipe(-1);

            return;
          }

          if (gesture.dx >= CLOSE_THRESHOLD || gesture.vx >= CLOSE_VELOCITY_THRESHOLD) {
            snapTo(0);

            return;
          }

          snapTo(-ACTION_WIDTH);

          return;
        }

        if (current >= fullThreshold) {
          executeFullSwipe(1);

          return;
        }

        if (current <= -fullThreshold) {
          executeFullSwipe(-1);

          return;
        }

        if (gesture.vx > OPEN_VELOCITY_THRESHOLD || current > SNAP_THRESHOLD) {
          snapTo(ACTION_WIDTH);

          return;
        }

        if (gesture.vx < -OPEN_VELOCITY_THRESHOLD || current < -SNAP_THRESHOLD) {
          snapTo(-ACTION_WIDTH);

          return;
        }

        snapTo(0);
      },

      onPanResponderTerminate: () => {
        if (gestureStartSide.current === 1) {
          snapTo(ACTION_WIDTH);

          return;
        }

        if (gestureStartSide.current === -1) {
          snapTo(-ACTION_WIDTH);

          return;
        }

        snapTo(0);
      },

      onPanResponderTerminationRequest: () => false
    })
  ).current;

  const paymentBackgroundOpacity = translateX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
    extrapolate: "clamp"
  });

  const deleteBackgroundOpacity = translateX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [1, 0, 0],
    extrapolate: "clamp"
  });

  const isPaid = expense.paidDate !== null;

  return (
    <View
      style={styles.swipeContainer}
      onLayout={(event) => {
        rowWidthRef.current = event.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fullActionBackground,
          styles.paymentBackground,
          {
            opacity: paymentBackgroundOpacity
          }
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.fullActionBackground,
          styles.deleteBackground,
          {
            opacity: deleteBackgroundOpacity
          }
        ]}
      />

      <Animated.View
        style={[
          styles.actionContainer,
          styles.paymentAction,
          {
            opacity: paymentBackgroundOpacity
          }
        ]}
      >
        <Pressable
          onPress={handlePayment}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name={isPaid ? "arrow-undo" : "checkmark"} size={28} color="#FFFFFF" />

          <Text style={styles.actionText} numberOfLines={1}>
            {isPaid ? "Desmarcar" : "Pagar"}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionContainer,
          styles.deleteAction,
          {
            opacity: deleteBackgroundOpacity
          }
        ]}
      >
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name="trash-outline" size={26} color="#FFFFFF" />

          <Text style={styles.actionText}>Excluir</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.animatedRow,
          {
            transform: [
              {
                translateX
              }
            ]
          }
        ]}
      >
        <Pressable
          onPress={handleRowPress}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: appearance.backgroundColor
              }
            ]}
          >
            <Ionicons name={appearance.icon} size={26} color={appearance.color} />
          </View>

          <View style={styles.content}>
            <View style={styles.textContent}>
              <Text style={styles.name} numberOfLines={1}>
                {expense.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: status.backgroundColor
                  }
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: status.textColor
                    }
                  ]}
                >
                  {status.label}
                </Text>
              </View>

              <Text style={styles.firstMeta}>Vence em {formatDayMonth(expense.dueDate)}</Text>

              <Text style={styles.meta}>
                Competência: {formatShortCompetence(expense.competence)}
              </Text>
            </View>

            <View style={styles.rightContent}>
              <Text
                style={[styles.amount, isPaid && styles.paidAmount]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {formatMoney(expense.amount)}
              </Text>

              <Ionicons name="chevron-forward" size={20} color="#52719B" style={styles.chevron} />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function getExpenseStatus(expense: Expense): ExpenseStatus {
  if (expense.paidDate !== null) {
    return {
      label: "Paga",
      backgroundColor: theme.colors.successSoft,
      textColor: theme.colors.success
    };
  }

  const dueDate = expense.dueDate.slice(0, 10);

  const today = getTodayDateKey();

  if (dueDate < today) {
    return {
      label: "Vencida",
      backgroundColor: theme.colors.dangerSoft,
      textColor: theme.colors.danger
    };
  }

  return {
    label: "Em dia",
    backgroundColor: theme.colors.primarySoft,
    textColor: theme.colors.primary
  };
}

function getTodayDateKey(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayMonth(value: string): string {
  const [, month, day] = value.slice(0, 10).split("-");

  if (!month || !day) {
    return value;
  }

  return `${day}/${month}`;
}

function formatShortCompetence(value: string): string {
  const [year, month] = value.slice(0, 7).split("-");

  const monthNumber = Number(month);

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ];

  if (!year || monthNumber < 1 || monthNumber > 12) {
    return value;
  }

  return `${months[monthNumber - 1]}/${year}`;
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card
  },

  fullActionBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },

  paymentBackground: {
    backgroundColor: theme.colors.success
  },

  deleteBackground: {
    backgroundColor: theme.colors.danger
  },

  actionContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    zIndex: 1
  },

  paymentAction: {
    left: 0
  },

  deleteAction: {
    right: 0
  },

  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },

  actionPressed: {
    opacity: 0.78
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF"
  },

  animatedRow: {
    zIndex: 2,
    backgroundColor: theme.colors.surface
  },

  row: {
    minHeight: 118,
    flexDirection: "row",
    paddingLeft: 13,
    backgroundColor: theme.colors.surface
  },

  pressed: {
    opacity: 0.65
  },

  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 15
  },

  content: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 13,
    paddingRight: 13,
    paddingVertical: 12
  },

  textContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8
  },

  name: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: theme.colors.text
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },

  statusText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700"
  },

  firstMeta: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 16,
    color: "#526D94"
  },

  meta: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#526D94"
  },

  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 122
  },

  amount: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 19,
    textAlign: "right",
    fontWeight: "800",
    color: "#07143A"
  },

  paidAmount: {
    color: theme.colors.success
  },

  chevron: {
    marginLeft: 7
  }
});
