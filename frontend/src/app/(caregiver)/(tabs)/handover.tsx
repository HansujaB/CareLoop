import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SummaryCard } from "@/components/SummaryCard";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverHandoverScreen() {
  const { caregiverToken, caregiverName, profileName } = useSession();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caregiverToken) {
      setLoading(false);
      return;
    }
    api.caregiverHandover(caregiverToken)
      .then((res) => setSummary(res.summary))
      .catch((err) => setError(err.message ?? "Failed to load handover."))
      .finally(() => setLoading(false));
  }, [caregiverToken]);

  return (
    <Screen
      navTitle={`Good shift, ${caregiverName ?? "caregiver"}`}
      navSubtitle={`Briefing for ${profileName || "care profile"}`}
      avatarInitials={caregiverName?.charAt(0) ?? "C"}
      showMenu={false}
    >
      <Text style={styles.lead}>
        Your shift handover — synthesized from everything the parent has stored in care memory.
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
        <SummaryCard title="Shift handover" body={summary} badge="Start here" />
      ) : (
        <Card soft padding="md">
          <Text style={styles.emptyText}>
            No care information available yet. Ask the parent to add details.
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
