import IoniconsLib from "@react-native-vector-icons/ionicons";

// Reference list of icons used in the project (not exhaustive).
// name is typed as string so any valid Ionicons name works without TS errors.
export const glyphMap = {
  "arrow-forward": true,
  "arrow-back": true,
  "arrow-back-outline": true,
  "chevron-forward": true,
  "chevron-back": true,

  "send": true,
  "add-outline": true,
  "close": true,
  "close-outline": true,
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
  "menu-outline": true,
  "checkmark": true,
  "checkmark-circle-outline": true,
  "alert-circle-outline": true,
  "information-circle-outline": true,
  "hand-left-outline": true,
  "key-outline": true,
  "hourglass-outline": true,
  "refresh-outline": true,
  "sparkles-outline": true,
} as const;

type Props = {
  name: string;  // any valid Ionicons icon name
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
      name={name as any}
      size={size}
      color={color}
    />
  );
}