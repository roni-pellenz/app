import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { formatDateInputValue, parseDateInputValue, type DateInputMode } from "@/lib/date-input";
import { theme } from "@/theme/theme";

type DateInputProps = {
  mode: DateInputMode;
  value: string;
  onChangeText: (value: string) => void;
  showIcon?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DateInput({
  mode,
  value,
  onChangeText,
  showIcon = true,
  minimumDate,
  maximumDate
}: DateInputProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const [draftDate, setDraftDate] = useState<Date>(getInitialDate(value, mode));

  const placeholder = mode === "date" ? "DD/MM/AAAA" : "MM/AAAA";

  function openPicker(): void {
    const initialDate = getInitialDate(value, mode);

    setDraftDate(initialDate);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (event, selectedDate) => {
          if (event.type === "dismissed" || !selectedDate) {
            return;
          }

          commitDate(selectedDate);
        }
      });

      return;
    }

    setModalVisible(true);
  }

  function commitDate(date: Date): void {
    onChangeText(formatDateInputValue(date, mode));
  }

  function handleIosChange(event: DateTimePickerEvent, selectedDate?: Date): void {
    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setDraftDate(selectedDate);
  }

  function handleConfirm(): void {
    commitDate(draftDate);

    setModalVisible(false);
  }

  function handleClear(): void {
    onChangeText("");
    setModalVisible(false);
  }

  return (
    <>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
      >
        {showIcon ? <Ionicons name="calendar-outline" size={22} color="#526D94" /> : null}

        <Text
          numberOfLines={1}
          style={[styles.value, showIcon && styles.valueWithIcon, !value && styles.placeholder]}
        >
          {value || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color="#526D94" />
      </Pressable>

      {Platform.OS === "ios" && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setModalVisible(false);
            }}
          >
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
              }}
              style={styles.modalCard}
            >
              <View style={styles.modalHeader}>
                <Pressable onPress={handleClear} hitSlop={8}>
                  <Text style={styles.clearText}>Limpar</Text>
                </Pressable>

                <Text style={styles.modalTitle}>
                  {mode === "month-year" ? "Selecione o mês" : "Selecione a data"}
                </Text>

                <Pressable onPress={handleConfirm} hitSlop={8}>
                  <Text style={styles.confirmText}>OK</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                locale="pt-BR"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleIosChange}
                style={styles.picker}
              />

              {mode === "month-year" && (
                <Text style={styles.monthYearHint}>
                  O dia selecionado é ignorado. Apenas mês e ano serão utilizados.
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

function getInitialDate(value: string, mode: DateInputMode): Date {
  const parsed = parseDateInputValue(value, mode);

  return parsed ?? new Date();
}

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C9D8EA",
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.62)"
  },

  containerPressed: {
    opacity: 0.72
  },

  value: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "#07143A"
  },

  valueWithIcon: {
    marginLeft: 12
  },

  placeholder: {
    color: theme.colors.textMuted
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "rgba(10, 20, 40, 0.28)"
  },

  modalCard: {
    overflow: "hidden",
    borderRadius: 24,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface
  },

  modalHeader: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 18
  },

  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text
  },

  clearText: {
    minWidth: 62,
    fontSize: 15,
    color: theme.colors.danger
  },

  confirmText: {
    minWidth: 62,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary
  },

  picker: {
    height: 210
  },

  monthYearHint: {
    marginTop: -4,
    paddingHorizontal: 22,
    paddingBottom: 8,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: theme.colors.textMuted
  }
});
