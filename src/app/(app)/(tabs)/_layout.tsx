import { Tabs } from "expo-router";
import { AppTabBar } from "@/components/navigation/app-tab-bar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        const activeRoute = props.state.routes[props.state.index];

        return <AppTabBar activeRouteName={activeRoute?.name ?? "index"} />;
      }}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home"
        }}
      />

      <Tabs.Screen
        name="incomes"
        options={{
          title: "Receitas",
          href: null
        }}
      />

      <Tabs.Screen
        name="expenses"
        options={{
          title: "Despesas"
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Conta"
        }}
      />
    </Tabs>
  );
}
