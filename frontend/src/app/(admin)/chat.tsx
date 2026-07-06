import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { PressableScale } from "@/components/ui/PressableScale";
import { Screen } from "@/components/ui/Screen";
import { DEMO_CHAT } from "@/constants/demo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Message = { id: string; role: "user" | "assistant"; text: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(DEMO_CHAT);
  const [input, setInput] = useState("");

  const send = () => {
    const question = input.trim();
    if (!question) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: question };
    const answer: Message = {
      id: `${Date.now()}-a`,
      role: "assistant",
      text: "Based on the care profile, I'll help with that once connected to the backend recall endpoint.",
    };
    setMessages((prev) => [...prev, userMsg, answer]);
    setInput("");
  };

  return (
    <Screen navTitle="Care assistant" navSubtitle="Ask natural questions" bottomInset={120} scroll={false}>
      <FlatList
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
            placeholder="What time is the inhaler?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <PressableScale onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color={colors.white} />
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
});
