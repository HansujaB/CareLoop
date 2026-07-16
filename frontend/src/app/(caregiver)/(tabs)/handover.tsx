import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { CaregiverDrawerMenu } from "@/components/ui/CaregiverDrawerMenu";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { caregiverCache } from "@/services/cache";
import { colors, typography } from "@/constants/theme";

export default function CaregiverHandoverScreen() {
  const { caregiverName, caregiverToken } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caregiverToken) {
      router.replace("/(caregiver)/welcome");
      return;
    }

    (async () => {
      // 1. Try local cache first — zero network, instant render
      const cached = await caregiverCache.getHandover(caregiverToken);
      if (cached) {
        setSummary(cached);
        setLoading(false);
        return;
      }

      // 2. Cache miss or stale — fetch from backend
      // (Backend itself serves from its Firestore version-based cache when
      //  memory hasn't changed, so this is rarely a slow Mem0 + Groq call)
      try {
        const res = await api.caregiverHandover(caregiverToken);
        setSummary(res.summary);
        await caregiverCache.saveHandover(caregiverToken, res.summary);
      } catch (err: any) {
        const isRevoked =
          err?.message?.toLowerCase().includes("revoked") ||
          err?.message?.toLowerCase().includes("invalid");
        setError(
          isRevoked
            ? "Your care link has been revoked. Please ask the parent for a new link."
            : (err.message ?? "Failed to load handover."),
        );
        if (isRevoked) {
          await caregiverCache.clear(caregiverToken);
          setTimeout(() => router.replace("/(caregiver)/welcome"), 3000);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [caregiverToken]);

  const initials = caregiverName?.charAt(0).toUpperCase() ?? "C";

  return (
    <>
      <Screen
        navTitle={`Good shift, ${caregiverName ?? "caregiver"}`}
        navSubtitle="Shift handover briefing"
        avatarInitials={initials}
        showMenu
        onMenuPress={() => setDrawerOpen(true)}
      >
        <Text style={styles.lead}>
          Your shift handover — synthesised from everything the parent has stored in care memory.
        </Text>
        {loading ? (
          <Card soft padding="md" style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : error ? (
          <Card padding="md" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : summary ? (
          <Card padding="md" style={styles.summaryCard}>
            <Text style={styles.body}>{summary}</Text>
          </Card>
        ) : (
          <Card soft padding="md">
            <Text style={styles.emptyText}>
              No care information available yet. Ask the parent to add details.
            </Text>
          </Card>
        )}
      </Screen>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 16 },
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  errorCard: { backgroundColor: colors.dangerLight },
  errorText: { ...typography.body, color: colors.danger },
  summaryCard: { backgroundColor: colors.surface },
  body: { ...typography.body, color: colors.text, lineHeight: 26 },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
