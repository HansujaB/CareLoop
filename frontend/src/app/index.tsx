import { Redirect } from "expo-router";
import { useSession } from "@/context/SessionContext";

export default function Index() {
  const { hasOnboarded, role } = useSession();

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
