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

export default function CaregiverEmergencyScreen() {
  const { caregiverName, caregiverToken } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caregiverToken) {
      router.replace("/(caregiver)/welcome");
      return;
    }

    (async () => {
      // 1. Serve from local cache if fresh
      const cached = await caregiverCache.getEmergency(caregiverToken);
      if (cached) {
        setContent(cached);
        setLoading(false);
        return;
      }

      // 2. Cache miss — fetch (backend returns from its own Firestore cache
      //    when memory hasn't changed, so slow Groq calls are rare)
      try {
        const res = await api.caregiverEmergency(caregiverToken);
        setContent(res.content);
        await caregiverCache.saveEmergency(caregiverToken, res.content);
      } catch (err: any) {
        const isRevoked =
          err?.message?.toLowerCase().includes("revoked") ||
          err?.message?.toLowerCase().includes("invalid");
        setError(
          isRevoked
            ? "Your care link has been revoked. Please ask the parent for a new link."
            : (err.message ?? "Failed to load emergency card."),
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
        navTitle="Emergency card"
        navSubtitle="Keep this visible during your shift"
        avatarInitials={initials}
        showMenu
        onMenuPress={() => setDrawerOpen(true)}
      >
        {loading ? (
          <Card soft style={styles.center} padding="md">
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : error ? (
          <Card padding="md" style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : content ? (
          <Card style={styles.emergencyCard} padding="md">
            <Text style={styles.body}>{content}</Text>
          </Card>
        ) : (
          <Card soft padding="md">
            <Text style={styles.emptyText}>No emergency information available yet.</Text>
          </Card>
        )}
      </Screen>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  emergencyCard: { backgroundColor: colors.dangerLight, borderColor: "#FECACA" },
  body: { ...typography.body, color: colors.text, lineHeight: 26 },
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  errorCard: { backgroundColor: colors.dangerLight },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
