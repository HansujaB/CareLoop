// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure .ttf files are resolved as assets (required for @expo/vector-icons font files)
if (!config.resolver.assetExts.includes("ttf")) {
  config.resolver.assetExts.push("ttf");
}

module.exports = config;
