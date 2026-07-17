/**
 * CaregiverDrawerMenu — slide-in hamburger for the caregiver section.
 * Mirrors the admin DrawerMenu but:
 *  - Uses caregiver identity (name / token) from session
 *  - "Sign out" clears caregiverToken and navigates back to welcome
 *  - Supports swipe-left gesture to close (PanResponder)
 */
import Ionicons, { glyphMap } from "@/components/Ionicons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "@/context/SessionContext";
import { caregiverCache } from "@/services/cache";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;
const SWIPE_THRESHOLD = DRAWER_WIDTH * 0.3; // swipe 30% of drawer width to close

type NavItem = {
  label: string;
  icon: keyof typeof glyphMap;
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: "home-outline", route: "/(caregiver)/(tabs)/home" },
  { label: "Shift handover", icon: "document-text-outline", route: "/(caregiver)/(tabs)/handover" },
  { label: "Ask assistant", icon: "chatbubble-outline", route: "/(caregiver)/(tabs)/chat" },
  { label: "Emergency card", icon: "medkit-outline", route: "/(caregiver)/(tabs)/emergency" },
  { label: "My profile", icon: "person-outline", route: "/(caregiver)/(tabs)/profile" },
];

type Props = { visible: boolean; onClose: () => void };

export function CaregiverDrawerMenu({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { caregiverName, caregiverToken, setCaregiverToken, setCaregiverName, setRole } = useSession();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Open / close animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: visible ? 0 : -DRAWER_WIDTH,
        useNativeDriver: true,
        stiffness: 280,
        damping: 28,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  // Pan responder — swipe left to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && dx < -10, // horizontal left swipe
      onPanResponderMove: (_, { dx }) => {
        if (dx < 0) translateX.setValue(Math.max(dx, -DRAWER_WIDTH));
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const shouldClose = dx < -SWIPE_THRESHOLD || vx < -0.5;
        if (shouldClose) {
          onClose();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 280,
            damping: 28,
          }).start();
        }
      },
    }),
  ).current;

  const navigate = (route: string) => {
    onClose();
    router.replace(route as any);
  };

  const handleSignOut = async () => {
    onClose();
    // Clear cached data for this token before wiping the session
    if (caregiverToken) {
      await caregiverCache.clear(caregiverToken);
    }
    setRole("none");
    setCaregiverToken(null as any);
    setCaregiverName(null as any);
    // Navigate directly to login/role-selection — skip index.tsx to avoid
    // a race where role is still "caregiver" and we loop back to welcome.
    router.replace("/(auth)/login");
  };

  if (!visible && (translateX as any)._value === -DRAWER_WIDTH) return null;

  const initials = caregiverName?.charAt(0).toUpperCase() ?? "C";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md },
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {caregiverName ?? "Caregiver"}
            </Text>
            <Text style={styles.roleBadgeText}>On shift</Text>
            {caregiverToken ? (
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenBadgeText} numberOfLines={1}>
                  {caregiverToken.slice(0, 12)}…
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Nav items */}
        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
              onPress={() => navigate(item.route)}
            >
              <View style={styles.navIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Sign out / switch account */}
        <Pressable
          style={({ pressed }) => [styles.navItem, styles.signOutItem, pressed && styles.navItemPressed]}
          onPress={handleSignOut}
        >
          <View style={[styles.navIcon, styles.dangerIcon]}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </View>
          <Text style={[styles.navLabel, styles.dangerLabel]}>End shift / switch account</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    ...shadows.float,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { ...typography.h3, color: colors.success },
  headerInfo: { flex: 1, gap: 2 },
  displayName: { ...typography.body, color: colors.text, fontWeight: "700" },
  roleBadgeText: { ...typography.caption, color: colors.success, fontWeight: "600" },
  tokenBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tokenBadgeText: { ...typography.caption, color: colors.textSecondary, fontFamily: "monospace" },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  navList: { gap: 2 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  navItemPressed: { backgroundColor: colors.surface },
  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: { ...typography.body, color: colors.text, fontWeight: "500" },
  signOutItem: { marginTop: 4 },
  dangerIcon: { backgroundColor: colors.dangerLight },
  dangerLabel: { color: colors.danger },
});
