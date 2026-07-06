import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "@/context/SessionContext";

SplashScreen.preventAutoHideAsync();

// Inter font URLs from Google Fonts CDN — works on web without @expo-google-fonts/inter
const INTER_FONTS = {
  Inter_400Regular:
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
  Inter_500Medium:
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
  Inter_600SemiBold:
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
  Inter_700Bold:
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
};

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync(INTER_FONTS)
      .catch(() => {
        // If font loading fails (e.g. offline), fall back to system fonts gracefully
      })
      .finally(() => {
        setLoaded(true);
        SplashScreen.hideAsync();
      });
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(caregiver)" />
      </Stack>
    </SessionProvider>
  );
}
