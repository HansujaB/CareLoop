import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

const MODES = [
  { key: "text", label: "Text" },
  { key: "voice", label: "Voice" },
];

export default function MemoryScreen() {
  const { profileId, profileName, firebaseUser } = useSession();
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const saveMemory = async () => {
    if (!text.trim() || !profileId || !firebaseUser?.uid || saving) return;
    setSaving(true);
    setStatus("idle");
    try {
      await api.rememberText(profileId, firebaseUser.uid, text.trim());
      setStatus("saved");
      setText("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const buttonLabel =
    status === "saved"
      ? "Saved ✓"
      : status === "error"
        ? "Save failed — retry"
        : saving
          ? "Saving…"
          : "Save to care memory";

  return (
    <Screen navTitle="Add memory" navSubtitle={`Updates ${profileName || "the care profile"}`}>
      <ChipGroup items={MODES} selectedKey={mode} onSelect={setMode} />

      {mode === "text" ? (
        <Card style={styles.block} padding="md">
          <Text style={styles.label}>Care details</Text>
          <TextField
            value={text}
            onChangeText={setText}
            placeholder="Has a peanut allergy. Takes inhaler at 2pm daily..."
            multiline
            style={styles.textArea}
            hint="Tip: speak naturally — the AI builds the memory graph for you."
          />
          <PrimaryButton
            label={buttonLabel}
            onPress={saveMemory}
            icon={<Ionicons name="cloud-upload-outline" size={18} color={colors.white} />}
          />
        </Card>
      ) : profileId && firebaseUser?.uid ? (
        <Card style={styles.block} padding="md">
          <VoiceRecorder profileId={profileId} firebaseUid={firebaseUser.uid} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.md, gap: spacing.md },
  label: { ...typography.label, color: colors.text },
  textArea: {
    minHeight: 160,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
});
