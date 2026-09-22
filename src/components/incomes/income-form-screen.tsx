import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { DateInput } from "@/components/forms/date-input";
import {
  createIncome,
  createRecurringIncome,
  updateIncome,
  updateRecurringIncome
} from "@/income/income.api";
import type { IncomeDetail, IncomeRecurrenceDetail } from "@/income/income.types";
import { getApiErrorMessage } from "@/lib/api";
import { parseMonthYear } from "@/lib/date-input";
import { formatCompetence, formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type FormMode = "create" | "edit";

type IncomeFrequency = "one-off" | "recurring";

type IncomeFormScreenProps = {
  mode: FormMode;
  competence: string;
  initialIncome?: IncomeDetail;
  onCancel: () => void;
  onSaved: () => void;
};

export function IncomeFormScreen({
  mode,
  competence,
  initialIncome,
  onCancel,
  onSaved
}: IncomeFormScreenProps) {
  const { token } = useAuth();

  const initialRecurrence = initialIncome?.recurrence;

  const initialFrequency: IncomeFrequency = initialRecurrence ? "recurring" : "one-off";

  const initialEndCompetence = initialRecurrence?.endCompetence
    ? formatIsoCompetenceForInput(initialRecurrence.endCompetence)
    : "";

  const initialReceiptDay = getInitialReceiptDay(initialIncome, initialRecurrence);

  const [frequency, setFrequency] = useState<IncomeFrequency>(initialFrequency);

  const [name, setName] = useState(initialIncome?.name ?? "");

  const [amount, setAmount] = useState(initialIncome?.amount ?? 0);

  const [receiptDay, setReceiptDay] = useState(initialReceiptDay);

  const [endCompetence, setEndCompetence] = useState(initialEndCompetence);

  const [saving, setSaving] = useState(false);

  function selectFrequency(nextFrequency: IncomeFrequency): void {
    if (mode === "edit") {
      return;
    }

    setFrequency(nextFrequency);
  }

  async function executeSave(action: () => Promise<unknown>): Promise<void> {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      await action();

      onSaved();
    } catch (error) {
      Alert.alert("Não foi possível salvar", getApiErrorMessage(error, "Tente novamente."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(): Promise<void> {
    if (!token || saving) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Nome obrigatório", "Informe o nome da receita.");

      return;
    }

    if (trimmedName.length > 150) {
      Alert.alert("Nome muito longo", "O nome da receita deve ter no máximo 150 caracteres.");

      return;
    }

    if (amount < 1) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");

      return;
    }

    const numericReceiptDay = Number(receiptDay);

    if (!Number.isInteger(numericReceiptDay) || numericReceiptDay < 1 || numericReceiptDay > 31) {
      Alert.alert("Recebimento inválido", "Informe um dia entre 1 e 31.");

      return;
    }

    if (frequency === "recurring") {
      const parsedEndCompetence = endCompetence.trim() ? parseMonthYear(endCompetence) : null;

      if (endCompetence.trim() && !parsedEndCompetence) {
        Alert.alert("Competência inválida", "Selecione uma competência final válida.");

        return;
      }

      const referenceCompetence = initialIncome ? initialIncome.competence.slice(0, 7) : competence;

      if (parsedEndCompetence && parsedEndCompetence < referenceCompetence) {
        Alert.alert("Competência inválida", "A competência final não pode ser anterior à receita.");

        return;
      }

      if (mode === "create") {
        await executeSave(() =>
          createRecurringIncome(token, {
            name: trimmedName,
            amount,
            receiptDay: numericReceiptDay,
            startCompetence: competence,
            ...(parsedEndCompetence && {
              endCompetence: parsedEndCompetence
            })
          })
        );

        return;
      }

      if (!initialIncome) {
        return;
      }

      const endCompetenceChanged = endCompetence !== initialEndCompetence;

      if (endCompetenceChanged) {
        Alert.alert(
          "Alteração da recorrência",
          'Você alterou "Repetir até". Essa alteração afeta a recorrência e só pode ser aplicada a esta e às próximas receitas.',
          [
            {
              text: "Esta e as próximas",
              onPress: () => {
                void saveThisAndFuture(
                  token,
                  initialIncome,
                  trimmedName,
                  amount,
                  numericReceiptDay,
                  parsedEndCompetence
                );
              }
            },
            {
              text: "Cancelar",
              style: "cancel"
            }
          ]
        );

        return;
      }

      Alert.alert(
        "Aplicar alterações",
        "Esta receita faz parte de uma recorrência. Onde deseja aplicar as alterações?",
        [
          {
            text: "Somente esta receita",
            onPress: () => {
              void saveOnlyThisOccurrence(
                token,
                initialIncome,
                trimmedName,
                amount,
                numericReceiptDay
              );
            }
          },
          {
            text: "Esta e as próximas",
            onPress: () => {
              void saveThisAndFuture(
                token,
                initialIncome,
                trimmedName,
                amount,
                numericReceiptDay,
                parsedEndCompetence
              );
            }
          },
          {
            text: "Cancelar",
            style: "cancel"
          }
        ]
      );

      return;
    }

    const targetCompetence = initialIncome ? initialIncome.competence.slice(0, 7) : competence;

    const expectedDate = createDateForCompetence(targetCompetence, numericReceiptDay);

    if (mode === "create") {
      await executeSave(() =>
        createIncome(token, {
          name: trimmedName,
          amount,
          competence: targetCompetence,
          expectedDate
        })
      );

      return;
    }

    if (!initialIncome) {
      return;
    }

    await executeSave(() =>
      updateIncome(token, initialIncome.id, {
        name: trimmedName,
        amount,
        expectedDate
      })
    );
  }

  async function saveOnlyThisOccurrence(
    currentToken: string,
    income: IncomeDetail,
    currentName: string,
    currentAmount: number,
    currentReceiptDay: number
  ): Promise<void> {
    const currentCompetence = income.competence.slice(0, 7);

    const expectedDate = createDateForCompetence(currentCompetence, currentReceiptDay);

    await executeSave(() =>
      updateIncome(currentToken, income.id, {
        name: currentName,
        amount: currentAmount,
        expectedDate
      })
    );
  }

  async function saveThisAndFuture(
    currentToken: string,
    income: IncomeDetail,
    currentName: string,
    currentAmount: number,
    currentReceiptDay: number,
    currentEndCompetence: string | null
  ): Promise<void> {
    await executeSave(() =>
      updateRecurringIncome(currentToken, income.id, {
        name: currentName,
        amount: currentAmount,
        receiptDay: currentReceiptDay,
        endCompetence: currentEndCompetence
      })
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable onPress={onCancel}>
              <Text style={styles.headerAction}>Cancelar</Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              {mode === "create" ? "Nova receita" : "Editar receita"}
            </Text>

            <Pressable
              onPress={() => {
                void handleSave();
              }}
              disabled={saving}
            >
              <Text
                style={[
                  styles.headerAction,
                  styles.headerActionRight,
                  saving && styles.headerActionDisabled
                ]}
              >
                Salvar
              </Text>
            </Pressable>
          </View>

          <View style={styles.segmented}>
            <Pressable
              disabled={mode === "edit"}
              onPress={() => {
                selectFrequency("one-off");
              }}
              style={[
                styles.segment,
                frequency === "one-off" && styles.segmentSelected,
                mode === "edit" && frequency !== "one-off" && styles.segmentDisabled
              ]}
            >
              <Text
                style={[styles.segmentText, frequency === "one-off" && styles.segmentTextSelected]}
              >
                Pontual
              </Text>
            </Pressable>

            <Pressable
              disabled={mode === "edit"}
              onPress={() => {
                selectFrequency("recurring");
              }}
              style={[
                styles.segment,
                frequency === "recurring" && styles.segmentSelected,
                mode === "edit" && frequency !== "recurring" && styles.segmentDisabled
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  frequency === "recurring" && styles.segmentTextSelected
                ]}
              >
                Recorrente
              </Text>
            </Pressable>
          </View>

          <FieldLabel>Nome da receita</FieldLabel>

          <View style={styles.inputBox}>
            <Ionicons
              name={frequency === "recurring" ? "briefcase-outline" : "star-outline"}
              size={23}
              color="#F28A00"
            />

            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={150}
              placeholder="Nome da receita"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.inputWithIcon]}
            />
          </View>

          <FieldLabel>Valor</FieldLabel>

          <TextInput
            value={formatMoney(amount)}
            onChangeText={(value) => {
              setAmount(parseMoneyInput(value));
            }}
            keyboardType="number-pad"
            style={[styles.inputBox, styles.moneyInput]}
          />

          <FieldLabel>Dia do recebimento</FieldLabel>

          <View style={styles.inputBox}>
            <Ionicons name="calendar-outline" size={22} color="#526D94" />

            <TextInput
              value={receiptDay}
              onChangeText={(value) => {
                setReceiptDay(value.replace(/\D/g, "").slice(0, 2));
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="Dia"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.inputWithIcon]}
            />
          </View>

          <Text style={styles.helper}>
            Em meses mais curtos, o dia será ajustado para o último dia do mês.
          </Text>

          <FieldLabel>Competência</FieldLabel>

          <ReadOnlyBox text={formatCompetence(competence)} />

          <Text style={styles.helper}>
            Refere-se ao período da receita e permanece separado da data de recebimento.
          </Text>

          {frequency === "recurring" ? (
            <>
              <FieldLabel>Frequência</FieldLabel>

              <ReadOnlyBox text="Mensal" />

              <FieldLabel>Repetir até</FieldLabel>

              <DateInput mode="month-year" value={endCompetence} onChangeText={setEndCompetence} />

              <Text style={styles.helper}>Deixe em branco para uma receita sem data final.</Text>
            </>
          ) : null}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function ReadOnlyBox({ text }: { text: string }) {
  return (
    <View style={[styles.inputBox, styles.lockedField]}>
      <Text style={styles.selectText}>{text}</Text>
    </View>
  );
}

function getInitialReceiptDay(
  income: IncomeDetail | undefined,
  recurrence: IncomeRecurrenceDetail | null | undefined
): string {
  if (!income) {
    return "";
  }

  const actualDay = Number(income.expectedDate.slice(8, 10));

  if (!recurrence || !Number.isInteger(actualDay)) {
    return Number.isInteger(actualDay) ? String(actualDay) : "";
  }

  const competence = income.competence.slice(0, 7);

  const expectedRecurringDate = createDateForCompetence(competence, recurrence.receiptDay);

  if (expectedRecurringDate === income.expectedDate.slice(0, 10)) {
    return String(recurrence.receiptDay);
  }

  return String(actualDay);
}

function parseMoneyInput(value: string): number {
  const digits = value.replace(/\D/g, "");

  return digits ? Number(digits) : 0;
}

function createDateForCompetence(competence: string, requestedDay: number): string {
  const [yearText, monthText] = competence.split("-");

  const year = Number(yearText);

  const month = Number(monthText);

  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const day = Math.min(requestedDay, lastDay);

  return `${competence}-${String(day).padStart(2, "0")}`;
}

function formatIsoCompetenceForInput(value: string): string {
  const competence = value.slice(0, 7);

  const [year, month] = competence.split("-");

  if (!year || !month) {
    return "";
  }

  return `${month}/${year}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundTop
  },

  gradient: {
    flex: 1
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8
  },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text
  },

  headerAction: {
    minWidth: 62,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary
  },

  headerActionRight: {
    textAlign: "right"
  },

  headerActionDisabled: {
    opacity: 0.45
  },

  segmented: {
    height: 52,
    flexDirection: "row",
    marginTop: 14,
    marginBottom: 26,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: "#F0F4FA"
  },

  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  segmentSelected: {
    backgroundColor: theme.colors.primarySoft
  },

  segmentDisabled: {
    opacity: 0.55
  },

  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#526D94"
  },

  segmentTextSelected: {
    color: theme.colors.primary
  },

  fieldLabel: {
    marginTop: 17,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#344B70"
  },

  inputBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C9D8EA",
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.62)"
  },

  lockedField: {
    backgroundColor: "rgba(244,247,251,0.8)"
  },

  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "#07143A"
  },

  inputWithIcon: {
    marginLeft: 12
  },

  moneyInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#07143A"
  },

  selectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#07143A"
  },

  helper: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: "#63799A"
  },

  bottomSpacer: {
    height: 44
  }
});
