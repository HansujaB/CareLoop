import { Text } from "react-native";

/**
 * Lightweight local icon component — zero external dependencies.
 * Maps Ionicons names to Unicode/emoji so the app bundles without any
 * @expo/vector-icons or @react-native-vector-icons packages.
 */

const ICON_MAP: Record<string, string> = {
  // Navigation / arrows
  "arrow-forward": "→",
  "arrow-back": "←",
  "chevron-forward": "›",
  "chevron-back": "‹",

  // Actions
  "send": "➤",
  "add-outline": "+",
  "close-circle-outline": "✕",
  "share-outline": "⇧",

  // Communication
  "chatbubble-outline": "💬",
  "notifications-outline": "🔔",
  "mic": "🎙",
  "mic-outline": "🎤",
  "stop": "⏹",

  // People
  "person-outline": "👤",
  "person-add-outline": "👤+",
  "log-in-outline": "→",
  "log-out-outline": "←",

  // Health / care
  "heart-outline": "♡",
  "heart": "♥",
  "medkit-outline": "🩺",

  // Documents / files
  "document-outline": "📄",
  "document-text-outline": "📝",
  "cloud-upload-outline": "☁↑",

  // Misc
  "home-outline": "🏠",
  "link-outline": "🔗",
  "ellipse-outline": "○",
  "search-outline": "🔍",
  "settings-outline": "⚙",
};

// Export the map so `keyof typeof glyphMap` still works in type annotations
export const glyphMap = ICON_MAP;

type Props = {
  name: string;
  size?: number;
  color?: string;
};

function Ionicons({ name, size = 20, color = "#000" }: Props) {
  const char = ICON_MAP[name] ?? "•";
  return (
    <Text
      style={{
        fontSize: size * 0.75,
        color,
        textAlign: "center",
        lineHeight: size,
        width: size,
        height: size,
      }}
      allowFontScaling={false}
    >
      {char}
    </Text>
  );
}

export default Ionicons;
