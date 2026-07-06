import Ionicons from "@/components/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function UploadScreen() {
  return (
    <Screen navTitle="Medical records" navSubtitle="Upload PDF or image">
      <Card style={styles.dropzone} soft padding="lg">
        <View style={styles.iconWrap}>
          <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Upload a document</Text>
        <Text style={styles.subtitle}>
          Original saved to Firebase Storage. OCR text is cleaned by Groq, then sent to Cognee remember().
        </Text>
        <PrimaryButton
          label="Choose file"
          icon={<Ionicons name="document-outline" size={18} color={colors.white} />}
        />
      </Card>
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
});
