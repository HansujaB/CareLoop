import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { colors, spacing, typography } from "@/constants/theme";

export default function CreateProfileScreen() {
  const { setProfile } = useSession();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const createProfile = () => {
    if (!name.trim()) return;
    setProfile("demo-profile", name.trim());
    router.replace("/(admin)/memory");
  };

  return (
    <Screen showNav={false} scroll padded bottomInset={32}>
      <View style={styles.header}>
        <Text style={styles.title}>Create care profile</Text>
        <Text style={styles.subtitle}>
          One profile per child or dependent. Care memory lives in Cognee.
        </Text>
      </View>

      <TextField label="Name" value={name} onChangeText={setName} placeholder="Aryan" />
      <TextField
        label="Age (optional)"
        value={age}
        onChangeText={setAge}
        placeholder="4"
        keyboardType="number-pad"
      />

      <PrimaryButton
        label="Create profile"
        onPress={createProfile}
        icon={<Ionicons name="heart-outline" size={18} color={colors.white} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary },
});
