import Ionicons from "@/components/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Props = {
  size?: number;
  name?: string;
  initials?: string;
};

export function Logo({ size = 32, name = "CareLoop", initials = "CL" }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.32 }]}>
        <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <Ionicons name="heart-outline" size={size * 0.48} color={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  mark: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.white,
    fontWeight: "700",
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
});
