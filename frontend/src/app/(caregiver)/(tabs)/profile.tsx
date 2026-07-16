/**
 * Caregiver profile screen — shows shift identity, token, and sign-out.
 * Lets the caregiver see who they're logged in as and end their shift cleanly.
 */
import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { CaregiverDrawerMenu } from "@/components/ui/CaregiverDrawerMenu";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { useSession } from "@/context/SessionContext";
import { caregiverCache } from "@/services/cache";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function CaregiverProfileScreen() {
  const { caregiverName, caregiverToken, setCaregiverToken, setCaregiverName, setRole } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = caregiverName ?? "Caregiver";
  const initials = displayName.charAt(0).toUpperCase();

  const endShift = async () => {
    // Clear the local cache for this token before wiping the session
    if (caregiverToken) {
      await caregiverCache.clear(caregiverToken);
    }
    // Wipe session state
    setRole("none");
    setCaregiverToken(null as any);
    setCaregiverName(null as any);
    // Navigate directly to the role-selection / login screen — bypassing index.tsx
    // to avoid a race where index still sees role==="caregiver" and loops back to welcome.
    router.replace("/(auth)/login");
  };

  return (
    <>
      <Screen
        navTitle="My profile"
        navSubtitle="Shift info"
        avatarInitials={initials}
        showMenu
        onMenuPress={() => setDrawerOpen(true)}
      >
        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.shiftBadge}>
            <View style={styles.shiftDot} />
            <Text style={styles.shiftLabel}>On shift</Text>
          </View>
        </View>

        {/* Token card */}
        <Card soft padding="md" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="key-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Care link token</Text>
              <Text style={styles.infoValue} selectable numberOfLines={1}>
                {caregiverToken ?? "—"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Info note */}
        <Card soft padding="md" style={styles.noteCard}>
          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.noteText}>
              Your token was provided by the parent via their CareLoop app.
              If it becomes invalid, ask the parent to generate a new link.
            </Text>
          </View>
        </Card>

        <View style={styles.buttons}>
          <SecondaryButton
            label="Back to home"
            onPress={() => router.replace("/(caregiver)/(tabs)/home")}
            icon={<Ionicons name="home-outline" size={16} color={colors.text} />}
          />
          <PrimaryButton
            label="End shift"
            onPress={endShift}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
          />
        </View>
      </Screen>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  avatarBlock: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...typography.h1, color: colors.success },
  name: { ...typography.h2, color: colors.text },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  shiftDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  shiftLabel: { ...typography.caption, color: colors.success, fontWeight: "700" },
  infoCard: { marginBottom: spacing.sm },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoLabel: { ...typography.label, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text, fontFamily: "monospace", marginTop: 2 },
  noteCard: { marginBottom: spacing.xl },
  noteRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  noteText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  buttons: { gap: spacing.sm },
});
