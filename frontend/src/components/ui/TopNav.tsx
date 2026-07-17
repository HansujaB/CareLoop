import Ionicons from "@/components/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Logo, LogoMark } from "@/components/Logo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  title?: string;
  subtitle?: string;
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
      {/* Left — hamburger (if present) + title block */}
      <View style={styles.left}>
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </Pressable>
        ) : null}

        {(title || subtitle) ? (
          <View style={styles.titleBlock}>
            {title    ? <Text style={styles.title}    numberOfLines={1}>{title}</Text>    : null}
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>

      {/* Right — logo mark (screens with hamburger) or full wordmark (standalone screens) */}
      <View style={styles.right}>
        {rightSlot ? rightSlot : null}
        {showLogo ? (
          onMenuPress
            ? <LogoMark size={30} />          // hamburger screen: compact icon on right
            : <Logo height={26} />            // standalone screen: wordmark on right
        ) : null}
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
  title:    { ...typography.h3,      color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
