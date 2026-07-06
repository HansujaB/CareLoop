import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IllustrationHero } from "@/components/ui/IllustrationHero";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { colors, spacing } from "@/constants/theme";

export default function CaregiverWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setCaregiverName, setCaregiverToken } = useSession();
  const [name, setName] = useState("");
  const [token, setToken] = useState("demo-token-nanny");

  const enter = () => {
    if (!name.trim()) return;
    setCaregiverName(name.trim());
    setCaregiverToken(token.trim());
    router.replace("/(caregiver)/(tabs)/handover");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <IllustrationHero
        icon="hand-left-outline"
        title="You're covering a shift"
        subtitle="Enter your name to access the handover briefing, chat assistant, and emergency card."
      />

      <View style={styles.form}>
        <TextField label="Your name" value={name} onChangeText={setName} placeholder="Sam" />
        <TextField
          label="Care link token"
          value={token}
          onChangeText={setToken}
          placeholder="Paste token from parent"
          autoCapitalize="none"
          hint="In production this comes from the shared deep link automatically."
        />
        <PrimaryButton
          label="Enter shift"
          onPress={enter}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
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
});
