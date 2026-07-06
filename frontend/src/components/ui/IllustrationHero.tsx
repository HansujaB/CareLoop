import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function IllustrationHero({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      {/* Solid background circle — no expo-linear-gradient needed */}
      <View style={styles.circleOuter}>
        <View style={styles.circleInner}>
          <Ionicons name={icon} size={56} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    backgroundColor: colors.primaryLight,
  },
  circleInner: {
    width: 120,
    height: 120,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 320,
  },
});
