/**
 * DrawerMenu — slide-in hamburger navigation for the admin section.
 * Rendered as an overlay so it works inside a Stack layout (no Tabs needed).
 */
import Ionicons, { glyphMap } from "@/components/Ionicons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "@/context/SessionContext";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

const DRAWER_WIDTH = Dimensions.get("window").width * 0.78;

type NavItem = {
  label: string;
  icon: keyof typeof glyphMap;
  route: string;
  destructive?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: "home-outline", route: "/(admin)" },
  { label: "Add memory", icon: "mic-outline", route: "/(admin)/memory" },
  { label: "Caregiver links", icon: "link-outline", route: "/(admin)/links" },
  { label: "Ask assistant", icon: "chatbubble-outline", route: "/(admin)/chat" },
  { label: "Shift handover", icon: "document-text-outline", route: "/(admin)/handover" },
  { label: "Emergency card", icon: "medkit-outline", route: "/(admin)/emergency" },
  { label: "Upload records", icon: "cloud-upload-outline", route: "/(admin)/upload" },
  { label: "Profile", icon: "person-outline", route: "/(admin)/profile" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function DrawerMenu({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { profileName, firebaseUser, resetSession } = useSession();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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

  const navigate = (route: string) => {
    onClose();
    router.replace(route as any);
  };

  const handleSignOut = async () => {
    onClose();
    await resetSession();
    setTimeout(() => router.replace("/(auth)/login"), 200);
  };

  if (!visible && translateX._value === -DRAWER_WIDTH) return null;

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
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {(firebaseUser?.displayName || profileName || "P").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.displayName} numberOfLines={1}>
              {firebaseUser?.displayName || "Parent"}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {firebaseUser?.email || ""}
            </Text>
            {profileName ? (
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>Managing {profileName}</Text>
              </View>
            ) : null}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close-outline" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Divider */}
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

        {/* Sign out */}
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.navItem, styles.signOutItem, pressed && styles.navItemPressed]}
          onPress={handleSignOut}
        >
          <View style={[styles.navIcon, styles.dangerIcon]}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </View>
          <Text style={[styles.navLabel, styles.dangerLabel]}>Sign out</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { ...typography.h3, color: colors.primary },
  headerInfo: { flex: 1, gap: 2 },
  displayName: { ...typography.body, color: colors.text, fontWeight: "700" },
  email: { ...typography.caption, color: colors.textSecondary },
  profileBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  profileBadgeText: { ...typography.caption, color: colors.primary, fontWeight: "600" },
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
