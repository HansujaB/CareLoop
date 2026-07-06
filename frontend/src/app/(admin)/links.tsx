import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { colors, radius, spacing, typography } from "@/constants/theme";

type LinkItem = {
  link_id: string;
  token: string;
  url: string;
  status: string;
  caregiver_name?: string | null;
};

const DEMO_LINKS: LinkItem[] = [
  {
    link_id: "1",
    token: "demo-token-nanny",
    url: "careloop://c/demo-token-nanny",
    status: "active",
    caregiver_name: "Sam",
  },
];

export default function LinksScreen() {
  const { profileName } = useSession();
  const [links, setLinks] = useState(DEMO_LINKS);
  const [copied, setCopied] = useState<string | null>(null);

  const generateLink = () => {
    const token = `link-${Date.now().toString(36)}`;
    setLinks((prev) => [
      {
        link_id: String(prev.length + 1),
        token,
        url: `careloop://c/${token}`,
        status: "active",
      },
      ...prev,
    ]);
  };

  const revokeLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.link_id !== linkId));
  };

  const shareLink = async (url: string) => {
    // On web, copy to clipboard; on native, use Share
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(
          `CareLoop shift link for ${profileName}: ${url}`,
        );
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // ignore
      }
    } else {
      const { Share } = await import("react-native");
      await Share.share({ message: `CareLoop shift link for ${profileName}: ${url}` });
    }
  };

  return (
    <Screen navTitle="Caregiver links" navSubtitle="No login required for caregivers">
      <PrimaryButton
        label="Generate new link"
        onPress={generateLink}
        icon={<Ionicons name="add-outline" size={18} color={colors.white} />}
      />

      <Text style={styles.sectionTitle}>Active links</Text>
      {links.length === 0 ? (
        <Card soft padding="md">
          <Text style={styles.empty}>No active links. Generate one for your caregiver.</Text>
        </Card>
      ) : (
        links.map((link) => (
          <Card key={link.link_id} style={styles.linkCard} padding="md">
            <View style={styles.linkHeader}>
              <View style={styles.linkIcon}>
                <Ionicons name="link-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.linkText}>
                <Text style={styles.linkTitle}>
                  {link.caregiver_name ? link.caregiver_name : "Unused link"}
                </Text>
                <Text style={styles.linkUrl} numberOfLines={1}>
                  {link.url}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <SecondaryButton
                compact
                label={copied === link.url ? "Copied!" : "Share"}
                onPress={() => shareLink(link.url)}
                icon={<Ionicons name="share-outline" size={16} color={colors.text} />}
              />
              <SecondaryButton
                compact
                label="Revoke"
                onPress={() => revokeLink(link.link_id)}
                icon={<Ionicons name="close-circle-outline" size={16} color={colors.danger} />}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  empty: { ...typography.body, color: colors.textSecondary },
  linkCard: { marginBottom: spacing.sm, gap: spacing.md },
  linkHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { flex: 1, gap: 2 },
  linkTitle: { ...typography.body, color: colors.text, fontWeight: "600" },
  linkUrl: { ...typography.caption, color: colors.textSecondary },
  activeBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  activeText: { ...typography.caption, color: colors.success, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.sm },
});
