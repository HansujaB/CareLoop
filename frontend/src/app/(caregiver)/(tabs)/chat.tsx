import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@/components/Ionicons";
import { Card } from "@/components/ui/Card";
import { CaregiverDrawerMenu } from "@/components/ui/CaregiverDrawerMenu";
import { TopNav } from "@/components/ui/TopNav";
import { PressableScale } from "@/components/ui/PressableScale";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Message = { id: string; role: "user" | "assistant"; text: string };

const GREETING: Message = {
  id: "0",
  role: "assistant",
  text: "Hi! Ask me anything about the care profile — allergies, routines, medications, and more.",
};

const SUGGESTIONS = [
  "Any food allergies?",
  "When is nap time?",
  "What if they start coughing?",
];

export default function CaregiverChatScreen() {
  const { caregiverToken } = useSession();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!caregiverToken) router.replace("/(caregiver)/welcome");
  }, [caregiverToken]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending || !caregiverToken) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.caregiverChat(caregiverToken, question);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-a`, role: "assistant", text: res.answer },
      ]);
    } catch (err: any) {
      const isRevoked =
        err?.message?.toLowerCase().includes("revoked") ||
        err?.message?.toLowerCase().includes("invalid");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          text: isRevoked
            ? "Your care link has been revoked. Please ask the parent for a new link."
            : "Sorry, couldn't reach the care memory right now. Please try again.",
        },
      ]);
      if (isRevoked) setTimeout(() => router.replace("/(caregiver)/welcome"), 3000);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  return (
    <>
      {/*
        Single KeyboardAvoidingView wrapping everything.
        paddingTop accounts for the status bar so the nav sits flush.
        On Android we use "height" so the whole view shrinks; on iOS "padding"
        pushes content up without resizing.
      */}
      <KeyboardAvoidingView
        style={[styles.root, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Nav bar */}
        <TopNav
          title="Ask anything"
          subtitle="About the care profile"
          onMenuPress={() => setDrawerOpen(true)}
        />

        {/* Suggestion chips */}
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((q) => (
            <PressableScale key={q} onPress={() => send(q)} style={styles.chip}>
              <Text style={styles.chipText}>{q}</Text>
            </PressableScale>
          ))}
        </View>

        {/* Message list — fills remaining space */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          style={styles.flatList}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrap, item.role === "user" && styles.userWrap]}>
              <Card
                soft={item.role === "assistant"}
                elevated={item.role === "user"}
                padding="md"
                style={[styles.bubble, item.role === "user" && styles.userBubble]}
              >
                <Text style={[styles.bubbleText, item.role === "user" && styles.userText]}>
                  {item.text}
                </Text>
              </Card>
            </View>
          )}
        />

        {/* Composer — always at the bottom, above the home indicator */}
        <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about routines, meds, allergies..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!sending}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <PressableScale
            onPress={() => send(input)}
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>

      <CaregiverDrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  flatList: { flex: 1 },
  list: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  bubbleWrap: { alignItems: "flex-start" },
  userWrap:   { alignItems: "flex-end" },
  bubble:     { maxWidth: "88%" },
  userBubble: { backgroundColor: colors.primary, borderColor: colors.primary },
  bubbleText: { ...typography.body, color: colors.textSecondary },
  userText:   { color: colors.white },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    ...typography.body,
    color: colors.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.6 },
});
