import Ionicons from "@/components/Ionicons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ActionTile } from "@/components/ActionTile";
import { SummaryCard } from "@/components/SummaryCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function AdminHomeScreen() {
  const { profileId, profileName, authLoading, profileLoading } = useSession();
  const [handover, setHandover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Gate: redirect to create-profile if profile not set up
  useEffect(() => {
    if (!authLoading && !profileLoading && !profileId) {
      router.replace("/(admin)/create-profile");
    }
  }, [authLoading, profileLoading, profileId]);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    api.getHandover(profileId)
      .then((res) => setHandover(res.summary))
      .catch(() => setHandover(null))
      .finally(() => setLoading(false));
  }, [profileId]);

  const displayName = profileName || "your child";

  return (
    <Screen navTitle={`Hi, ${displayName}'s parent`} navSubtitle="Care memory dashboard">
      <Card style={styles.profileCard} soft padding="md">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileMeta}>Active care profile</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Shift handover preview</Text>
      {loading ? (
        <Card soft padding="md" style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : handover ? (
        <>
          <SummaryCard title="Today's briefing" body={handover} />
          <PrimaryButton
            label="View full handover"
            onPress={() => router.push("/(admin)/handover")}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          />
        </>
      ) : (
        <Card soft padding="md">
          <Text style={styles.emptyText}>
            No care information yet. Add memories to generate a handover.
          </Text>
        </Card>
      )}

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Quick actions</Text>
      <ActionTile
        icon="mic-outline"
        title="Add care memory"
        subtitle="Voice or text — saved to AI memory"
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
        subtitle="Ask questions about the care profile"
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
  loadingCard: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
