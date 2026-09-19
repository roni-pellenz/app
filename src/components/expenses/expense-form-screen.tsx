import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { DateInput } from "@/components/forms/date-input";
import {
  createExpense,
  createInstallmentExpense,
  createRecurringExpense,
  updateExpense,
  updateInstallmentPlan,
  updateRecurringExpense
} from "@/expense/expense.api";
import { getExpenseAppearance } from "@/expense/expense.appearance";
import type { ExpenseDetail } from "@/expense/expense.types";
import { getApiErrorMessage } from "@/lib/api";
import { parseBrazilianDate, parseMonthYear } from "@/lib/date-input";
import { formatMoney } from "@/lib/format";
import { theme } from "@/theme/theme";

type FormMode = "create" | "edit";

type FormType = "common" | "installment";

type CommonFrequency = "one-off" | "recurring";

type ExpenseFormScreenProps = {
  mode: FormMode;
  competence: string;
  initialExpense?: ExpenseDetail;
  onCancel: () => void;
  onSaved: () => void;
};

export function ExpenseFormScreen({
  mode,
  competence,
  initialExpense,
  onCancel,
  onSaved
}: ExpenseFormScreenProps) {
  const { token } = useAuth();

  const initialPlan = initialExpense?.installmentPlan;

  const initialRecurrence = initialExpense?.recurrence;

  const initialType: FormType = initialPlan ? "installment" : "common";

  const initialFrequency: CommonFrequency = initialRecurrence ? "recurring" : "one-off";

  const initialEndCompetence = initialRecurrence?.endCompetence
    ? formatIsoCompetenceForInput(initialRecurrence.endCompetence)
    : "";

  const [formType, setFormType] = useState<FormType>(initialType);

  const [frequency, setFrequency] = useState<CommonFrequency>(initialFrequency);

  const [name, setName] = useState(initialPlan?.name ?? initialExpense?.name ?? "");

  const [amount, setAmount] = useState(initialPlan?.totalAmount ?? initialExpense?.amount ?? 0);

  const [dueDay, setDueDay] = useState(
    initialExpense ? String(Number(initialExpense.dueDate.slice(8, 10))) : ""
  );

  const [paymentDay, setPaymentDay] = useState(
    initialExpense?.plannedPaymentDate
      ? String(Number(initialExpense.plannedPaymentDate.slice(8, 10)))
      : ""
  );

  const [endCompetence, setEndCompetence] = useState(initialEndCompetence);

  const [installments, setInstallments] = useState(
    initialPlan ? String(initialPlan.installments) : "2"
  );

  const [purchaseDate, setPurchaseDate] = useState(
    initialPlan ? formatIsoDateForInput(initialPlan.purchaseDate) : ""
  );

  const [firstInstallmentDate, setFirstInstallmentDate] = useState(
    initialPlan ? formatIsoDateForInput(initialPlan.firstInstallmentDate) : ""
  );

  const [saving, setSaving] = useState(false);

  const appearance = getExpenseAppearance(name || "despesa");

  const installmentPreview = useMemo(() => {
    const count = Number(installments);

    if (!Number.isInteger(count) || count < 1 || amount < 1) {
      return {
        firstAmount: 0,
        hasRemainder: false
      };
    }

    const baseAmount = Math.floor(amount / count);

    const remainder = amount % count;

    return {
      firstAmount: baseAmount + (remainder > 0 ? 1 : 0),
      hasRemainder: remainder > 0
    };
  }, [amount, installments]);

  function selectFormType(nextType: FormType): void {
    if (mode === "edit") {
      return;
    }

    setFormType(nextType);
  }

  function chooseFrequency(): void {
    if (mode === "edit") {
      return;
    }

    Alert.alert("Frequência", "Como essa despesa deve ser lançada?", [
      {
        text: "Pontual",
        onPress: () => {
          setFrequency("one-off");
        }
      },
      {
        text: "Mensal",
        onPress: () => {
          setFrequency("recurring");
        }
      },
      {
        text: "Cancelar",
        style: "cancel"
      }
    ]);
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
      Alert.alert("Nome obrigatório", "Informe o nome da despesa.");

      return;
    }

    if (amount < 1) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");

      return;
    }

    if (formType === "installment") {
      const installmentCount = Number(installments);

      if (!Number.isInteger(installmentCount) || installmentCount < 2) {
        Alert.alert("Parcelas inválidas", "Informe pelo menos 2 parcelas.");

        return;
      }

      const parsedPurchaseDate = parseBrazilianDate(purchaseDate);

      const parsedFirstDate = parseBrazilianDate(firstInstallmentDate);

      if (!parsedPurchaseDate || !parsedFirstDate) {
        Alert.alert("Data inválida", "Selecione a data da compra e a primeira parcela.");

        return;
      }

      if (mode === "create") {
        await executeSave(() =>
          createInstallmentExpense(token, {
            name: trimmedName,
            totalAmount: amount,
            installments: installmentCount,
            purchaseDate: parsedPurchaseDate,
            firstInstallmentDate: parsedFirstDate
          })
        );

        return;
      }

      if (!initialExpense) {
        return;
      }

      await executeSave(() =>
        updateInstallmentPlan(token, initialExpense.id, {
          name: trimmedName,
          totalAmount: amount,
          installments: installmentCount,
          purchaseDate: parsedPurchaseDate,
          firstInstallmentDate: parsedFirstDate
        })
      );

      return;
    }

    const numericDueDay = Number(dueDay);

    if (!Number.isInteger(numericDueDay) || numericDueDay < 1 || numericDueDay > 31) {
      Alert.alert("Vencimento inválido", "Informe um dia entre 1 e 31.");

      return;
    }

    const numericPaymentDay = paymentDay.trim() ? Number(paymentDay) : null;

    if (
      numericPaymentDay !== null &&
      (!Number.isInteger(numericPaymentDay) || numericPaymentDay < 1 || numericPaymentDay > 31)
    ) {
      Alert.alert("Pagamento inválido", "Informe um dia entre 1 e 31.");

      return;
    }

    if (frequency === "recurring") {
      const parsedEnd = endCompetence.trim() ? parseMonthYear(endCompetence) : null;

      if (endCompetence.trim() && !parsedEnd) {
        Alert.alert("Competência inválida", "Selecione uma competência final válida.");

        return;
      }

      if (mode === "create") {
        await executeSave(() =>
          createRecurringExpense(token, {
            name: trimmedName,
            amount,
            dueDay: numericDueDay,
            ...(numericPaymentDay !== null && {
              plannedPaymentDay: numericPaymentDay
            }),
            startCompetence: competence,
            ...(parsedEnd && {
              endCompetence: parsedEnd
            })
          })
        );

        return;
      }

      if (!initialExpense) {
        return;
      }

      const endCompetenceChanged = endCompetence !== initialEndCompetence;

      if (endCompetenceChanged) {
        Alert.alert(
          "Alteração da recorrência",
          'Você alterou "Repetir até". Essa alteração afeta a recorrência e só pode ser aplicada a esta e às próximas despesas.',
          [
            {
              text: "Esta e as próximas",
              onPress: () => {
                void saveThisAndFuture(
                  token,
                  initialExpense,
                  trimmedName,
                  amount,
                  numericDueDay,
                  numericPaymentDay,
                  parsedEnd
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
        "Esta despesa faz parte de uma recorrência. Onde deseja aplicar as alterações?",
        [
          {
            text: "Somente esta despesa",
            onPress: () => {
              void saveOnlyThisOccurrence(
                token,
                initialExpense,
                trimmedName,
                amount,
                numericDueDay,
                numericPaymentDay
              );
            }
          },
          {
            text: "Esta e as próximas",
            onPress: () => {
              void saveThisAndFuture(
                token,
                initialExpense,
                trimmedName,
                amount,
                numericDueDay,
                numericPaymentDay,
                parsedEnd
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

    const targetCompetence = initialExpense ? initialExpense.competence.slice(0, 7) : competence;

    const dueDate = createDateForCompetence(targetCompetence, numericDueDay);

    const plannedPaymentDate =
      numericPaymentDay === null
        ? null
        : createDateForCompetence(targetCompetence, numericPaymentDay);

    if (mode === "create") {
      await executeSave(() =>
        createExpense(token, {
          name: trimmedName,
          amount,
          competence: targetCompetence,
          dueDate,
          ...(plannedPaymentDate && {
            plannedPaymentDate
          })
        })
      );

      return;
    }

    if (!initialExpense) {
      return;
    }

    await executeSave(() =>
      updateExpense(token, initialExpense.id, {
        name: trimmedName,
        amount,
        dueDate,
        plannedPaymentDate
      })
    );
  }

  async function saveOnlyThisOccurrence(
    currentToken: string,
    expense: ExpenseDetail,
    currentName: string,
    currentAmount: number,
    currentDueDay: number,
    currentPaymentDay: number | null
  ): Promise<void> {
    const currentCompetence = expense.competence.slice(0, 7);

    const dueDate = createDateForCompetence(currentCompetence, currentDueDay);

    const plannedPaymentDate =
      currentPaymentDay === null
        ? null
        : createDateForCompetence(currentCompetence, currentPaymentDay);

    await executeSave(() =>
      updateExpense(currentToken, expense.id, {
        name: currentName,
        amount: currentAmount,
        dueDate,
        plannedPaymentDate
      })
    );
  }

  async function saveThisAndFuture(
    currentToken: string,
    expense: ExpenseDetail,
    currentName: string,
    currentAmount: number,
    currentDueDay: number,
    currentPaymentDay: number | null,
    currentEndCompetence: string | null
  ): Promise<void> {
    await executeSave(() =>
      updateRecurringExpense(currentToken, expense.id, {
        name: currentName,
        amount: currentAmount,
        dueDay: currentDueDay,
        plannedPaymentDay: currentPaymentDay,
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
              {mode === "create" ? "Nova despesa" : "Editar despesa"}
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
                selectFormType("common");
              }}
              style={[
                styles.segment,
                formType === "common" && styles.segmentSelected,
                mode === "edit" && formType !== "common" && styles.segmentDisabled
              ]}
            >
              <Text
                style={[styles.segmentText, formType === "common" && styles.segmentTextSelected]}
              >
                Despesa comum
              </Text>
            </Pressable>

            <Pressable
              disabled={mode === "edit"}
              onPress={() => {
                selectFormType("installment");
              }}
              style={[
                styles.segment,
                formType === "installment" && styles.segmentSelected,
                mode === "edit" && formType !== "installment" && styles.segmentDisabled
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  formType === "installment" && styles.segmentTextSelected
                ]}
              >
                Despesa parcelada
              </Text>
            </Pressable>
          </View>

          <FieldLabel>Nome da despesa</FieldLabel>

          <View style={styles.inputBox}>
            <Ionicons name={appearance.icon} size={24} color={theme.colors.primary} />

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome da despesa"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, styles.inputWithIcon]}
            />
          </View>

          <FieldLabel>{formType === "installment" ? "Valor total" : "Valor"}</FieldLabel>

          <TextInput
            value={formatMoney(amount)}
            onChangeText={(value) => {
              setAmount(parseMoneyInput(value));
            }}
            keyboardType="number-pad"
            style={[styles.inputBox, styles.moneyInput]}
          />

          {formType === "common" ? (
            <>
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <FieldLabel>Vencimento</FieldLabel>

                  <View style={styles.inputBox}>
                    <Ionicons name="calendar-outline" size={22} color="#526D94" />

                    <TextInput
                      value={dueDay}
                      onChangeText={(value) => {
                        setDueDay(value.replace(/\D/g, "").slice(0, 2));
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="Dia"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[styles.input, styles.inputWithIcon]}
                    />
                  </View>
                </View>

                <View style={styles.column}>
                  <FieldLabel>Pagamento (opcional)</FieldLabel>

                  <View style={styles.inputBox}>
                    <Ionicons name="calendar-outline" size={22} color="#526D94" />

                    <TextInput
                      value={paymentDay}
                      onChangeText={(value) => {
                        setPaymentDay(value.replace(/\D/g, "").slice(0, 2));
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="Dia"
                      placeholderTextColor={theme.colors.textMuted}
                      style={[styles.input, styles.inputWithIcon]}
                    />
                  </View>
                </View>
              </View>

              <FieldLabel>Competência</FieldLabel>

              <ReadOnlyBox text="Mesmo mês do vencimento" />

              <Text style={styles.helper}>Refere-se ao período da despesa.</Text>

              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <FieldLabel>Frequência</FieldLabel>

                  <Pressable
                    disabled={mode === "edit"}
                    onPress={chooseFrequency}
                    style={[styles.inputBox, mode === "edit" && styles.lockedField]}
                  >
                    <Text style={styles.selectText}>
                      {frequency === "recurring" ? "Mensal" : "Pontual"}
                    </Text>

                    {mode === "create" ? (
                      <Ionicons name="chevron-down" size={20} color="#526D94" />
                    ) : null}
                  </Pressable>
                </View>

                {frequency === "recurring" ? (
                  <View style={styles.column}>
                    <FieldLabel>Repetir até</FieldLabel>

                    <DateInput
                      mode="month-year"
                      value={endCompetence}
                      onChangeText={setEndCompetence}
                      showIcon={false}
                    />
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <>
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <FieldLabel>Quantidade de parcelas</FieldLabel>

                  <TextInput
                    value={installments}
                    onChangeText={(value) => {
                      setInstallments(value.replace(/\D/g, "").slice(0, 3));
                    }}
                    keyboardType="number-pad"
                    style={[styles.inputBox, styles.plainInput]}
                  />
                </View>

                <View style={styles.column}>
                  <FieldLabel>Valor da 1ª parcela</FieldLabel>

                  <ReadOnlyBox text={formatMoney(installmentPreview.firstAmount)} />
                </View>
              </View>

              {installmentPreview.hasRemainder ? (
                <Text style={styles.installmentHelper}>
                  Algumas parcelas podem variar R$ 0,01 para fechar exatamente o valor total.
                </Text>
              ) : null}

              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <FieldLabel>Data da compra</FieldLabel>

                  <DateInput mode="date" value={purchaseDate} onChangeText={setPurchaseDate} />
                </View>

                <View style={styles.column}>
                  <FieldLabel>Primeira parcela</FieldLabel>

                  <DateInput
                    mode="date"
                    value={firstInstallmentDate}
                    onChangeText={setFirstInstallmentDate}
                  />
                </View>
              </View>

              <FieldLabel>Competência</FieldLabel>

              <ReadOnlyBox text="Mesmo mês do vencimento" />

              <Text style={styles.helper}>
                Cada parcela será lançada na competência correspondente ao seu vencimento.
              </Text>
            </>
          )}

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
    <View style={styles.inputBox}>
      <Text style={styles.selectText}>{text}</Text>
    </View>
  );
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

function formatIsoDateForInput(value: string): string {
  const date = value.slice(0, 10);

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
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

  plainInput: {
    fontSize: 16,
    color: "#07143A"
  },

  selectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#07143A"
  },

  twoColumns: {
    flexDirection: "row",
    gap: 12
  },

  column: {
    flex: 1,
    minWidth: 0
  },

  helper: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: "#63799A"
  },

  installmentHelper: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: "#63799A"
  },

  bottomSpacer: {
    height: 44
  }
});
