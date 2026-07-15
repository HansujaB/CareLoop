import { Stack } from "expo-router";

export default function CaregiverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="c/[token]" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
