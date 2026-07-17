/**
 * CaregiverWelcomeScreen — manual token entry fallback.
 *
 * This screen is shown when:
 *   a) The caregiver opens the app without a deep link (types in URL manually)
 *   b) The token segment from the deep link is missing for any reason
 *
 * Normal deep link flow bypasses this screen entirely via (caregiver)/c/[token].tsx.
 * If the user arrived here from a deep link that already stored a caregiverToken
 * in session, we skip straight to handover.
 */
import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationHero } from "@/components/ui/IllustrationHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { caregiverToken, caregiverName, setCaregiverName, setCaregiverToken, setRole } = useSession();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");       // empty — caregiver must paste their real token
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a full session is already established (came via deep link that already
  // ran caregiverSession), skip straight to the tabs.
  // Don't skip if we only have a token but no name — that means the name step
  // hasn't been completed yet.
  useEffect(() => {
    if (caregiverToken && caregiverName) {
      router.replace("/(caregiver)/(tabs)/handover");
    }
  }, [caregiverToken, caregiverName]);

  const goBack = () => {
    setRole("none");
    router.back();
  };

  const enter = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!token.trim()) {
      setError("Please paste the care link token from the parent.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Validate token AND register caregiver name on the backend in one step.
      // This throws a descriptive error if the token is invalid or revoked.
      await api.caregiverSession(token.trim(), name.trim());
      setCaregiverToken(token.trim());
      setCaregiverName(name.trim());
      router.replace("/(caregiver)/(tabs)/home");
    } catch (err: any) {
      setError(err.message ?? "Invalid or revoked link. Check the token and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {/* Back to login */}
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to login</Text>
        </Pressable>

        <IllustrationHero
          icon="hand-left-outline"
          title="You're covering a shift"
          subtitle="Enter your name and paste the care link token the parent shared with you."
        />

        <View style={styles.form}>
          <TextField
            label="Your name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sam"
          />
          <TextField
            label="Care link token"
            value={token}
            onChangeText={setToken}
            placeholder="Paste token from parent's shared link"
            autoCapitalize="none"
            autoCorrect={false}
            hint="Tap 'Share' on the parent's Caregiver links screen to copy your token."
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={submitting ? "Verifying…" : "Enter shift"}
            onPress={enter}
            icon={
              submitting
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Ionicons name="arrow-forward" size={18} color={colors.white} />
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: colors.background },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  backText: { ...typography.bodySmall, color: colors.textSecondary },
  form: { gap: spacing.md },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: "center",
  },
});
