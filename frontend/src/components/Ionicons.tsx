// import { Text } from "react-native";

// /**
//  * Lightweight local icon component — zero external dependencies.
//  * Maps Ionicons names to Unicode/emoji so the app bundles without any
//  * @expo/vector-icons or @react-native-vector-icons packages.
//  */

// const ICON_MAP: Record<string, string> = {
//   // Navigation / arrows
//   "arrow-forward": "→",
//   "arrow-back": "←",
//   "chevron-forward": "›",
//   "chevron-back": "‹",

//   // Actions
//   "send": "➤",
//   "add-outline": "+",
//   "close-circle-outline": "✕",
//   "share-outline": "⇧",

//   // Communication
//   "chatbubble-outline": "💬",
//   "notifications-outline": "🔔",
//   "mic": "🎙",
//   "mic-outline": "🎤",
//   "stop": "⏹",

//   // People
//   "person-outline": "👤",
//   "person-add-outline": "👤+",
//   "log-in-outline": "→",
//   "log-out-outline": "←",

//   // Health / care
//   "heart-outline": "♡",
//   "heart": "♥",
//   "medkit-outline": "🩺",

//   // Documents / files
//   "document-outline": "📄",
//   "document-text-outline": "📝",
//   "cloud-upload-outline": "☁↑",

//   // Misc
//   "home-outline": "🏠",
//   "link-outline": "🔗",
//   "ellipse-outline": "○",
//   "search-outline": "🔍",
//   "settings-outline": "⚙",
// };

// // Export the map so `keyof typeof glyphMap` still works in type annotations
// export const glyphMap = ICON_MAP;

// type Props = {
//   name: string;
//   size?: number;
//   color?: string;
// };

// function Ionicons({ name, size = 20, color = "#000" }: Props) {
//   const char = ICON_MAP[name] ?? "•";
//   return (
//     <Text
//       style={{
//         fontSize: size * 0.75,
//         color,
//         textAlign: "center",
//         lineHeight: size,
//         width: size,
//         height: size,
//       }}
//       allowFontScaling={false}
//     >
//       {char}
//     </Text>
//   );
// }

// export default Ionicons;

import IoniconsLib from "@react-native-vector-icons/ionicons";

// Export an empty glyphMap for compatibility with
// `keyof typeof glyphMap` type annotations elsewhere.
export const glyphMap = {
  "arrow-forward": true,
  "arrow-back": true,
  "chevron-forward": true,
  "chevron-back": true,

  "send": true,
  "add-outline": true,
  "close-circle-outline": true,
  "share-outline": true,

  "chatbubble-outline": true,
  "notifications-outline": true,
  "mic": true,
  "mic-outline": true,
  "stop": true,

  "person-outline": true,
  "person-add-outline": true,
  "log-in-outline": true,
  "log-out-outline": true,

  "heart-outline": true,
  "heart": true,
  "medkit-outline": true,

  "document-outline": true,
  "document-text-outline": true,
  "cloud-upload-outline": true,

  "home-outline": true,
  "link-outline": true,
  "ellipse-outline": true,
  "search-outline": true,
  "settings-outline": true,
} as const;

type Props = {
  name: keyof typeof glyphMap;
  size?: number;
  color?: string;
};

export default function Ionicons({
  name,
  size = 20,
  color = "#000",
}: Props) {
  return (
    <IoniconsLib
      name={name}
      size={size}
      color={color}
    />
  );
}