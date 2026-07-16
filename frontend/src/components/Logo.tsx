/**
 * Logo components backed by the real image assets in /assets.
 *
 *   <Logo />          — wordmark version (icon + "CareLoop" text), used on auth screens
 *   <LogoMark />      — icon-only, used in the TopNav when a hamburger is also present
 */
import { Image, StyleSheet, View } from "react-native";

// Metro resolves static require() at bundle time so the paths must be literals.
const LOGO_WITH_NAME = require("@/assets/logo_with_name.png");
const LOGO_ICON      = require("@/assets/logo.png");

type LogoProps = {
  /** Height of the full wordmark image. Width scales proportionally. Default: 32 */
  height?: number;
};

type LogoMarkProps = {
  /** Height (and width) of the icon-only image. Default: 32 */
  size?: number;
};

/**
 * Full wordmark — icon + "CareLoop" text side by side.
 * Use on splash / auth / onboarding screens.
 */
export function Logo({ height = 32 }: LogoProps) {
  // logo_with_name.png is wider than tall; preserve aspect ratio via undefined width
  return (
    <View style={styles.logoWrap}>
      <Image
        source={LOGO_WITH_NAME}
        style={{ height, width: undefined, aspectRatio: undefined }}
        resizeMode="contain"
        accessibilityLabel="CareLoop"
      />
    </View>
  );
}

/**
 * Icon-only mark — used in nav bars where horizontal space is limited.
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
    // Prevents the image from stretching inside flex rows
    alignSelf: "flex-start",
  },
});
