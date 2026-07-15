import Ionicons from "@/components/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

type LinkItem = {
  link_id: string;
  token: string;
  url: string;
  status: string;
  caregiver_name?: string | null;
};

export default function LinksScreen() {
  const { profileId, profileName } = useSession();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);  // stores link_id of copied item

  const loadLinks = useCallback(async () => {
    if (!profileId) return;
    try {
      const data = await api.listLinks(profileId);
      setLinks(data);
    } catch {
      // silent — empty list shown
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const generateLink = async () => {
    if (!profileId || generating) return;
    setGenerating(true);
    try {
      const link = await api.createLink(profileId);
      setLinks((prev) => [link, ...prev]);
    } catch {
      // ignore for now
    } finally {
      setGenerating(false);
    }
  };

  const revokeLink = async (linkId: string) => {
    if (!profileId) return;
    try {
      await api.revokeLink(profileId, linkId);
      setLinks((prev) => prev.filter((l) => l.link_id !== linkId));
    } catch {
      // ignore
    }
  };

  const shareLink = async (link: LinkItem) => {
    const message = `CareLoop shift link for ${profileName}\nToken: ${link.token}\nDeep link: ${link.url}`;
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(link.link_id);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // ignore
      }
    } else {
      const { Share } = await import("react-native");
      await Share.share({ message });
    }
  };

  return (
    <Screen navTitle="Caregiver links" navSubtitle="No login required for caregivers">
      <PrimaryButton
        label={generating ? "Generating…" : "Generate new link"}
        onPress={generateLink}
        icon={<Ionicons name="add-outline" size={18} color={colors.white} />}
      />

      <Text style={styles.sectionTitle}>Active links</Text>

      {loading ? (
        <Card soft padding="md" style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </Card>
      ) : links.length === 0 ? (
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
                  {link.caregiver_name ?? "Unused link"}
                </Text>
                {/* Show token prominently so it's easy to copy/share */}
                <Text style={styles.linkToken} numberOfLines={1} selectable>
                  {link.token}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <SecondaryButton
                compact
                label={copied === link.link_id ? "Copied!" : "Share"}
                onPress={() => shareLink(link)}
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
  center: { alignItems: "center", justifyContent: "center", minHeight: 80 },
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
  linkToken: { ...typography.caption, color: colors.primary, fontFamily: "monospace" },
  activeBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  activeText: { ...typography.caption, color: colors.success, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.sm },
});
