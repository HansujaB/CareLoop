import Ionicons from "@/components/Ionicons";
import { useState } from "react";
import {
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
import { DEMO_CHAT } from "@/constants/demo";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Message = { id: string; role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Any food allergies?",
  "When is nap time?",
  "What if he starts coughing?",
];

export default function CaregiverChatScreen() {
  const [messages, setMessages] = useState<Message[]>(DEMO_CHAT);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const question = text.trim();
    if (!question) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: question },
      {
        id: `${Date.now()}-a`,
        role: "assistant",
        text: "He has a peanut allergy — no nuts in any food. Inhaler at 2 PM; give early if coughing starts.",
      },
    ]);
    setInput("");
  };

  return (
    <Screen
      navTitle="Ask anything"
      navSubtitle="Powered by Cognee recall"
      bottomInset={120}
      scroll={false}
    >
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((q) => (
          <PressableScale key={q} onPress={() => send(q)} style={styles.chip}>
            <Text style={styles.chipText}>{q}</Text>
          </PressableScale>
        ))}
      </View>

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
            placeholder="Ask about routines, meds, allergies..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <PressableScale onPress={() => send(input)} style={styles.sendBtn}>
            <Ionicons name="send" size={18} color={colors.white} />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  bubbleWrap: { alignItems: "flex-start" },
  userWrap: { alignItems: "flex-end" },
  bubble: { maxWidth: "88%" },
  userBubble: { backgroundColor: colors.primary, borderColor: colors.primary },
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
