import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

type Props = {
  total: number;
  current: number;
};

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === current ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  active: {
    width: 28,
    backgroundColor: colors.primary,
  },
  inactive: {
    width: 8,
    backgroundColor: colors.border,
  },
});
