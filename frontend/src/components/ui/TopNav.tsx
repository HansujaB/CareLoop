import Ionicons from "@/components/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import { LogoMark } from "@/components/Logo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  avatarInitials?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  rightSlot?: React.ReactNode;
};

export function TopNav({
  title,
  subtitle,
  showLogo = true,
  avatarInitials = "P",
  onNotificationPress,
  onAvatarPress,
  rightSlot,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showLogo ? (
          <LogoMark size={36} />
        ) : (
          <View>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        )}
        {showLogo && title ? (
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.right}>
        {rightSlot}
        <PressableScale onPress={onNotificationPress} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.dot} />
        </PressableScale>
        <PressableScale onPress={onAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  avatarText: {
    ...typography.label,
    color: colors.primary,
  },
});
