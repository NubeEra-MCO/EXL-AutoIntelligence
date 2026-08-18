// ============================================================
// THEME TOKENS - Insurance Industry Design System
// ============================================================
import {
  BrandVariants,
  createLightTheme,
  createDarkTheme,
  Theme,
} from '@fluentui/react-components';

// Insurance brand colors - deep blue palette
const psrdBrand: BrandVariants = {
  10: '#020408',
  20: '#071020',
  30: '#0B1F3D',
  40: '#0E2E5A',
  50: '#103E78',
  60: '#104D96',
  70: '#0F5DB5',
  80: '#0E6DD4',
  90: '#1A7EEE',
  100: '#3590F3',
  110: '#54A2F6',
  120: '#73B4F8',
  130: '#93C6FA',
  140: '#B3D8FC',
  150: '#D3EAFE',
  160: '#EBF5FF',
};

export const lightTheme: Theme = {
  ...createLightTheme(psrdBrand),
  colorBrandBackground: '#0E4DA4',
  colorBrandBackgroundHover: '#0B3D84',
  colorBrandBackgroundPressed: '#092E64',
  colorBrandForeground1: '#0E4DA4',
  colorBrandForeground2: '#0B3D84',
};

export const darkTheme: Theme = {
  ...createDarkTheme(psrdBrand),
  colorBrandBackground: '#1A7EEE',
  colorBrandBackgroundHover: '#3590F3',
  colorBrandBackgroundPressed: '#54A2F6',
  colorBrandForeground1: '#1A7EEE',
  colorBrandForeground2: '#3590F3',
};

// Design tokens for application-specific styling
export const designTokens = {
  // Spacing
  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
    pill: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
    card: '0 2px 8px rgba(0, 77, 164, 0.08)',
    cardHover: '0 8px 24px rgba(0, 77, 164, 0.15)',
  },

  // Status colors
  status: {
    active: { bg: '#E6F4EA', text: '#137333', border: '#34A853' },
    lapsed: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    submitted: { bg: '#EFF6FF', text: '#1D4ED8', border: '#3B82F6' },
    validationPending: { bg: '#FFF8E7', text: '#B45309', border: '#D97706' },
    approved: { bg: '#E6F4EA', text: '#137333', border: '#34A853' },
    rejected: { bg: '#FEECEC', text: '#B91C1C', border: '#EF4444' },
    inProgress: { bg: '#EFF6FF', text: '#1D4ED8', border: '#3B82F6' },
    completed: { bg: '#E6F4EA', text: '#137333', border: '#34A853' },
    cancelled: { bg: '#F3F4F6', text: '#6B7280', border: '#9CA3AF' },
    escalated: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
    slaBreached: { bg: '#FEECEC', text: '#B91C1C', border: '#EF4444' },
    pendingApproval: { bg: '#FDF4FF', text: '#7E22CE', border: '#A855F7' },
  },

  // Priority colors
  priority: {
    low: { bg: '#F0FDF4', text: '#166534', icon: '#22C55E' },
    medium: { bg: '#FFFBEB', text: '#92400E', icon: '#F59E0B' },
    high: { bg: '#FFF7ED', text: '#C2410C', icon: '#EF4444' },
    critical: { bg: '#FFF1F2', text: '#9F1239', icon: '#E11D48' },
  },

  // Typography
  typography: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    displayLarge: { fontSize: '40px', lineHeight: '52px', fontWeight: 700 },
    displayMedium: { fontSize: '32px', lineHeight: '44px', fontWeight: 700 },
    displaySmall: { fontSize: '28px', lineHeight: '36px', fontWeight: 600 },
    headingLarge: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
    headingMedium: { fontSize: '20px', lineHeight: '28px', fontWeight: 600 },
    headingSmall: { fontSize: '16px', lineHeight: '24px', fontWeight: 600 },
    bodyLarge: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
    bodyMedium: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
    bodySmall: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
    caption: { fontSize: '11px', lineHeight: '16px', fontWeight: 400 },
    label: { fontSize: '12px', lineHeight: '16px', fontWeight: 600 },
    code: { fontFamily: "'Cascadia Code', 'Consolas', monospace" },
  },

  // Layout
  layout: {
    sidebarWidth: '256px',
    sidebarCollapsedWidth: '64px',
    headerHeight: '56px',
    maxContentWidth: '1440px',
    contentPadding: '24px',
    cardGap: '16px',
    sectionGap: '32px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    medium: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
    toast: 500,
  },
};

export type DesignTokens = typeof designTokens;
