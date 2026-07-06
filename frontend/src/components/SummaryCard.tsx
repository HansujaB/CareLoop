import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/constants/theme";

type Props = {
  title: string;
  body: string;
  badge?: string;
  loading?: boolean;
};

export function SummaryCard({ title, body, badge, loading }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.body, loading && styles.loading]}>
        {loading ? "Generating your shift briefing…" : body}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  loading: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
