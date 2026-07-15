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