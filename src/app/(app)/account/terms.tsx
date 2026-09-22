import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppTheme } from "@/theme/theme";
import { useAppTheme } from "@/theme/theme.context";

export default function TermsScreen() {
  const { theme } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.navigation}>
            <Pressable
              onPress={() => {
                router.back();
              }}
              hitSlop={10}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={27} color={theme.colors.primary} />

              <Text style={styles.backText}>Conta</Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <View style={styles.heroIcon}>
              <Ionicons name="document-text-outline" size={35} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>Termos de uso</Text>

            <Text style={styles.subtitle}>Condições para utilização do Finance.</Text>

            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Atualizado em 20 de setembro de 2026</Text>
            </View>
          </View>

          <View style={styles.introCard}>
            <Ionicons name="information-circle-outline" size={23} color={theme.colors.primary} />

            <Text style={styles.introText}>
              Ao utilizar o Finance, você concorda com estes termos. Leia as condições abaixo antes
              de continuar utilizando o aplicativo.
            </Text>
          </View>

          <View style={styles.termsCard}>
            <TermsSection number="1" title="Sobre o Finance">
              O Finance é uma ferramenta de organização e planejamento financeiro pessoal. O
              aplicativo permite registrar receitas, despesas, recorrências, parcelamentos,
              pagamentos e outras informações relacionadas ao seu planejamento mensal.
            </TermsSection>

            <Divider />

            <TermsSection number="2" title="Sua conta">
              Você é responsável por manter suas credenciais de acesso em segurança e por fornecer
              informações corretas ao utilizar o aplicativo. Não compartilhe sua senha ou outros
              dados de acesso com terceiros.
            </TermsSection>

            <Divider />

            <TermsSection number="3" title="Informações financeiras">
              Os cálculos, saldos, projeções e indicadores exibidos pelo Finance são baseados nas
              informações cadastradas por você. Dados incompletos, incorretos ou desatualizados
              podem produzir resultados diferentes da sua situação financeira real.
            </TermsSection>

            <Divider />

            <TermsSection number="4" title="Decisões financeiras">
              O Finance auxilia na organização das suas informações, mas as decisões tomadas a
              partir delas são de sua responsabilidade. O aplicativo não substitui orientação
              profissional específica quando ela for necessária.
            </TermsSection>

            <Divider />

            <TermsSection number="5" title="Notificações e lembretes">
              Os lembretes de vencimento são recursos auxiliares e dependem das permissões e do
              funcionamento do sistema operacional do aparelho. Você continua responsável por
              acompanhar os vencimentos das suas despesas mesmo quando uma notificação não for
              exibida.
            </TermsSection>

            <Divider />

            <TermsSection number="6" title="Uso adequado">
              Você não deve utilizar o Finance para tentar acessar contas de terceiros, comprometer
              a segurança do serviço, explorar vulnerabilidades ou praticar atividades contrárias à
              legislação aplicável.
            </TermsSection>

            <Divider />

            <TermsSection number="7" title="Disponibilidade">
              Podemos realizar ajustes, correções, melhorias e atualizações no aplicativo. Alguns
              recursos podem ficar temporariamente indisponíveis durante períodos de manutenção ou
              em situações fora do nosso controle.
            </TermsSection>

            <Divider />

            <TermsSection number="8" title="Exclusão da conta">
              Você pode utilizar a opção disponível em Meus dados para excluir sua conta. A exclusão
              é uma ação definitiva e pode impedir a recuperação posterior das informações
              vinculadas à conta.
            </TermsSection>

            <Divider />

            <TermsSection number="9" title="Alterações destes termos">
              Estes termos poderão ser atualizados para acompanhar mudanças no aplicativo, nos
              recursos oferecidos ou em requisitos aplicáveis. A versão mais recente ficará
              disponível nesta área.
            </TermsSection>
          </View>

          <Text style={styles.footer}>Finance · Planejamento financeiro pessoal</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

type TermsSectionProps = {
  number: string;
  title: string;
  children: string;
};

function TermsSection({ number, title, children }: TermsSectionProps) {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>{number}</Text>
        </View>

        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

function Divider() {
  const { theme } = useAppTheme();

  const styles = createStyles(theme);

  return <View style={styles.divider} />;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.backgroundTop
    },

    gradient: {
      flex: 1
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 38
    },

    navigation: {
      height: 48,
      flexDirection: "row",
      alignItems: "center"
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center"
    },

    backText: {
      marginLeft: -3,
      fontSize: 17,
      fontWeight: "600",
      color: theme.colors.primary
    },

    header: {
      alignItems: "center",
      marginTop: 22
    },

    heroIcon: {
      width: 78,
      height: 78,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 23,
      backgroundColor: theme.colors.primarySoft
    },

    title: {
      marginTop: 14,
      fontSize: 27,
      lineHeight: 33,
      fontWeight: "800",
      letterSpacing: -0.8,
      color: theme.colors.text
    },

    subtitle: {
      marginTop: 5,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      color: theme.colors.textSecondary
    },

    versionBadge: {
      marginTop: 11,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface
    },

    versionText: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "600",
      color: theme.colors.textMuted
    },

    introCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 25,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 18,
      padding: 15,
      backgroundColor: theme.colors.primarySoft
    },

    introText: {
      flex: 1,
      marginLeft: 11,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.textSecondary
    },

    termsCard: {
      overflow: "hidden",
      marginTop: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      ...theme.shadow.card
    },

    section: {
      paddingHorizontal: 17,
      paddingVertical: 18
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center"
    },

    sectionNumber: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: theme.colors.primarySoft
    },

    sectionNumberText: {
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "800",
      color: theme.colors.primary
    },

    sectionTitle: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
      color: theme.colors.text
    },

    sectionText: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 17,
      backgroundColor: theme.colors.border
    },

    footer: {
      marginTop: 20,
      fontSize: 11,
      lineHeight: 16,
      textAlign: "center",
      color: theme.colors.textMuted
    }
  });
}
