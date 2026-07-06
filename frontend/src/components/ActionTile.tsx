import Ionicons, { glyphMap } from "@/components/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

type Props = {
  icon: keyof typeof glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  accent?: string;
};

export function ActionTile({ icon, title, subtitle, onPress, accent = colors.primary }: Props) {
  return (
    <PressableScale onPress={onPress} style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
    shadowColor: "#111827",
    shadowOpacity: 0.04,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
