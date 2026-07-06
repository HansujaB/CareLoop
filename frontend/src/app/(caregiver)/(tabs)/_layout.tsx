import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/ui/FloatingTabBar";

export default function CaregiverTabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="handover" options={{ title: "Briefing", tabBarIcon: () => null }} />
      <Tabs.Screen name="chat" options={{ title: "Ask", tabBarIcon: () => null }} />
      <Tabs.Screen name="emergency" options={{ title: "Emergency", tabBarIcon: () => null }} />
    </Tabs>
  );
}
