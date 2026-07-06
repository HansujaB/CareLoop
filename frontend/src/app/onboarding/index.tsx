import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationHero } from "@/components/ui/IllustrationHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useSession } from "@/context/SessionContext";
import { colors, spacing } from "@/constants/theme";

const SLIDES = [
  {
    icon: "sparkles-outline" as const,
    title: "Care that remembers",
    subtitle:
      "Build a living memory of allergies, medications, routines, and emergency instructions — updated by voice or text.",
  },
  {
    icon: "link-outline" as const,
    title: "Share in one tap",
    subtitle:
      "Caregivers open a link — no account, no signup. Instant access to what they need for the shift.",
  },
  {
    icon: "document-text-outline" as const,
    title: "Smart shift handover",
    subtitle:
      "Every shift starts with a natural briefing pulled from your care memory — the demo centerpiece.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useSession();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.hero}>
        <IllustrationHero icon={slide.icon} title={slide.title} subtitle={slide.subtitle} />
      </View>

      <View style={styles.footer}>
        <ProgressDots total={SLIDES.length} current={step} />
        <View style={styles.actions}>
          {isLast ? (
            <PrimaryButton label="Get started" onPress={finish} />
          ) : (
            <PrimaryButton
              label="Continue"
              onPress={() => setStep((s) => s + 1)}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
            />
          )}
          {!isLast ? (
            <SecondaryButton label="Skip" onPress={finish} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
  },
  footer: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
});
