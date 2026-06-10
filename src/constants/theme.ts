import { Dimensions, PixelRatio, Platform } from "react-native";

// ──────────────────────────────────────────────────────────────────────────
// Responsive scaling
// Guideline sizes are based on a standard ~375pt-wide handset (iPhone X).
// On that device every scaled value equals its input, so existing phones look
// pixel-identical; smaller phones shrink slightly, larger phones / tablets grow
// — but the short-edge is clamped so tablets never blow up out of proportion.
// ──────────────────────────────────────────────────────────────────────────

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const SHORT_EDGE = Math.min(WINDOW_WIDTH, WINDOW_HEIGHT);
const LONG_EDGE = Math.max(WINDOW_WIDTH, WINDOW_HEIGHT);

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

// Clamp the short edge so very wide devices (tablets/foldables) don't over-scale.
const CLAMPED_SHORT_EDGE = Math.min(SHORT_EDGE, 480);

export const IS_TABLET = SHORT_EDGE >= 600;

/** Scale a size proportionally to screen width (clamped for tablets). */
export const scale = (size: number): number =>
  (CLAMPED_SHORT_EDGE / GUIDELINE_BASE_WIDTH) * size;

/** Scale a size proportionally to screen height. */
export const verticalScale = (size: number): number =>
  (LONG_EDGE / GUIDELINE_BASE_HEIGHT) * size;

/**
 * Scale, but dampened — only moves `factor` of the way toward the full scale.
 * Great for spacing/radii where you want some growth but not 1:1 with width.
 */
export const moderateScale = (size: number, factor = 0.5): number =>
  size + (scale(size) - size) * factor;

/** Font scaling, rounded to the nearest device pixel for crisp text. */
export const scaleFont = (size: number): number => {
  const next = moderateScale(size, 0.45);
  return Math.round(PixelRatio.roundToNearestPixel(next));
};

export const SCREEN = {
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  shortEdge: SHORT_EDGE,
  longEdge: LONG_EDGE,
  isSmall: SHORT_EDGE < 360,
  isTablet: IS_TABLET,
  // Forms/content never stretch past this — keeps tablets readable & centered.
  maxContentWidth: IS_TABLET ? 560 : WINDOW_WIDTH,
};

// ──────────────────────────────────────────────────────────────────────────
// Color system
// Premium black + gold. Existing keys are preserved for backward-compat; new
// keys (surfaces, status colors, tints) unify what screens previously hardcoded.
// ──────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand — Jet black
  primary: "#141414", // header / dark surfaces
  primaryDark: "#0A0A0A",
  primarySoft: "#2B2B2B",

  // Brand — Gold (single source of truth; ClientDetail used to diverge)
  secondary: "#D4AF37",
  secondaryDark: "#B8911F",
  secondaryLight: "#F0D98A",
  secondaryTint: "rgba(212,175,55,0.14)", // gold @ ~14%

  // Surfaces
  background: "#F7F6F3", // warm off-white
  backgroundAlt: "#F1EFEA",
  card: "#FFFFFF",
  surfaceDark: "#1C1C1C",

  // Text
  text: "#1F1F1F",
  textMuted: "#5C5C5C",
  textLight: "#8A8A8A",
  textOnDark: "#FFFFFF",

  // Lines
  border: "#E7E4DD",
  borderStrong: "#D8D4CC",

  // Feedback
  error: "#C2362F",
  errorTint: "rgba(194,54,47,0.12)",
  success: "#2E8B57",
  successTint: "rgba(46,139,87,0.12)",
  warning: "#E0851B",
  warningTint: "rgba(224,133,27,0.12)",
  info: "#1F6FB2",
  infoTint: "rgba(31,111,178,0.12)",

  // Channels
  whatsapp: "#25D366",

  // Overlays / utilities
  overlay: "rgba(15,15,15,0.55)",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// Appointment / follow-up status → unified color + soft tint + readable label.
// Replaces the per-screen switch statements that hardcoded hex values.
export type StatusVisual = { color: string; tint: string; label: string };

export const STATUS_VISUALS: Record<string, StatusVisual> = {
  SCHEDULED: { color: COLORS.info, tint: COLORS.infoTint, label: "Scheduled" },
  COMPLETED: { color: COLORS.success, tint: COLORS.successTint, label: "Completed" },
  CANCELLED: { color: COLORS.error, tint: COLORS.errorTint, label: "Cancelled" },
  NO_SHOW: { color: COLORS.warning, tint: COLORS.warningTint, label: "No-Show" },
};

export const statusVisual = (code?: string): StatusVisual =>
  (code && STATUS_VISUALS[code]) || {
    color: COLORS.textLight,
    tint: "rgba(138,138,138,0.12)",
    label: "—",
  };

// ──────────────────────────────────────────────────────────────────────────
// Spacing — scaled so layouts breathe correctly on every device.
// ──────────────────────────────────────────────────────────────────────────

export const SPACING = {
  tiny: moderateScale(4),
  small: moderateScale(8),
  medium: moderateScale(16),
  large: moderateScale(24),
  xlarge: moderateScale(32),
  xxlarge: moderateScale(48),
};

// Radii
export const RADIUS = {
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(22),
  pill: 999,
};

// Type scale (scaled font sizes + sensible line-heights/weights)
export const FONT_SIZE = {
  display: scaleFont(34),
  h1: scaleFont(30),
  h2: scaleFont(24),
  h3: scaleFont(19),
  body: scaleFont(16),
  bodySmall: scaleFont(14),
  caption: scaleFont(12),
  overline: scaleFont(11),
};

export const FONTS = {
  regular: "System",
  bold: "System",
};

// ──────────────────────────────────────────────────────────────────────────
// Elevation
// ──────────────────────────────────────────────────────────────────────────

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  // Floating elements (FAB, sheets)
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  // Warm gold glow for primary CTAs
  gold: {
    shadowColor: COLORS.secondaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Motion — shared timing so animations feel consistent app-wide.
// ──────────────────────────────────────────────────────────────────────────

export const ANIM = {
  fast: 160,
  base: 240,
  slow: 360,
  // For staggered list entrances.
  stagger: 55,
  // Press feedback.
  pressScale: 0.97,
  spring: { damping: 16, stiffness: 180, mass: 0.9 } as const,
};

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export const IS_IOS = Platform.OS === "ios";
