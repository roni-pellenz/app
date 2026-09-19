import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/authentication/auth.context";
import { AccountMenuCard, type AccountMenuCardItem } from "@/components/account/account-menu-card";
import { AccountProfileCard } from "@/components/account/account-profile-card";
import { theme } from "@/theme/theme";

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  const settingsItems: AccountMenuCardItem[] = [
    {
      key: "profile",
      icon: "person-outline",
      title: "Meus dados",
      subtitle: "Nome, e-mail e informações pessoais"
    },
    {
      key: "security",
      icon: "shield-checkmark-outline",
      title: "Segurança",
      subtitle: "Senha e autenticação"
    },
    {
      key: "preferences",
      icon: "settings-outline",
      title: "Preferências",
      subtitle: "Moeda, data e configurações do app"
    },
    {
      key: "notifications",
      icon: "notifications-outline",
      title: "Notificações",
      subtitle: "Lembretes de vencimentos e resumos"
    }
  ];

  const supportItems: AccountMenuCardItem[] = [
    {
      key: "terms",
      icon: "document-text-outline",
      title: "Termos de uso"
    },
    {
      key: "logout",
      icon: "log-out-outline",
      title: "Sair",
      onPress: () => {
        void signOut();
      }
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[theme.colors.backgroundTop, theme.colors.backgroundBottom]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Conta</Text>

            <Text style={styles.subtitle}>Gerencie seus dados e preferências.</Text>
          </View>

          <View style={styles.profileContainer}>
            <AccountProfileCard
              name={user?.name ?? ""}
              surname={user?.surname ?? ""}
              email={user?.email ?? ""}
            />
          </View>

          <View style={styles.sectionContainer}>
            <AccountMenuCard items={settingsItems} />
          </View>

          <View style={styles.sectionContainer}>
            <AccountMenuCard items={supportItems} />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 94
  },

  header: {
    paddingHorizontal: 1
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -1.1,
    color: theme.colors.text
  },

  subtitle: {
    marginTop: 3,
    fontSize: 16,
    lineHeight: 21,
    color: "#49678F"
  },

  profileContainer: {
    marginTop: 18
  },

  sectionContainer: {
    marginTop: 14
  }
});
