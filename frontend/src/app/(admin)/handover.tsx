import { StyleSheet, Text } from "react-native";
import { SummaryCard } from "@/components/SummaryCard";
import { Screen } from "@/components/ui/Screen";
import { DEMO_HANDOVER } from "@/constants/demo";
import { spacing, typography } from "@/constants/theme";

export default function HandoverScreen() {
  return (
    <Screen navTitle="Shift handover" navSubtitle="What caregivers see at shift start">
      <Text style={styles.lead}>
        Synthesized from Cognee graph memory, phrased by Groq for a natural briefing.
      </Text>
      <SummaryCard title="Shift briefing" body={DEMO_HANDOVER} badge="Live preview" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.bodySmall,
    color: "#6B7280",
    marginBottom: spacing.md,
  },
});
