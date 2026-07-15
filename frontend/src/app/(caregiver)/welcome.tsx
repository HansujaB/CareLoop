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
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationHero } from "@/components/ui/IllustrationHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { caregiverToken, setCaregiverName, setCaregiverToken } = useSession();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");       // empty — caregiver must paste their real token
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a token was already stored (came via deep link), skip straight to handover
  useEffect(() => {
    if (caregiverToken) {
      router.replace("/(caregiver)/(tabs)/handover");
    }
  }, [caregiverToken]);

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
      router.replace("/(caregiver)/(tabs)/handover");
    } catch (err: any) {
      setError(err.message ?? "Invalid or revoked link. Check the token and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    justifyContent: "space-between",
  },
  form: { gap: spacing.md },
  error: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: "center",
  },
});
