/**
 * Logo components backed by the real image assets in /assets.
 *
 *   <Logo />      — full wordmark (icon + "CareLoop" text), login / auth screens
 *   <LogoMark />  — icon only, TopNav right corner
 *
 * IMPORTANT: use relative require() paths — Metro does not honour
 * TypeScript path aliases (@/assets/*) for asset resolution.
 * These paths are relative to THIS file: src/components/Logo.tsx
 *       ../../assets/  →  frontend/assets/
 */
import { Image, StyleSheet, View } from "react-native";

const LOGO_WITH_NAME = require("../../assets/logo_with_name.png");
const LOGO_ICON      = require("../../assets/logo.png");

type LogoProps = {
  /** Height of the rendered wordmark. Width is derived from the image's natural aspect ratio. */
  height?: number;
};

type LogoMarkProps = {
  /** Square size of the icon-only mark. */
  size?: number;
};

/**
 * Full wordmark — icon + "CareLoop" name.
 * Renders at the requested height; width stretches to fill the container
 * so the image is never clipped regardless of the natural aspect ratio.
 */
export function Logo({ height = 32 }: LogoProps) {
  return (
    <View style={[styles.logoWrap, { height }]}>
      <Image
        source={LOGO_WITH_NAME}
        style={styles.logoImage}
        resizeMode="contain"
        accessibilityLabel="CareLoop"
      />
    </View>
  );
}

/**
 * Square icon mark — used in TopNav when a hamburger is also visible.
 */
export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <Image
      source={LOGO_ICON}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="CareLoop"
    />
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    // Let the image fill the container naturally; container height is set inline.
    justifyContent: "center",
    alignSelf: "center",
    // Give the wrapper enough width to show the whole wordmark.
    // 3:1 is a conservative aspect ratio that works for typical wordmarks.
    aspectRatio: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
});
