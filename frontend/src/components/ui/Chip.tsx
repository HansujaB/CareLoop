import { StyleSheet, Text } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.unselected]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  labelSelected: {
    color: colors.white,
  },
  labelDefault: {
    color: colors.textSecondary,
  },
});
