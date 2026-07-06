import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, spacing, typography } from "@/constants/theme";

const MODES = [
  { key: "text", label: "Text" },
  { key: "voice", label: "Voice" },
];

export default function MemoryScreen() {
  const { profileId, profileName } = useSession();
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const saveMemory = async () => {
    if (!text.trim() || !profileId || saving) return;
    setSaving(true);
    setStatus("idle");
    try {
      await api.rememberText(profileId, text.trim());
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
    status === "saved" ? "Saved ✓" : status === "error" ? "Save failed — retry" : saving ? "Saving…" : "Save to care memory";

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
      ) : (
        <Card style={styles.block} padding="md">
          <View style={[styles.micCircle, recording && styles.micActive]}>
            <Ionicons name="mic" size={36} color={recording ? colors.white : colors.primary} />
          </View>
          <Text style={styles.voiceTitle}>
            {recording ? "Listening…" : "Tap to record a care update"}
          </Text>
          <Text style={styles.voiceHint}>
            Groq Whisper transcribes your voice, then saves it to the care memory.
          </Text>
          <PrimaryButton
            label={recording ? "Stop recording" : "Start recording"}
            onPress={() => setRecording((r) => !r)}
            icon={<Ionicons name={recording ? "stop" : "mic-outline"} size={18} color={colors.white} />}
          />
        </Card>
      )}
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
  micCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  micActive: {
    backgroundColor: colors.primary,
  },
  voiceTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
  },
  voiceHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
