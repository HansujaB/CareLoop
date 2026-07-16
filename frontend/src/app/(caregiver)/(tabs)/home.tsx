/**
 * Caregiver home dashboard — mirrors the admin home layout.
 * Shows shift status, quick action tiles to handover / chat / emergency,
 * and a "token invalid" fallback that routes back to welcome.
 */
import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ActionTile } from "@/components/ActionTile";
import { Card } from "@/components/ui/Card";
import { CaregiverDrawerMenu } from "@/components/ui/CaregiverDrawerMenu";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverHomeScreen() {
  const { caregiverName, caregiverToken } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // If token is gone (revoked / cleared) send back to welcome
  if (!caregiverToken) {
    router.replace("/(caregiver)/welcome");
    return null;
  }

  const displayName = caregiverName ?? "Caregiver";

  return (
    <>
      <Screen
        navTitle={`Hi, ${displayName}`}
        navSubtitle="Caregiver dashboard"
        showMenu
        onMenuPress={() => setDrawerOpen(true)}
      >
        {/* Shift status card */}
        <Card style={styles.statusCard} padding="md" soft>
          <View style={styles.statusRow}>
            <View style={styles.statusText}>
              <Text style={styles.statusName}>{displayName}</Text>
              <Text style={styles.statusRole}>Caregiver — on shift</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLive}>Active</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Quick access</Text>

        <ActionTile
          icon="document-text-outline"
          title="Shift handover"
          subtitle="Read your shift briefing"
          onPress={() => router.push("/(caregiver)/(tabs)/handover")}
          accent={colors.primary}
        />
        <ActionTile
          icon="chatbubble-outline"
          title="Ask assistant"
          subtitle="Ask anything about the care profile"
          onPress={() => router.push("/(caregiver)/(tabs)/chat")}
          accent="#7C3AED"
        />
        <ActionTile
          icon="medkit-outline"
          title="Emergency card"
          subtitle="Allergies, meds, emergency contacts"
          onPress={() => router.push("/(caregiver)/(tabs)/emergency")}
          accent={colors.danger}
        />
        <ActionTile
          icon="person-outline"
          title="My profile"
          subtitle="Your shift info and token"
          onPress={() => router.push("/(caregiver)/(tabs)/profile")}
          accent={colors.success}
        />

        <Card soft padding="md" style={styles.tipCard}>
          <View style={styles.tipRow}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Start with the shift handover — it has everything you need to begin.
            </Text>
          </View>
        </Card>
      </Screen>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  statusCard: { marginBottom: spacing.lg },
  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  statusText: { flex: 1, gap: 2 },
  statusName: { ...typography.h2, color: colors.text },
  statusRole: { ...typography.bodySmall, color: colors.textSecondary },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusLive: { ...typography.caption, color: colors.success, fontWeight: "700" },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  tipCard: { marginTop: spacing.md },
  tipRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  tipText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
});
