import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.wrap, fullWidth && styles.fullWidth, isDisabled && styles.disabled]}
    >
      {/* Solid gradient replacement — no expo-linear-gradient needed */}
      <View style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.button,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.55,
  },
  gradient: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
