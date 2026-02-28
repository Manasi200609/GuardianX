// src/utils/theme.js
// GuardianX v2 - Teal + Light Background Theme (Calm, Professional, Reassuring)

export const COLORS = {
  /* Brand Core - Teal Palette */
  primary: '#14B8A6',      // Primary teal (calm, trustworthy)
  secondary: '#0D9488',    // Darker teal accent
  accent: '#2DD4BF',       // Light teal for active states
  tealLight: '#5EEAD4',    // Very light teal for highlights
  tealDark: '#0F766E',     // Dark teal for depth

  /* Semantic Colors */
  danger: '#EF4444',       // SOS / Emergency
  warning: '#F59E0B',      // Alert / Caution
  success: '#10B981',      // Success / Active
  info: '#14B8A6',         // Info (matches primary)

  /* Background Layers - Light Theme */
  background: '#F8FAFC',   // Very light gray-blue (main bg)
  surface: '#FFFFFF',      // Pure white (cards/surfaces)
  card: '#FFFFFF',         // Card background
  elevated: '#F1F5F9',     // Elevated sections
  overlay: 'rgba(0,0,0,0.4)', // Modal overlays

  /* Borders & Dividers */
  border: '#E2E8F0',       // Light gray border
  divider: '#CBD5E1',      // Divider lines
  borderLight: '#F1F5F9',  // Very light border

  /* Text - Dark on Light */
  text: '#0F172A',         // Primary text (dark slate)
  textPrimary: '#0F172A',  // alias for legacy references
  textSecondary: '#475569', // Secondary text
  mutedText: '#64748B',    // Muted text
  subtleText: '#94A3B8',   // Subtle captions
  disabledText: '#CBD5E1', // Disabled text

  /* Status Colors */
  active: '#10B981',       // Active/on state (green)
  inactive: '#94A3B8',     // Inactive/off state
  standby: '#14B8A6',      // Standby (teal)

  /* Glow / Effects */
  glowPrimary: 'rgba(20,184,166,0.15)',
  glowSuccess: 'rgba(16,185,129,0.15)',
  glowDanger: 'rgba(239,68,68,0.15)',
  shadow: 'rgba(15,23,42,0.08)', // Subtle shadow
};

export const RADIUS = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 28,
  xLarge : 28,
  pill: 999,
};

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xLarge: 28,
  xxl: 36,
};

export const FONT = {
  hero: 32,
  title: 22,
  subtitle: 16,
  body: 14,
  caption: 12,
};

// Default export for consumers that import the module as a default
export default {
  COLORS,
  RADIUS,
  SPACING,
  FONT,
};