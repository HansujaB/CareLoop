import Ionicons from "@/components/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionTile } from "@/components/ActionTile";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function AdminProfileScreen() {
  const { profileId, profileName, profiles, switchProfile, resetSession } = useSession();

  const selectProfile = (id: string) => {
    if (id === profileId) return;
    switchProfile(id);
    // Return to the dashboard so every screen reloads under the new profile
    router.replace("/(admin)");
  };

  return (
    <Screen navTitle="Profile" navSubtitle="Account & care settings">
      <Card style={styles.card} soft padding="md">
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View>
            <Text style={styles.name}>Care admin</Text>
            <Text style={styles.meta}>Managing care for {profileName}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.section}>Care profiles ({profiles.length})</Text>
      <Card padding="md" style={styles.listCard}>
        {profiles.map((p) => {
          const active = p.profile_id === profileId;
          return (
            <Pressable
              key={p.profile_id}
              onPress={() => selectProfile(p.profile_id)}
              style={({ pressed }) => [styles.profileRow, pressed && !active && styles.rowPressed]}
              disabled={active}
            >
              <View style={[styles.profileIcon, active && styles.profileIconActive]}>
                <Ionicons
                  name="heart-outline"
                  size={18}
                  color={active ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.profileMeta}>
                  {active ? "Active profile" : "Tap to switch"}
                </Text>
              </View>
              {active ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              )}
            </Pressable>
          );
        })}
      </Card>
      <SecondaryButton
        label="Add care profile"
        onPress={() => router.push("/(admin)/create-profile")}
        icon={<Ionicons name="add-outline" size={18} color={colors.text} />}
      />

      <Text style={styles.section}>Care tools</Text>
      <ActionTile
        icon="cloud-upload-outline"
        title="Upload medical record"
        subtitle="PDF or image → saved as-is"
        onPress={() => router.push("/(admin)/upload")}
      />
      <ActionTile
        icon="folder-open-outline"
        title="Medical history"
        subtitle="Reports + routine appointments"
        onPress={() => router.push("/(admin)/medical-history")}
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
  listCard: { gap: spacing.xs, marginBottom: spacing.sm },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowPressed: { backgroundColor: colors.surface },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileIconActive: { backgroundColor: colors.success },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { ...typography.body, color: colors.text, fontWeight: "600" },
  profileMeta: { ...typography.caption, color: colors.textSecondary },
  activePill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  activePillText: { ...typography.caption, color: colors.success, fontWeight: "700" },
});
