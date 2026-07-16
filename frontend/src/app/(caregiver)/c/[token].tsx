/**
 * Deep link entry point for caregiver links.
 * Maps: careloop://c/<token>  →  this screen
 *
 * The token is pre-filled from the URL. The caregiver enters their name,
 * which calls caregiverSession() to:
 *   1. Validate the token
 *   2. Write caregiver_name to Firestore (so the parent sees who logged in)
 *   3. Lock the IP on first use (subsequent logins from a different IP are blocked)
 *
 * If the token is missing we fall back to the manual welcome screen.
 */
import Ionicons from "@/components/Ionicons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationHero } from "@/components/ui/IllustrationHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverTokenEntry() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const insets = useSafeAreaInsets();
  const { setCaregiverToken, setCaregiverName } = useSession();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No token in URL — redirect to manual entry screen
  useEffect(() => {
    if (!token) {
      router.replace("/(caregiver)/welcome");
    }
  }, [token]);

  if (!token) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const enter = async () => {
    if (!name.trim()) {
      setError("Please enter your name so the parent knows who's on shift.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Validate token, register name, and lock IP in one backend call
      await api.caregiverSession(token.trim(), name.trim());
      setCaregiverToken(token.trim());
      setCaregiverName(name.trim());
      router.replace("/(caregiver)/(tabs)/home");
    } catch (err: any) {
      setError(err.message ?? "Invalid or revoked link. Ask the parent to generate a new one.");
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
        subtitle="Just enter your name — your care link is already linked."
      />

      <View style={styles.form}>
        <TextField
          label="Your name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sam"
          autoFocus
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
