/**
 * Emergency card editor — parent-facing.
 *
 * The parent writes the card directly. What they type is exactly what
 * caregivers see. No LLM involved — deterministic, always accurate.
 *
 * Stored in Firestore under profiles/{id}.emergency_card.
 * Cached on the caregiver device (AsyncStorage, 4-hour TTL) so caregivers
 * don't hit Firestore on every tab switch.
 */
import Ionicons from "@/components/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

type PageState = "loading" | "editing" | "saving" | "saved" | "error";

const PLACEHOLDER = `Example:
Allergies: peanuts (EpiPen in blue bag), penicillin

Medications:
- Salbutamol inhaler — 2 puffs before exercise
- Cetirizine 5mg — once daily after breakfast

Blood group: O+

Emergency contacts:
- Mum: 07700 900000
- Dad: 07700 900001
- GP (Dr Patel): 01234 567890

Other: has asthma — keep inhaler accessible at all times`;

export default function EmergencyCardEditorScreen() {
  const { profileId, firebaseUser } = useSession();
  const [text, setText] = useState("");
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Load current card on mount
  useEffect(() => {
    if (!profileId) return;
    api
      .getEmergency(profileId)
      .then((res) => {
        setText(res.content ?? "");
        setPageState("editing");
      })
      .catch(() => {
        // Non-fatal — start with blank editor
        setPageState("editing");
      });
  }, [profileId]);

  const save = async () => {
    if (!profileId || !firebaseUser) return;
    if (!text.trim()) {
      setErrorMsg("Card can't be empty. Write something before saving.");
      return;
    }
    setPageState("saving");
    setErrorMsg(null);
    try {
      await api.setEmergency(profileId, firebaseUser.uid, text.trim());
      setPageState("saved");
      // Briefly show "Saved" then return to editing state
      setTimeout(() => setPageState("editing"), 2000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed to save. Please try again.");
      setPageState("error");
    }
  };

  const isBusy = pageState === "loading" || pageState === "saving";

  return (
    <Screen navTitle="Emergency card" navSubtitle="Written by you, seen by caregivers">
      {/* Info banner */}
      <Card soft padding="md" style={styles.infoBanner}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            This card is shown to caregivers exactly as you write it — no AI involved.
            Keep it concise and up to date.
          </Text>
        </View>
      </Card>

      {pageState === "loading" ? (
        <Card soft padding="lg" style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : (
        <>
          {/* Editor */}
          <Card style={styles.editorCard} padding="md">
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={(v) => {
                setText(v);
                if (pageState === "saved" || pageState === "error") setPageState("editing");
                setErrorMsg(null);
              }}
              multiline
              placeholder={PLACEHOLDER}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              scrollEnabled={false}
              maxLength={4000}
              editable={!isBusy}
            />
          </Card>

          {/* Char counter */}
          <Text style={styles.charCount}>{text.length} / 4000</Text>

          {/* Error */}
          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Save button */}
          <PrimaryButton
            label={
              pageState === "saving"
                ? "Saving…"
                : pageState === "saved"
                ? "Saved!"
                : "Save emergency card"
            }
            onPress={save}
            icon={
              pageState === "saving" ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : pageState === "saved" ? (
                <Ionicons name="checkmark-outline" size={18} color={colors.white} />
              ) : (
                <Ionicons name="save-outline" size={18} color={colors.white} />
              )
            }
          />

          {/* Preview hint */}
          {text.trim().length > 0 && pageState !== "saving" ? (
            <Card style={styles.previewCard} padding="md">
              <Text style={styles.previewLabel}>Caregiver preview</Text>
              <Text style={styles.previewBody}>{text.trim()}</Text>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBanner: { marginBottom: spacing.sm },
  infoRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  center: { alignItems: "center", justifyContent: "center", minHeight: 100 },

  editorCard: { marginBottom: spacing.xs },
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: 200,
    textAlignVertical: "top",
    lineHeight: 24,
  },

  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "right",
    marginBottom: spacing.md,
  },

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

  previewCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.dangerLight,
    borderColor: "#FECACA",
    gap: spacing.sm,
  },
  previewLabel: { ...typography.label, color: colors.danger },
  previewBody: { ...typography.body, color: colors.text, lineHeight: 26 },
});
