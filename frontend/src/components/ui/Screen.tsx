import { useState } from "react";
import { ScrollView, StyleSheet, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopNav } from "@/components/ui/TopNav";
import { DrawerMenu } from "@/components/ui/DrawerMenu";
import { colors, spacing } from "@/constants/theme";

type Props = ViewProps & {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  navTitle?: string;
  navSubtitle?: string;
  showNav?: boolean;
  showMenu?: boolean;
  avatarInitials?: string;
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  navTitle,
  navSubtitle,
  showNav = true,
  showMenu = true,
  avatarInitials,
  bottomInset = 32,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const content = (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        { paddingBottom: bottomInset + insets.bottom },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {showNav ? (
        <TopNav
          title={navTitle}
          subtitle={navSubtitle}
          avatarInitials={avatarInitials}
          onMenuPress={showMenu ? () => setDrawerOpen(true) : undefined}
        />
      ) : null}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {showMenu ? (
        <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.md },
});
