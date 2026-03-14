/**
 * SmartPay Design System Semantic Color Tokens
 *
 * All components must reference these tokens.
 * No inline hex values anywhere in the codebase.
 */

export const lightColors = {
    background: "#FFFFFF",
    surface: "#F7F7F7",
    border: "#E0E0E0",
    borderHover: "#BDBDBD",
    textPrimary: "#111111",
    textSecondary: "#555555",
    textTertiary: "#888888",
    accent: "#111111",
    accentHover: "#333333",
    accentText: "#FFFFFF",
    highlight: "#D0FF00",
    highlightText: "#111111",
} as const;

export const darkColors = {
    background: "#0A0A0A",
    surface: "#141414",
    border: "#262626",
    borderHover: "#404040",
    textPrimary: "#F0F0F0",
    textSecondary: "#A0A0A0",
    textTertiary: "#666666",
    accent: "#F0F0F0",
    accentHover: "#D4D4D4",
    accentText: "#0A0A0A",
    highlight: "#D0FF00",
    highlightText: "#111111",
} as const;

export type ColorToken = keyof typeof lightColors;
