import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CreateProfileScreen() {
  const { setProfile, firebaseUser, profiles } = useSession();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const profile = await api.createProfile(
        name.trim(),
        firebaseUser?.uid ?? "",
        relationship.trim(),
      );
      // setProfile activates the new profile AND adds it to the switcher list
      setProfile(profile.profile_id, profile.name, profile.relationship ?? "");
      router.replace("/(admin)");
    } catch (err: any) {
      setError(err.message ?? "Failed to create profile. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Screen showNav={false} scroll padded bottomInset={32}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profiles.length > 0 ? "Add care profile" : "Create care profile"}
        </Text>
        <Text style={styles.subtitle}>
          One profile per person you care for. Their care knowledge lives here.
        </Text>
      </View>

      <TextField label="Name" value={name} onChangeText={setName} placeholder="Their name" />
      <TextField
        label="Your relationship to them (optional)"
        value={relationship}
        onChangeText={setRelationship}
        placeholder="e.g. daughter, spouse, nurse"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={creating ? "Creating…" : "Create profile"}
        onPress={createProfile}
        icon={
          creating
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Ionicons name="heart-outline" size={18} color={colors.white} />
        }
      />
      {profiles.length > 0 ? (
        <SecondaryButton
          label="Cancel"
          onPress={() => router.back()}
          icon={<Ionicons name="close-outline" size={18} color={colors.text} />}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});
