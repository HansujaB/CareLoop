import { StyleSheet, View, ViewProps } from "react-native";
import { colors, radius, shadows, spacing } from "@/constants/theme";

type Props = ViewProps & {
  elevated?: boolean;
  soft?: boolean;
  padding?: keyof typeof spacing;
};

export function Card({
  children,
  style,
  elevated = true,
  soft = false,
  padding = "md",
  ...rest
}: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        elevated && styles.elevated,
        soft && styles.soft,
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  soft: {
    backgroundColor: colors.surface,
    borderWidth: 0,
  },
});
