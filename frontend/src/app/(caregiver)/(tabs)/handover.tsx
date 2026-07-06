import { StyleSheet, Text } from "react-native";
import { SummaryCard } from "@/components/SummaryCard";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { DEMO_HANDOVER } from "@/constants/demo";
import { spacing, typography } from "@/constants/theme";

export default function CaregiverHandoverScreen() {
  const { caregiverName, profileName } = useSession();

  return (
    <Screen
      navTitle={`Good shift, ${caregiverName ?? "caregiver"}`}
      navSubtitle={`Briefing for ${profileName}`}
      avatarInitials={caregiverName?.charAt(0) ?? "C"}
    >
      <Text style={styles.lead}>
        Your shift handover — synthesized from everything the parent has stored in care memory.
      </Text>
      <SummaryCard title="Shift handover" body={DEMO_HANDOVER} badge="Start here" />
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
