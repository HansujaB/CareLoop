import { Stack } from "expo-router";

export default function CaregiverTabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="handover" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="emergency" />
    </Stack>
  );
}
