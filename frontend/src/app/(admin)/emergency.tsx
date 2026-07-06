import { StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { DEMO_EMERGENCY } from "@/constants/demo";
import { colors, typography } from "@/constants/theme";

export default function EmergencyScreen() {
  return (
    <Screen navTitle="Emergency card" navSubtitle="Critical info at a glance">
      <Card style={styles.card} padding="md">
        <Text style={styles.body}>{DEMO_EMERGENCY}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.dangerLight, borderColor: "#FECACA" },
  body: { ...typography.body, color: colors.text, lineHeight: 26 },
});
