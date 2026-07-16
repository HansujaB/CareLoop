/**
 * Medical record upload screen (admin / parent only).
 *
 * Flow:
 *   1. Parent taps "Choose file" → expo-document-picker opens Files app
 *   2. File is validated client-side (type + size)
 *   3. XHR multipart POST to /profiles/{id}/upload
 *   4. Backend runs OCR (PDF → pypdf, image → Groq vision) then Groq cleanup
 *      and saves the extracted text to Mem0 care memory
 *   5. UI shows success (char count) or a clear error message
 *
 * Supported: PDF, JPEG, PNG, WebP, HEIC — up to 20 MB (enforced on backend too)
 */
import Ionicons from "@/components/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
];

const MAX_MB = 20;

type UploadState =
  | { status: "idle" }
  | { status: "picked"; name: string; uri: string; mimeType: string; size: number }
  | { status: "uploading" }
  | { status: "success"; message: string; chars: number }
  | { status: "error"; message: string };

export default function UploadScreen() {
  const { profileId, firebaseUser } = useSession();
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ACCEPTED_MIME_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? "application/octet-stream";
      const sizeBytes = asset.size ?? 0;

      if (!ACCEPTED_MIME_TYPES.includes(mimeType) && !asset.name.toLowerCase().endsWith(".pdf")) {
        setState({
          status: "error",
          message: `Unsupported file type (${mimeType}). Please upload a PDF or image.`,
        });
        return;
      }

      if (sizeBytes > MAX_MB * 1024 * 1024) {
        setState({
          status: "error",
          message: `File is too large (${(sizeBytes / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_MB} MB.`,
        });
        return;
      }

      setState({
        status: "picked",
        name: asset.name,
        uri: asset.uri,
        mimeType,
        size: sizeBytes,
      });
    } catch {
      setState({ status: "error", message: "Could not open file picker. Please try again." });
    }
  };

  const upload = async () => {
    if (state.status !== "picked") return;
    if (!profileId || !firebaseUser) {
      setState({ status: "error", message: "Not signed in. Please sign in and try again." });
      return;
    }

    setState({ status: "uploading" });
    try {
      const res = await api.uploadMedicalRecord(
        profileId,
        firebaseUser.uid,
        state.uri,
        state.name,
        state.mimeType,
      );
      setState({ status: "success", message: res.message, chars: res.ocr_chars });
    } catch (err: any) {
      setState({
        status: "error",
        message: err?.message ?? "Upload failed. Please try again.",
      });
    }
  };

  const reset = () => setState({ status: "idle" });

  return (
    <Screen navTitle="Medical records" navSubtitle="Upload PDF or image">
      {/* Drop zone / picker card */}
      {(state.status === "idle" || state.status === "error") && (
        <Card style={styles.dropzone} soft padding="lg">
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Upload a document</Text>
          <Text style={styles.subtitle}>
            PDF or image (JPEG, PNG, WebP, HEIC) — up to 20 MB.{"\n"}
            Text is extracted via OCR and saved to care memory.
          </Text>

          {state.status === "error" && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{state.message}</Text>
            </View>
          )}

          <PrimaryButton
            label="Choose file"
            onPress={pickFile}
            icon={<Ionicons name="document-outline" size={18} color={colors.white} />}
          />
        </Card>
      )}

      {/* File picked — ready to upload */}
      {state.status === "picked" && (
        <Card soft padding="lg" style={styles.pickedCard}>
          <View style={styles.fileRow}>
            <View style={styles.fileIconWrap}>
              <Ionicons name="document-text-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={2}>{state.name}</Text>
              <Text style={styles.fileSize}>
                {state.size > 0 ? `${(state.size / 1024).toFixed(0)} KB` : "Size unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <SecondaryButton
              label="Change file"
              compact
              onPress={pickFile}
              icon={<Ionicons name="refresh-outline" size={16} color={colors.text} />}
            />
            <PrimaryButton
              label="Upload & process"
              onPress={upload}
              icon={<Ionicons name="cloud-upload-outline" size={18} color={colors.white} />}
            />
          </View>
        </Card>
      )}

      {/* Uploading */}
      {state.status === "uploading" && (
        <Card soft padding="lg" style={styles.statusCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusTitle}>Processing…</Text>
          <Text style={styles.statusSub}>
            Running OCR and saving to care memory. This can take up to 30 seconds for images.
          </Text>
        </Card>
      )}

      {/* Success */}
      {state.status === "success" && (
        <Card padding="lg" style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Saved to care memory</Text>
          <Text style={styles.successSub}>{state.message}</Text>
          <SecondaryButton
            label="Upload another"
            onPress={reset}
            icon={<Ionicons name="add-outline" size={18} color={colors.text} />}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dropzone: { alignItems: "center", gap: spacing.md },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    width: "100%",
  },
  errorText: { ...typography.bodySmall, color: colors.danger, flex: 1 },

  pickedCard: { gap: spacing.md },
  fileRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  fileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileInfo: { flex: 1, gap: 4 },
  fileName: { ...typography.body, color: colors.text, fontWeight: "600" },
  fileSize: { ...typography.caption, color: colors.textSecondary },
  actionRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },

  statusCard: { alignItems: "center", gap: spacing.md },
  statusTitle: { ...typography.h3, color: colors.text },
  statusSub: { ...typography.bodySmall, color: colors.textSecondary, textAlign: "center" },

  successCard: { alignItems: "center", gap: spacing.md, backgroundColor: "#F0FDF4" },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { ...typography.h3, color: colors.success },
  successSub: { ...typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
});
