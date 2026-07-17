import Ionicons from "@/components/Ionicons";
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
import { Card } from "@/components/ui/Card";
import { PressableScale } from "@/components/ui/PressableScale";
import { Screen } from "@/components/ui/Screen";
import { useSession } from "@/context/SessionContext";
import { api } from "@/services/api";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Message = { id: string; role: "user" | "assistant"; text: string };

const GREETING: Message = {
  id: "0",
  role: "assistant",
  text: "Hi! Ask me anything about the care profile — allergies, routines, medications, and more.",
};

export default function ChatScreen() {
  const { profileId, firebaseUser } = useSession();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const send = async () => {
    const question = input.trim();
    if (!question || sending || !profileId || !firebaseUser) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.chat(profileId, firebaseUser.uid, question);
      const assistantMsg: Message = {
        id: `${Date.now()}-a`,
        role: "assistant",
        text: res.answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: `${Date.now()}-err`,
        role: "assistant",
        text: "Sorry, I couldn't reach the care memory right now. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
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
    <Screen navTitle="Care assistant" navSubtitle="Ask about the care profile" bottomInset={120} scroll={false}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="What time is the medication?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!sending}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <PressableScale onPress={send} style={[styles.sendBtn, sending && styles.sendBtnDisabled]}>
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  bubbleWrap: { alignItems: "flex-start" },
  userWrap: { alignItems: "flex-end" },
  bubble: { maxWidth: "88%" },
  userBubble: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bubbleText: { ...typography.body, color: colors.textSecondary },
  userText: { color: colors.white },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
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
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
