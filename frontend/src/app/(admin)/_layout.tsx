import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="memory" />
      <Stack.Screen name="links" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="create-profile" />
      <Stack.Screen name="handover" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="upload" />
    </Stack>
  );
}
