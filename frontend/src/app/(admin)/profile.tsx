import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionTile } from "@/components/ActionTile";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { colors, spacing, typography } from "@/constants/theme";

export default function AdminProfileScreen() {
  const { profileName, resetSession } = useSession();

  return (
    <Screen navTitle="Profile" navSubtitle="Account & care settings">
      <Card style={styles.card} soft padding="md">
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View>
            <Text style={styles.name}>Parent account</Text>
            <Text style={styles.meta}>Managing {profileName}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.section}>Care tools</Text>
      <ActionTile
        icon="cloud-upload-outline"
        title="Upload medical record"
        subtitle="PDF or image → OCR → Care memory"
        onPress={() => router.push("/(admin)/upload")}
      />
      <ActionTile
        icon="document-text-outline"
        title="Preview handover"
        subtitle="See caregiver briefing"
        onPress={() => router.push("/(admin)/handover")}
      />

      <Text style={styles.section}>Account</Text>
      <Card padding="md">
        <SecondaryButton
          label="Sign out"
          onPress={() => {
            resetSession();
            router.replace("/(auth)/login");
          }}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.text} />}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.h2, color: colors.primary },
  name: { ...typography.h3, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  section: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
});
