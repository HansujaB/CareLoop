import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "@/components/ui/Chip";
import { spacing } from "@/constants/theme";

type Item = { key: string; label: string };

type Props = {
  items: Item[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function ChipGroup({ items, selectedKey, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          selected={item.key === selectedKey}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
