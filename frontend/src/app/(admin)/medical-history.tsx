/**
 * Medical history screen (admin / parent only) — Issue #4.
 *
 * Two parts:
 *  1. Parent-authored medical history card (curated summary + routine
 *     appointments). Shown to caregivers exactly as written, no AI involved.
 *     Stored in Firestore: profiles/{id}.medical_history_card.
 *  2. Uploaded reports list — OCR text stored AS-IS via /upload, never fed
 *     to Mem0. Read-only here; tap a report to expand its extracted text.
 */
import Ionicons from "@/components/Ionicons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api, MedicalReport } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

const PLACEHOLDER = `Example:
Conditions: asthma (diagnosed 2023), peanut allergy

Routine appointments:
- GP review — every 6 months, next: 12 Dec
- Dental checkup — yearly, next: March

Past reports: see uploaded documents below`;

export default function MedicalHistoryScreen() {
  const { profileId, firebaseUser } = useSession();
  const [cardText, setCardText] = useState("");
  const [cardState, setCardState] = useState<"loading" | "editing" | "saving" | "saved">("loading");
  const [drafting, setDrafting] = useState(false);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!profileId || !firebaseUser) return;
    setReportsLoading(true);
    setReportsError(null);
    try {
      const [history, list] = await Promise.all([
        api.getMedicalHistory(profileId, firebaseUser.uid),
        api.listMedicalReports(profileId, firebaseUser.uid),
      ]);
      setCardText(history.content ?? "");
      setReports(list ?? []);
    } catch (err: any) {
      setReportsError(err?.message ?? "Failed to load medical history.");
    } finally {
      setCardState("editing");
      setReportsLoading(false);
    }
  }, [profileId, firebaseUser]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveCard = async () => {
    if (!profileId || !firebaseUser) return;
    if (!cardText.trim()) {
      setErrorMsg("Card can't be empty. Write something before saving.");
      return;
    }
    setCardState("saving");
    setErrorMsg(null);
    try {
      await api.setMedicalHistory(profileId, firebaseUser.uid, cardText.trim());
      setCardState("saved");
      setTimeout(() => setCardState("editing"), 2000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to save. Please try again.");
      setCardState("editing");
    }
  };

  const draftFromReports = async () => {
    if (!profileId || !firebaseUser || drafting) return;
    setDrafting(true);
    setErrorMsg(null);
    try {
      const res = await api.draftMedicalHistory(profileId, firebaseUser.uid);
      setCardText(res.content ?? "");
      setCardState("editing");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Could not draft from reports. Please try again.");
    } finally {
      setDrafting(false);
    }
  };

  return (
    <Screen navTitle="Medical history" navSubtitle="Reports saved as-is, never fed to AI memory">
      {/* History card editor */}
      <Card soft padding="md" style={styles.infoBanner}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            Write the curated summary + routine appointments here. Caregivers see it exactly as
            written. Uploaded reports below are stored verbatim.
          </Text>
        </View>
      </Card>

      {cardState === "loading" ? (
        <Card soft padding="lg" style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : (
        <>
          <Card style={styles.editorCard} padding="md">
            <TextInput
              value={cardText}
              onChangeText={(v) => {
                setCardText(v);
                setErrorMsg(null);
              }}
              multiline
              placeholder={PLACEHOLDER}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              scrollEnabled={false}
              maxLength={4000}
              editable={cardState !== "saving"}
            />
          </Card>
          <Text style={styles.charCount}>{cardText.length} / 4000</Text>
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
          <View style={styles.buttonRow}>
            <SecondaryButton
              label={drafting ? "Drafting…" : "Draft from reports"}
              onPress={draftFromReports}
              icon={<Ionicons name="sparkles-outline" size={18} color={colors.text} />}
            />
            <PrimaryButton
              label={cardState === "saving" ? "Saving…" : cardState === "saved" ? "Saved!" : "Save medical history"}
              onPress={saveCard}
              icon={
                cardState === "saved" ? (
                  <Ionicons name="checkmark-outline" size={18} color={colors.white} />
                ) : (
                  <Ionicons name="save-outline" size={18} color={colors.white} />
                )
              }
            />
          </View>
        </>
      )}

      {/* Reports list */}
      <View style={styles.reportsHeaderRow}>
        <Text style={styles.sectionTitle}>Uploaded reports ({reports.length})</Text>
        <SecondaryButton label="Refresh" compact onPress={loadAll} />
      </View>

      {reportsLoading ? (
        <Card soft padding="md" style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : reportsError ? (
        <Card padding="md" style={styles.errorBanner}>
          <Text style={styles.errorText}>{reportsError}</Text>
        </Card>
      ) : reports.length === 0 ? (
        <Card soft padding="md">
          <Text style={styles.emptyText}>
            No reports yet. Upload a PDF or image from the Upload screen — it will appear here as-is.
          </Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBanner: { marginBottom: spacing.sm },
  infoRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
  editorCard: { marginBottom: spacing.xs },
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: 160,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "right",
    marginBottom: spacing.md,
  },
  buttonRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", marginBottom: spacing.sm },
  errorBanner: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "flex-start",
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: { ...typography.bodySmall, color: colors.danger, flex: 1 },
  reportsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.text },
  emptyText: { ...typography.body, color: colors.textSecondary },
  reportCard: { marginBottom: spacing.sm, gap: spacing.sm },
  reportRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reportInfo: { flex: 1, gap: 2 },
  reportName: { ...typography.body, color: colors.text, fontWeight: "600" },
  reportMeta: { ...typography.caption, color: colors.textSecondary },
  reportBody: { ...typography.bodySmall, color: colors.text, lineHeight: 22, marginTop: spacing.sm },
});
