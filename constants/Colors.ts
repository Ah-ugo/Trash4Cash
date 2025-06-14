export const Colors = {
  // Primary colors
  primary: "#10B981",
  primaryLight: "#34D399",
  primaryDark: "#059669",

  // Secondary colors
  secondary: "#F59E0B",
  secondaryLight: "#FBBF24",
  secondaryDark: "#D97706",

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",
  dark: "#1F2937",
  gray900: "#111827",
  gray800: "#1F2937",
  gray700: "#374151",
  gray600: "#4B5563",
  gray500: "#6B7280",
  gray400: "#9CA3AF",
  gray300: "#D1D5DB",
  gray200: "#E5E7EB",
  gray100: "#F3F4F6",

  // Background colors
  background: "#F9FAFB",
  surface: "#FFFFFF",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Utility colors
  green500: "#10B981",
  blue500: "#3B82F6",
  red500: "#EF4444",
  yellow500: "#F59E0B",

  // Text colors
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    color: Colors.dark,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
    color: Colors.dark,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    color: Colors.dark,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  bodySemiBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    color: Colors.dark,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    color: Colors.dark,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    color: Colors.gray600,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
};
