/**
 * Deep link entry point for caregiver links.
 * Maps: careloop://c/<token>  →  this screen
 *
 * Expo Router makes the path segment available via useLocalSearchParams({ token }).
 * We grab it, store it in SessionContext, and navigate to the handover tab.
 * If the token is missing we fall back to the welcome screen (manual entry).
 */
import { useLocalSearchParams, router, Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/context/SessionContext";
import { colors } from "@/constants/theme";

export default function CaregiverTokenEntry() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { setCaregiverToken } = useSession();

  useEffect(() => {
    if (!token) {
      // No token in URL — fall back to manual welcome screen
      router.replace("/(caregiver)/welcome");
      return;
    }
    // Store token in session then navigate to the caregiver tabs
    setCaregiverToken(token);
    router.replace("/(caregiver)/(tabs)/handover");
  }, [token]);

  // Show a spinner while the effect runs (practically instant)
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
