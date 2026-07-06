import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ActionTile } from "@/components/ActionTile";
import { SummaryCard } from "@/components/SummaryCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { DEMO_HANDOVER, DEMO_PROFILE } from "@/constants/demo";
import { colors, spacing, typography } from "@/constants/theme";

export default function AdminHomeScreen() {
  const { profileName } = useSession();

  return (
    <Screen navTitle={`Hi, ${profileName}'s parent`} navSubtitle="Care memory dashboard">
      <Card style={styles.profileCard} soft padding="md">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileName.charAt(0)}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileMeta}>{DEMO_PROFILE.ageLabel} · Active profile</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Shift handover preview</Text>
      <SummaryCard title="Today's briefing" body={DEMO_HANDOVER} badge="Demo" />
      <PrimaryButton
        label="View full handover"
        onPress={() => router.push("/(admin)/handover")}
        icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
      />

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Quick actions</Text>
      <ActionTile
        icon="mic-outline"
        title="Add care memory"
        subtitle="Voice or text → Cognee graph"
        onPress={() => router.push("/(admin)/memory")}
      />
      <ActionTile
        icon="link-outline"
        title="Share caregiver link"
        subtitle="Generate or revoke access"
        onPress={() => router.push("/(admin)/links")}
      />
      <ActionTile
        icon="chatbubble-outline"
        title="Ask care assistant"
        subtitle="Test questions against memory"
        onPress={() => router.push("/(admin)/chat")}
      />
      <ActionTile
        icon="medkit-outline"
        title="Emergency card"
        subtitle="Allergies, meds, contacts"
        onPress={() => router.push("/(admin)/emergency")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginBottom: spacing.lg },
  profileRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.h3, color: colors.primary },
  profileText: { flex: 1, gap: 2 },
  profileName: { ...typography.h2, color: colors.text },
  profileMeta: { ...typography.bodySmall, color: colors.textSecondary },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { ...typography.caption, color: colors.success, fontWeight: "700" },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  sectionGap: { marginTop: spacing.lg },
});
