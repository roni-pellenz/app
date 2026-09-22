import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  EXPENSE_CATEGORY_OPTIONS,
  getExpenseCategoryLabel,
  getExpenseCategoryOption
} from "@/expense/expense.appearance";
import {
  EXPENSE_NOTIFICATION_OPTIONS,
  formatExpenseNotification
} from "@/expense/expense.metadata";
import type { ExpenseCategory } from "@/expense/expense.types";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

type SelectorMode = "category" | "notification" | null;

type ExpenseMetadataFieldsProps = {
  category: ExpenseCategory | null;
  onCategoryChange: (value: ExpenseCategory | null) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  notificationDaysBefore: number | null;
  onNotificationDaysBeforeChange: (value: number | null) => void;
};

export function ExpenseMetadataFields({
  category,
  onCategoryChange,
  notes,
  onNotesChange,
  notificationDaysBefore,
  onNotificationDaysBeforeChange
}: ExpenseMetadataFieldsProps) {
  const { theme, resolvedThemeMode } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectorMode, setSelectorMode] = useState<SelectorMode>(null);

  const categoryOption = category ? getExpenseCategoryOption(category) : undefined;

  const categoryBackground =
    resolvedThemeMode === "dark"
      ? theme.colors.surfaceElevated
      : (categoryOption?.backgroundColor ?? theme.colors.primarySoft);

  function closeSelector(): void {
    setSelectorMode(null);
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Detalhes</Text>

      <Text style={styles.fieldLabel}>Categoria</Text>

      <Pressable
        onPress={() => {
          setSelectorMode("category");
        }}
        style={({ pressed }) => [styles.inputBox, pressed && styles.inputPressed]}
      >
        <View
          style={[
            styles.fieldIcon,
            {
              backgroundColor: categoryBackground
            }
          ]}
        >
          <Ionicons
            name={categoryOption?.icon ?? "pricetag-outline"}
            size={20}
            color={categoryOption?.color ?? theme.colors.primary}
          />
        </View>

        <Text style={[styles.selectText, !category && styles.placeholderText]}>
          {category ? getExpenseCategoryLabel(category) : "Selecionar categoria"}
        </Text>

        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </Pressable>

      <Text style={styles.fieldLabel}>Observações</Text>

      <View style={[styles.inputBox, styles.notesBox]}>
        <TextInput
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Adicione uma observação opcional"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          maxLength={500}
          textAlignVertical="top"
          keyboardAppearance={resolvedThemeMode}
          selectionColor={theme.colors.primary}
          style={styles.notesInput}
        />

        <Text style={styles.characterCount}>{notes.length}/500</Text>
      </View>

      <Text style={styles.fieldLabel}>Notificação</Text>

      <Pressable
        onPress={() => {
          setSelectorMode("notification");
        }}
        style={({ pressed }) => [styles.inputBox, pressed && styles.inputPressed]}
      >
        <View
          style={[
            styles.fieldIcon,
            notificationDaysBefore === null
              ? styles.notificationDisabledIcon
              : styles.notificationEnabledIcon
          ]}
        >
          <Ionicons
            name={
              notificationDaysBefore === null
                ? "notifications-off-outline"
                : "notifications-outline"
            }
            size={20}
            color={notificationDaysBefore === null ? theme.colors.textMuted : theme.colors.primary}
          />
        </View>

        <Text style={styles.selectText}>{formatExpenseNotification(notificationDaysBefore)}</Text>

        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </Pressable>

      <Text style={styles.helper}>Define quando você deseja ser lembrado antes do vencimento.</Text>

      <Modal
        transparent
        animationType="slide"
        visible={selectorMode !== null}
        onRequestClose={closeSelector}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSelector} />

          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectorMode === "category" ? "Categoria" : "Notificação"}
              </Text>

              <Pressable
                onPress={closeSelector}
                hitSlop={10}
                style={({ pressed }) => [styles.closeButton, pressed && styles.inputPressed]}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsContent}
            >
              {selectorMode === "category" ? (
                <>
                  <Pressable
                    onPress={() => {
                      onCategoryChange(null);

                      closeSelector();
                    }}
                    style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                  >
                    <View style={[styles.optionIcon, styles.noCategoryIcon]}>
                      <Ionicons name="remove-outline" size={22} color={theme.colors.textMuted} />
                    </View>

                    <Text style={styles.optionText}>Sem categoria</Text>

                    {category === null ? (
                      <Ionicons name="checkmark-circle" size={23} color={theme.colors.primary} />
                    ) : null}
                  </Pressable>

                  {EXPENSE_CATEGORY_OPTIONS.map((option) => {
                    const optionBackground =
                      resolvedThemeMode === "dark"
                        ? theme.colors.surfaceElevated
                        : option.backgroundColor;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          onCategoryChange(option.value);

                          closeSelector();
                        }}
                        style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                      >
                        <View
                          style={[
                            styles.optionIcon,
                            {
                              backgroundColor: optionBackground
                            }
                          ]}
                        >
                          <Ionicons name={option.icon} size={22} color={option.color} />
                        </View>

                        <Text style={styles.optionText}>{option.label}</Text>

                        {category === option.value ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={23}
                            color={theme.colors.primary}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </>
              ) : (
                EXPENSE_NOTIFICATION_OPTIONS.map((option) => {
                  const selected = notificationDaysBefore === option.value;

                  return (
                    <Pressable
                      key={option.value === null ? "disabled" : String(option.value)}
                      onPress={() => {
                        onNotificationDaysBeforeChange(option.value);

                        closeSelector();
                      }}
                      style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          option.value === null
                            ? styles.notificationDisabledIcon
                            : styles.notificationEnabledIcon
                        ]}
                      >
                        <Ionicons
                          name={
                            option.value === null
                              ? "notifications-off-outline"
                              : "notifications-outline"
                          }
                          size={21}
                          color={
                            option.value === null ? theme.colors.textMuted : theme.colors.primary
                          }
                        />
                      </View>

                      <Text style={styles.optionText}>{option.label}</Text>

                      {selected ? (
                        <Ionicons name="checkmark-circle" size={23} color={theme.colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    sectionTitle: {
      marginTop: 28,
      marginBottom: 2,
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text
    },

    fieldLabel: {
      marginTop: 17,
      marginBottom: 8,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },

    inputBox: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 13,
      backgroundColor: theme.colors.surface
    },

    inputPressed: {
      opacity: 0.7
    },

    fieldIcon: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10
    },

    notificationEnabledIcon: {
      backgroundColor: theme.colors.primarySoft
    },

    notificationDisabledIcon: {
      backgroundColor: theme.colors.surfaceMuted
    },

    selectText: {
      flex: 1,
      marginLeft: 11,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text
    },

    placeholderText: {
      fontWeight: "500",
      color: theme.colors.textMuted
    },

    notesBox: {
      minHeight: 116,
      alignItems: "stretch",
      paddingTop: 12,
      paddingBottom: 8
    },

    notesInput: {
      minHeight: 76,
      fontSize: 15,
      lineHeight: 20,
      color: theme.colors.text
    },

    characterCount: {
      marginTop: 4,
      fontSize: 10,
      textAlign: "right",
      color: theme.colors.textMuted
    },

    helper: {
      marginTop: 6,
      fontSize: 11,
      lineHeight: 15,
      color: theme.colors.textMuted
    },

    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: theme.colors.modalBackdrop
    },

    modalSheet: {
      maxHeight: "78%",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 30,
      backgroundColor: theme.colors.surface
    },

    modalHeader: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    modalTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: theme.colors.text
    },

    closeButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor: theme.colors.surfaceMuted
    },

    optionsContent: {
      paddingBottom: 10
    },

    optionRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border
    },

    optionPressed: {
      opacity: 0.65
    },

    optionIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11
    },

    noCategoryIcon: {
      backgroundColor: theme.colors.surfaceMuted
    },

    optionText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text
    }
  });
}
