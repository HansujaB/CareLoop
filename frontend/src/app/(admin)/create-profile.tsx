import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CreateProfileScreen() {
  const { setProfile, firebaseUser } = useSession();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const profile = await api.createProfile(name.trim(), firebaseUser?.uid ?? "");
      setProfile(profile.profile_id, profile.name);
      router.replace("/(admin)/memory");
    } catch (err: any) {
      setError(err.message ?? "Failed to create profile. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Screen showNav={false} scroll padded bottomInset={32}>
      <View style={styles.header}>
        <Text style={styles.title}>Create care profile</Text>
        <Text style={styles.subtitle}>
          One profile per child or dependent. Their care knowledge lives here.
        </Text>
      </View>

      <TextField label="Name" value={name} onChangeText={setName} placeholder="Your child's name" />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});
