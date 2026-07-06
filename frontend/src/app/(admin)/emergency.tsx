import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, typography } from "@/constants/theme";

export default function EmergencyScreen() {
  const { profileId } = useSession();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    api.getEmergency(profileId)
      .then((res) => setContent(res.content))
      .catch((err) => setError(err.message ?? "Failed to load emergency card."))
      .finally(() => setLoading(false));
  }, [profileId]);

  return (
    <Screen navTitle="Emergency card" navSubtitle="Critical info at a glance">
      {loading ? (
        <Card soft style={styles.center} padding="md">
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : error ? (
        <Card padding="md" style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      ) : content ? (
        <Card style={styles.card} padding="md">
          <Text style={styles.body}>{content}</Text>
        </Card>
      ) : (
        <Card soft padding="md">
          <Text style={styles.emptyText}>No emergency information added yet.</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.dangerLight, borderColor: "#FECACA" },
  body: { ...typography.body, color: colors.text, lineHeight: 26 },
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  errorCard: { backgroundColor: colors.dangerLight },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
