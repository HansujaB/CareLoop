/**
 * VoiceRecorder – records audio via expo-av, transcribes through Groq Whisper,
 * shows the result for review, and saves to care memory on confirmation.
 *
 * Fully self-contained: the parent only needs to supply `profileId`.
 */

import { useCallback, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";

import Ionicons from "@/components/Ionicons";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

// ── Types ──────────────────────────────────────────────────────────────────────

type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "review"
  | "saving"
  | "saved"
  | "error";

type Props = {
  profileId: string;
};

// ── Status copy map ────────────────────────────────────────────────────────────

const TITLE_COPY: Record<VoiceState, string> = {
  idle: "Tap to record a care update",
  recording: "Listening…",
  transcribing: "Transcribing…",
  review: "Transcription ready",
  saving: "Saving…",
  saved: "Saved to memory ✓",
  error: "Error",
};

const HINT_COPY: Record<VoiceState, string> = {
  idle: "Tap the microphone to record a care update.",
  recording: "Listening… speak your care update clearly.",
  transcribing: "Transcribing with Groq Whisper…",
  review: "Review the transcription below, then save to memory.",
  saving: "Saving to care memory…",
  saved: "Saved to care memory ✓",
  error: "", // populated dynamically from voiceError
};

// ── Mic indicator icon logic ───────────────────────────────────────────────────

function micIconName(state: VoiceState) {
  if (state === "saved") return "checkmark" as const;
  if (state === "transcribing" || state === "saving")
    return "hourglass-outline" as const;
  return "mic" as const;
}

function micIconColor(state: VoiceState) {
  if (state === "recording" || state === "saved") return colors.white;
  return colors.primary;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function VoiceRecorder({ profileId }: Props) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [state, setState] = useState<VoiceState>("idle");
  const [transcribedText, setTranscribedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Recording lifecycle ────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      setErrorMsg("");
      setTranscribedText("");

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setErrorMsg("Microphone permission is required to record audio.");
        setState("error");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setState("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);
      setErrorMsg("Could not start recording. Check microphone permissions.");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;

    setState("transcribing");

    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) {
        setErrorMsg("Recording failed — no audio file was created.");
        setState("error");
        return;
      }

      const formData = new FormData();
      formData.append("audio", {
        uri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as unknown as Blob);

      const { text } = await api.transcribeVoice(profileId, formData);
      setTranscribedText(text);
      setState("review");
    } catch (err) {
      console.error("Transcription failed:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Transcription failed. Try again.",
      );
      setState("error");
    }
  }, [profileId]);

  const toggleRecording = useCallback(() => {
    if (state === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }, [state, startRecording, stopRecording]);

  // ── Save / discard ─────────────────────────────────────────────────────────

  const saveToMemory = useCallback(async () => {
    if (!transcribedText.trim()) return;
    setState("saving");
    try {
      await api.rememberText(profileId, transcribedText.trim());
      setState("saved");
      setTimeout(() => {
        setState("idle");
        setTranscribedText("");
      }, 3000);
    } catch (err) {
      console.error("Save to memory failed:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save. Try again.",
      );
      setState("error");
    }
  }, [profileId, transcribedText]);

  const discard = useCallback(() => {
    setTranscribedText("");
    setErrorMsg("");
    setState("idle");
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  const hintText =
    state === "error" ? errorMsg || "Something went wrong. Try again." : HINT_COPY[state];

  return (
    <View style={styles.root}>
      {/* Mic indicator */}
      <MicIndicator state={state} />

      {/* Title + hint */}
      <Text
        style={[
          styles.title,
          state === "error" && styles.titleError,
          state === "saved" && styles.titleSuccess,
        ]}
      >
        {TITLE_COPY[state]}
      </Text>
      <Text style={styles.hint}>{hintText}</Text>

      {/* Transcript preview */}
      {(state === "review" || state === "saving") && transcribedText ? (
        <TranscriptPreview text={transcribedText} />
      ) : null}

      {/* Action buttons */}
      <VoiceActions
        state={state}
        onToggleRecording={toggleRecording}
        onSave={saveToMemory}
        onDiscard={discard}
      />
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MicIndicator({ state }: { state: VoiceState }) {
  return (
    <View
      style={[
        styles.micCircle,
        state === "recording" && styles.micRecording,
        state === "saved" && styles.micSaved,
      ]}
    >
      <Ionicons
        name={micIconName(state)}
        size={36}
        color={micIconColor(state)}
      />
    </View>
  );
}

function TranscriptPreview({ text }: { text: string }) {
  return (
    <View style={styles.transcriptBox}>
      <Text style={styles.transcriptLabel}>Whisper heard:</Text>
      <Text style={styles.transcriptText}>{text}</Text>
    </View>
  );
}

function VoiceActions({
  state,
  onToggleRecording,
  onSave,
  onDiscard,
}: {
  state: VoiceState;
  onToggleRecording: () => void;
  onSave: () => void;
  onDiscard: () => void;
}) {
  switch (state) {
    case "idle":
    case "error":
      return (
        <PrimaryButton
          label="Start recording"
          onPress={onToggleRecording}
          icon={<Ionicons name="mic-outline" size={18} color={colors.white} />}
        />
      );

    case "recording":
      return (
        <PrimaryButton
          label="Stop recording"
          onPress={onToggleRecording}
          icon={<Ionicons name="stop" size={18} color={colors.white} />}
        />
      );

    case "transcribing":
      return <PrimaryButton label="Transcribing…" loading disabled />;

    case "review":
      return (
        <View style={styles.buttonRow}>
          <View style={styles.buttonFlex}>
            <SecondaryButton
              label="Discard"
              onPress={onDiscard}
              icon={<Ionicons name="close" size={16} color={colors.text} />}
            />
          </View>
          <View style={styles.buttonFlex}>
            <PrimaryButton
              label="Add to memory"
              onPress={onSave}
              icon={
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color={colors.white}
                />
              }
            />
          </View>
        </View>
      );

    case "saving":
      return <PrimaryButton label="Saving…" loading disabled />;

    case "saved":
      return (
        <PrimaryButton
          label="Record another"
          onPress={onDiscard}
          icon={<Ionicons name="mic-outline" size={18} color={colors.white} />}
        />
      );
  }
}

// ── Styles ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },

  // Mic indicator
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
  micRecording: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  micSaved: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },

  // Copy
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
  },
  titleError: { color: colors.danger },
  titleSuccess: { color: colors.success },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Transcript preview
  transcriptBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcriptLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  transcriptText: {
    ...typography.body,
    color: colors.text,
  },

  // Buttons
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
});
