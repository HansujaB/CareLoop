import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "@/context/SessionContext";
import { colors } from "@/constants/theme";

export default function Index() {
  const { hasOnboarded, role, authLoading } = useSession();

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (role === "admin") {
    return <Redirect href="/(admin)" />;
  }

  if (role === "caregiver") {
    return <Redirect href="/(caregiver)/welcome" />;
  }

  return <Redirect href="/(auth)/login" />;
}
