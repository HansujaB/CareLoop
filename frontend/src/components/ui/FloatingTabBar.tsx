import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/components/ui/PressableScale";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

// Inline the tab bar props shape so we don't need @react-navigation/bottom-tabs as an
// explicit dep — expo-router bundles it internally but doesn't expose its types at the
// package root in all SDK versions.
type TabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: string | React.ReactNode;
        tabBarIcon?: () => React.ReactNode;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  memory: "mic-outline",
  links: "link-outline",
  profile: "person-outline",
  handover: "document-text-outline",
  chat: "chatbubble-outline",
  emergency: "medkit-outline",
};

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = TAB_ICONS[route.name] ?? "ellipse-outline";

          return (
            <PressableScale
              key={route.key}
              onPress={onPress}
              style={[styles.tab, isFocused && styles.tabFocused]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.float,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    gap: 2,
  },
  tabFocused: {
    backgroundColor: colors.primaryLight,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: "600",
  },
});
