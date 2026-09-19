import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import type { Expense } from "@/expense/expense.types";
import { getExpenseAppearance } from "@/expense/expense.appearance";
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

const ACTION_WIDTH = 92;
const SNAP_THRESHOLD = 42;

export function ExpenseRow({ expense, onPress, onTogglePayment, onDelete }: ExpenseRowProps) {
  const appearance = getExpenseAppearance(expense.name);

  const status = getExpenseStatus(expense);

  const translateX = useRef(new Animated.Value(0)).current;

  const gestureStartX = useRef(0);

  const openPosition = useRef(0);

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

  function handleRowPress(): void {
    if (openPosition.current !== 0) {
      closeRow();

      return;
    }

    onPress();
  }

  function handlePayment(): void {
    closeRow();

    onTogglePayment();
  }

  function handleDelete(): void {
    closeRow();

    onDelete();
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
        translateX.stopAnimation((value) => {
          gestureStartX.current = value;
        });
      },

      onPanResponderMove: (_, gesture) => {
        const proposed = gestureStartX.current + gesture.dx;

        const clamped = Math.max(-ACTION_WIDTH, Math.min(ACTION_WIDTH, proposed));

        translateX.setValue(clamped);
      },

      onPanResponderRelease: (_, gesture) => {
        const current = gestureStartX.current + gesture.dx;

        if (gesture.vx > 0.35 || current > SNAP_THRESHOLD) {
          snapTo(ACTION_WIDTH);

          return;
        }

        if (gesture.vx < -0.35 || current < -SNAP_THRESHOLD) {
          snapTo(-ACTION_WIDTH);

          return;
        }

        snapTo(0);
      },

      onPanResponderTerminate: () => {
        snapTo(openPosition.current);
      },

      onPanResponderTerminationRequest: () => false
    })
  ).current;

  const isPaid = expense.paidDate !== null;

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.actionContainer, styles.paymentAction]}>
        <Pressable
          onPress={handlePayment}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name={isPaid ? "arrow-undo" : "checkmark"} size={28} color="#FFFFFF" />

          <Text style={styles.actionText} numberOfLines={1}>
            {isPaid ? "Desmarcar" : "Pagar"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.actionContainer, styles.deleteAction]}>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name="trash-outline" size={26} color="#FFFFFF" />

          <Text style={styles.actionText}>Excluir</Text>
        </Pressable>
      </View>

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

  actionContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH
  },

  paymentAction: {
    left: 0,
    backgroundColor: theme.colors.success
  },

  deleteAction: {
    right: 0,
    backgroundColor: theme.colors.danger
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
