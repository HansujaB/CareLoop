import Ionicons from "@/components/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Logo, LogoMark } from "@/components/Logo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  title?: string;
  subtitle?: string;
  /** Show the full wordmark (logo + name) when there is no hamburger. Default true. */
  showLogo?: boolean;
  onMenuPress?: () => void;
  rightSlot?: React.ReactNode;
};

export function TopNav({
  title,
  subtitle,
  showLogo = true,
  onMenuPress,
  rightSlot,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onMenuPress ? (
          // Hamburger screens: small icon mark + hamburger button
          <>
            <Pressable onPress={onMenuPress} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name="menu-outline" size={24} color={colors.text} />
            </Pressable>
            <LogoMark size={28} />
          </>
        ) : showLogo ? (
          // No hamburger: full wordmark fills the left side
          <Logo height={28} />
        ) : null}

        {(title || subtitle) ? (
          <View style={styles.titleBlock}>
            {title    ? <Text style={styles.title}    numberOfLines={1}>{title}</Text>    : null}
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>

      {/* Right slot for any optional action buttons — no avatar */}
      {rightSlot ? (
        <View style={styles.right}>{rightSlot}</View>
      ) : null}
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
  title:    { ...typography.h3,    color: colors.text },
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
});
