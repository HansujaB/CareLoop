export const colors = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  surfaceElevated: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F0F0F2",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",
  primaryMuted: "#DBEAFE",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  success: "#059669",
  successLight: "#ECFDF5",
  white: "#FFFFFF",
  overlay: "rgba(17, 24, 39, 0.04)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  float: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  button: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const typography = {
  hero: { fontSize: 32, fontFamily: "Inter_700Bold", fontWeight: "700" as const, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontFamily: "Inter_700Bold", fontWeight: "700" as const, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 16, fontFamily: "Inter_500Medium", fontWeight: "500" as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontFamily: "Inter_500Medium", fontWeight: "500" as const, lineHeight: 20 },
  caption: { fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" as const, lineHeight: 16 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, lineHeight: 18, letterSpacing: 0.2 },
} as const;
