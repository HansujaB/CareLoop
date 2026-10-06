/**
 * Caregiver medical history — read-only (Issue #4).
 * Shows the parent-authored history card + verbatim uploaded reports.
 * Pure Firestore reads, no LLM involved.
 */
import Ionicons from "@/components/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { CaregiverDrawerMenu } from "@/components/ui/CaregiverDrawerMenu";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api, MedicalReport } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

export default function CaregiverMedicalScreen() {
  const { caregiverName, caregiverToken } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [history, setHistory] = useState<string | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!caregiverToken) {
      router.replace("/(caregiver)/welcome");
      return;
    }
    (async () => {
      try {
        const [h, list] = await Promise.all([
          api.caregiverMedicalHistory(caregiverToken),
          api.caregiverMedicalReports(caregiverToken),
        ]);
        setHistory(h.content ?? "");
        setReports(list ?? []);
      } catch (err: any) {
        const msg = err?.message ?? "Failed to load medical history.";
        const isRevoked =
          msg.toLowerCase().includes("revoked") || msg.toLowerCase().includes("invalid");
        setError(
          isRevoked
            ? "Your care link has been revoked. Please ask the parent for a new link."
            : msg,
        );
        if (isRevoked) setTimeout(() => router.replace("/(caregiver)/welcome"), 3000);
      } finally {
        setLoading(false);
      }
    })();
  }, [caregiverToken]);

  const initials = caregiverName?.charAt(0).toUpperCase() ?? "C";

  return (
    <>
      <Screen
        navTitle="Medical history"
        navSubtitle="Reports saved as-is by parent"
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
        ) : (
          <>
            {history ? (
              <Card padding="md" style={styles.historyCard}>
                <Text style={styles.historyLabel}>Parent's summary</Text>
                <Text style={styles.body}>{history}</Text>
              </Card>
            ) : (
              <Card soft padding="md">
                <Text style={styles.emptyText}>
                  The parent hasn't written a medical history yet.
                </Text>
              </Card>
            )}

            <Text style={styles.sectionTitle}>Reports ({reports.length})</Text>
            {reports.length === 0 ? (
              <Card soft padding="md">
                <Text style={styles.emptyText}>No uploaded reports yet.</Text>
              </Card>
            ) : (
              reports.map((r) => {
                const expanded = expandedId === r.report_id;
                return (
                  <Card key={r.report_id} padding="md" style={styles.reportCard}>
                    <View style={styles.reportRow}>
                      <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                      <View style={styles.reportInfo}>
                        <Text style={styles.reportName} numberOfLines={1}>{r.filename}</Text>
                        <Text style={styles.reportMeta}>
                          {r.ocr_chars} chars
                          {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                        </Text>
                      </View>
                      <SecondaryButton
                        label={expanded ? "Hide" : "View"}
                        compact
                        onPress={() => setExpandedId(expanded ? null : r.report_id)}
                      />
                    </View>
                    {expanded ? <Text style={styles.reportBody}>{r.extracted_text}</Text> : null}
                  </Card>
                );
              })
            )}
          </>
        )}
      </Screen>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  errorCard: { backgroundColor: colors.dangerLight },
  errorText: { ...typography.body, color: colors.danger },
  emptyText: { ...typography.body, color: colors.textSecondary },
  historyCard: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", marginBottom: spacing.md },
  historyLabel: { ...typography.label, color: colors.primary, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.text, lineHeight: 26 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  reportCard: { marginBottom: spacing.sm, gap: spacing.sm },
  reportRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reportInfo: { flex: 1, gap: 2 },
  reportName: { ...typography.body, color: colors.text, fontWeight: "600" },
  reportMeta: { ...typography.caption, color: colors.textSecondary },
  reportBody: { ...typography.bodySmall, color: colors.text, lineHeight: 22, marginTop: spacing.sm },
});
