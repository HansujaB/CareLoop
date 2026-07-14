import Ionicons from "@/components/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LogoMark } from "@/components/Logo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  avatarInitials?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  rightSlot?: React.ReactNode;
};

export function TopNav({
  title,
  subtitle,
  showLogo = true,
  avatarInitials = "P",
  onMenuPress,
  onNotificationPress,
  onAvatarPress,
  rightSlot,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {/* Hamburger — shown if onMenuPress is provided */}
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </Pressable>
        ) : showLogo ? (
          <LogoMark size={36} />
        ) : null}

        {(title || subtitle) ? (
          <View style={styles.titleBlock}>
            {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.right}>
        {rightSlot}
        <Pressable onPress={onAvatarPress} style={styles.avatar} hitSlop={8}>
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        </Pressable>
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
  titleBlock: { flex: 1 },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
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
  avatarText: { ...typography.label, color: colors.primary },
});
