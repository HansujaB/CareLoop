import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({ children, style, disabled, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && !disabled ? { opacity: 0.92, transform: [{ scale: 0.98 }] } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}
