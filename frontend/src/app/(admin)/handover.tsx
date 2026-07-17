import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SummaryCard } from "@/components/SummaryCard";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function HandoverScreen() {
  const { profileId, firebaseUser } = useSession();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId || !firebaseUser) {
      setLoading(false);
      return;
    }
    api.getHandover(profileId, firebaseUser.uid)
      .then((res) => setSummary(res.summary))
      .catch((err) => setError(err.message ?? "Failed to load handover."))
      .finally(() => setLoading(false));
  }, [profileId, firebaseUser]);

  return (
    <Screen navTitle="Shift handover" navSubtitle="What caregivers see at shift start">
      <Text style={styles.lead}>
        Synthesized from the care profile, phrased naturally for caregivers.
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
        <SummaryCard title="Shift briefing" body={summary} badge="Live" />
      ) : (
        <Card soft padding="md">
          <Text style={styles.emptyText}>
            No care information added yet. Add memories to generate a handover.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  errorCard: { backgroundColor: colors.dangerLight },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
