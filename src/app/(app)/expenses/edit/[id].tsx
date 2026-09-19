import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { ExpenseFormScreen } from "@/components/expenses/expense-form-screen";
import { getExpense } from "@/expense/expense.api";
import type { ExpenseDetail } from "@/expense/expense.types";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { theme } from "@/theme/theme";

export default function EditExpenseScreen() {
  const params = useLocalSearchParams<{
    id: string;
  }>();

  const { token, signOut } = useAuth();

  const [expense, setExpense] = useState<ExpenseDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      if (!token || !params.id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getExpense(token, params.id);

        if (active) {
          setExpense(result);
        }
      } catch (currentError) {
        if (currentError instanceof ApiError && currentError.status === 401) {
          await signOut();

          return;
        }

        if (active) {
          setError(getApiErrorMessage(currentError, "Não foi possível carregar a despesa."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token, params.id, signOut]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? "Despesa não encontrada."}</Text>

          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ExpenseFormScreen
      mode="edit"
      competence={expense.competence.slice(0, 7)}
      initialExpense={expense}
      onCancel={() => {
        router.back();
      }}
      onSaved={() => {
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundTop
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },

  errorText: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.textSecondary
  },

  backText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primary
  }
});
