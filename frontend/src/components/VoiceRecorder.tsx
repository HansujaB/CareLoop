import { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import Ionicons from "@/components/Ionicons";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { TextField } from "@/components/ui/TextField";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

// Types

type VoiceState =
  | "idle"
  | "recording"
  | "transcribing"
  | "review"
  | "saving"
  | "saved"
  | "error";

type Props = { profileId: string };

// Copy maps

const TITLE: Record<VoiceState, string> = {
  idle: "Tap to record a care update",
  recording: "Listening…",
  transcribing: "Transcribing…",
  review: "Transcription ready",
  saving: "Saving…",
  saved: "Saved to memory",
  error: "Something went wrong",
};

const HINT: Record<VoiceState, string> = {
  idle: "Tap the microphone to record a care update.",
  recording: "Listening… speak your care update clearly.",
  transcribing: "Transcribing with Groq Whisper…",
  review: "Review before saving in memory.",
  saving: "Saving to care memory…",
  saved: "Saved to care memory",
  error: "", // overridden dynamically
};

// Helpers

function micIcon(state: VoiceState) {
  if (state === "saved") return "checkmark" as const;
  if (state === "transcribing" || state === "saving")
    return "hourglass-outline" as const;
  return "mic" as const;
}

function micColor(state: VoiceState) {
  return state === "recording" || state === "saved"
    ? colors.white
    : colors.primary;
}

const IS_WEB = Platform.OS === "web";

// Component

export function VoiceRecorder({ profileId }: Props) {
  // expo-audio recorder hook – manages lifecycle automatically
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [state, setState] = useState<VoiceState>("idle");
  const [transcribedText, setTranscribedText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Request mic permission + configure audio session once on mount
  useEffect(() => {
    if (IS_WEB) return;
    (async () => {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        setErrorMsg("Microphone permission is required to record audio.");
        setState("error");
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  // Recording
  const startRecording = useCallback(async () => {
    if (IS_WEB) {
      setErrorMsg("Voice recording is only available on mobile devices.");
      setState("error");
      return;
    }
    try {
      setErrorMsg("");
      setTranscribedText("");
      await recorder.prepareToRecordAsync();
      recorder.record();
      setState("recording");
    } catch (err) {
      console.error("Failed to start recording:", err);
      setErrorMsg("Could not start recording. Check microphone permissions.");
      setState("error");
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    setState("transcribing");
    try {
      await recorder.stop();
      // After stop(), the URI is available on recorder.uri
      const uri = recorder.uri;

      if (!uri) {
        setErrorMsg("Recording failed — no audio file was created.");
        setState("error");
        return;
      }

      const { text } = await api.transcribeVoice(profileId, uri);
      setTranscribedText(text);
      setState("review");
    } catch (err) {
      console.error("Transcription failed:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Transcription failed. Try again.",
      );
      setState("error");
    }
  }, [recorder, profileId]);

  const toggleRecording = useCallback(() => {
    if (recorderState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [recorderState.isRecording, startRecording, stopRecording]);

  // Save / discard

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

  // Render
  const hintText =
    state === "error" ? errorMsg || "Something went wrong. Try again." : HINT[state];

  if (IS_WEB) {
    return (
      <View style={styles.root}>
        <MicIndicator state="idle" />
        <Text style={styles.title}>Voice recording unavailable on web</Text>
        <Text style={styles.hint}>
          Voice recording requires a mobile device. Use the Text tab instead.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MicIndicator state={state} />

      <Text
        style={[
          styles.title,
          state === "error" && styles.titleError,
          state === "saved" && styles.titleSuccess,
        ]}
      >
        {TITLE[state]}
      </Text>
      <Text style={styles.hint}>{hintText}</Text>

      {/* Editable transcript — user can fix Whisper mistakes before saving */}
      {state === "review" ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>Whisper heard — edit if needed:</Text>
          <TextField
            value={transcribedText}
            onChangeText={setTranscribedText}
            multiline
            style={styles.transcriptInput}
          />
        </View>
      ) : state === "saving" && transcribedText ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>Saving:</Text>
          <Text style={styles.transcriptText}>{transcribedText}</Text>
        </View>
      ) : null}

      <VoiceActions
        state={state}
        onToggleRecording={toggleRecording}
        onSave={saveToMemory}
        onDiscard={discard}
      />
    </View>
  );
}

// Sub-components

function MicIndicator({ state }: { state: VoiceState }) {
  return (
    <View
      style={[
        styles.micCircle,
        state === "recording" && styles.micRecording,
        state === "saved" && styles.micSaved,
      ]}
    >
      <Ionicons name={micIcon(state)} size={36} color={micColor(state)} />
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

// Styles

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
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
  micRecording: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  micSaved: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
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
  transcriptBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  transcriptLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  transcriptText: {
    ...typography.body,
    color: colors.text,
  },
  transcriptInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
});
