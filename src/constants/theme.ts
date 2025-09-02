/**
 * Professional Trading Interface Design System for BMT Web3 Mobile App
 *
 * Inspired by Bloomberg Terminal, TradingView, and institutional trading platforms.
 * Features sophisticated dark theme, professional color coding, and trading-specific components.
 *
 * DO NOT use hardcoded color values or spacing throughout the app.
 * Import from this theme system instead.
 */

/**
 * Professional Trading Color Palette
 * Based on institutional trading platforms with high contrast and accessibility
 */
export const tradingColors = {
  // Professional Trading Brand Colors (inspired by Bloomberg Terminal)
  primary: '#00D2FF', // Bright cyan - primary action color
  primaryDark: '#0099CC', // Darker cyan for hover states
  primaryLight: '#4DE6FF', // Light cyan for highlights
  
  secondary: '#7B68EE', // Purple accent - secondary actions
  secondaryDark: '#5B48CE', // Darker purple
  secondaryLight: '#9B88FE', // Light purple

  // Trading Status Colors (Professional P&L scheme)
  profit: '#00C851', // Vivid green - profits/long positions
  profitDark: '#00A043', // Darker green
  profitLight: '#4DD679', // Light green for backgrounds
  
  loss: '#FF4444', // Vivid red - losses/short positions
  lossDark: '#CC3636', // Darker red
  lossLight: '#FF7777', // Light red for backgrounds
  
  neutral: '#64B5F6', // Blue - neutral/no change
  neutralDark: '#42A5F5', // Darker blue
  neutralLight: '#90CAF9', // Light blue

  // Professional Status Indicators
  warning: '#FFA726', // Professional amber - warnings
  warningDark: '#FF8F00', // Darker amber
  warningLight: '#FFB74D', // Light amber
  
  info: '#42A5F5', // Professional blue - info
  infoDark: '#1E88E5', // Darker blue
  infoLight: '#64B5F6', // Light blue
  
  success: '#66BB6A', // Professional green - success
  successDark: '#4CAF50', // Darker green
  successLight: '#81C784', // Light green

  // Trading Risk Levels (Heat map colors)
  risk: {
    minimal: '#4CAF50', // Green - minimal risk
    low: '#8BC34A', // Light green - low risk
    moderate: '#FFEB3B', // Yellow - moderate risk
    high: '#FF9800', // Orange - high risk
    extreme: '#F44336', // Red - extreme risk
    critical: '#D32F2F', // Dark red - critical risk
  },

  // Professional P&L Color Scheme
  pnl: {
    positive: '#00C851', // Strong green for profits
    negative: '#FF4444', // Strong red for losses
    neutral: '#64B5F6', // Blue for zero/break-even
    positiveBg: 'rgba(0, 200, 81, 0.1)', // Green background
    negativeBg: 'rgba(255, 68, 68, 0.1)', // Red background
    neutralBg: 'rgba(100, 181, 246, 0.1)', // Blue background
  },

  // Professional Dark Theme Palette
  dark: {
    // Background colors (inspired by trading terminals)
    background: {
      primary: '#0A0E1A', // Deep navy - main background
      secondary: '#1A1D23', // Dark charcoal - card backgrounds
      tertiary: '#242731', // Lighter charcoal - elevated surfaces
      quaternary: '#2A2D3A', // Panel backgrounds
      modal: 'rgba(10, 14, 26, 0.95)', // Modal overlay
      header: '#0F1419', // Header/navigation background
      sidebar: '#161922', // Sidebar background
    },
    
    // Text colors for dark theme
    text: {
      primary: '#FFFFFF', // Pure white - primary text
      secondary: '#E5E7EB', // Light gray - secondary text
      tertiary: '#9CA3AF', // Medium gray - tertiary text
      muted: '#6B7280', // Muted gray - disabled text
      inverse: '#0A0E1A', // Dark text on light backgrounds
      accent: '#00D2FF', // Cyan accent text
    },
    
    // Border colors for dark theme
    border: {
      primary: '#374151', // Dark gray borders
      secondary: '#4B5563', // Lighter gray borders
      accent: '#00D2FF', // Cyan accent borders
      subtle: '#1F2937', // Very subtle borders
      focus: '#00D2FF', // Focus state borders
    },
    
    // Surface colors (cards, panels, etc.)
    surface: {
      elevated: '#242731', // Elevated surfaces
      interactive: '#2A2D3A', // Interactive surfaces
      hover: '#374151', // Hover states
      pressed: '#4B5563', // Pressed states
      disabled: '#1F2937', // Disabled surfaces
    },
  },

  // Light theme colors (for day trading)
  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      quaternary: '#E2E8F0',
      modal: 'rgba(15, 23, 42, 0.8)',
    },
    text: {
      primary: '#0F172A',
      secondary: '#334155',
      tertiary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
      accent: '#0EA5E9',
    },
    border: {
      primary: '#E2E8F0',
      secondary: '#CBD5E1',
      accent: '#0EA5E9',
      subtle: '#F1F5F9',
      focus: '#0EA5E9',
    },
    surface: {
      elevated: '#FFFFFF',
      interactive: '#F8FAFC',
      hover: '#F1F5F9',
      pressed: '#E2E8F0',
      disabled: '#F8FAFC',
    },
  },

  // Chart and Graph Colors
  chart: {
    // Candlestick colors
    bullish: '#00C851', // Green candles
    bearish: '#FF4444', // Red candles
    volume: '#64B5F6', // Volume bars
    
    // Technical indicator colors
    sma: '#FFA726', // Simple Moving Average
    ema: '#42A5F5', // Exponential Moving Average
    rsi: '#9C27B0', // RSI line
    macd: '#FF5722', // MACD line
    bollinger: '#795548', // Bollinger Bands
    
    // Grid and axis colors
    grid: '#374151',
    axis: '#6B7280',
    crosshair: '#9CA3AF',
  },
} as const;

// Legacy colors for backward compatibility
export const colors = tradingColors;

/**
 * Professional Trading Spacing System
 * Based on 8px grid system for consistent spacing
 */
export const spacing = {
  xxs: 2,  // Micro spacing
  xs: 4,   // Extra small spacing
  sm: 8,   // Small spacing
  md: 16,  // Medium spacing (base)
  lg: 24,  // Large spacing
  xl: 32,  // Extra large spacing
  xxl: 48, // Extra extra large spacing
  xxxl: 64, // Maximum spacing
  
  // Professional trading specific spacing
  trading: {
    cardPadding: 16,      // Standard card padding
    sectionGap: 24,       // Gap between sections
    componentGap: 12,     // Gap between components
    buttonPadding: 12,    // Button internal padding
    inputPadding: 14,     // Input field padding
    headerPadding: 20,    // Header padding
    modalPadding: 24,     // Modal padding
    tabBarPadding: 16,    // Tab bar padding
  },
} as const;

/**
 * Professional Trading Border Radius System
 * Subtle rounded corners for modern professional look
 */
export const borderRadius = {
  none: 0,
  xs: 2,   // Very subtle rounding
  sm: 4,   // Small rounding for buttons
  md: 6,   // Medium rounding for inputs
  lg: 8,   // Large rounding for cards
  xl: 12,  // Extra large rounding for modals
  xxl: 16, // Maximum rounding for special elements
  full: 999, // Perfect circles
  
  // Trading component specific radii
  trading: {
    card: 8,        // Trading cards
    button: 6,      // Trading buttons
    input: 6,       // Input fields
    chip: 12,       // Status chips/badges
    modal: 12,      // Modal dialogs
    tab: 8,         // Tab buttons
    chart: 4,       // Chart containers
  },
} as const;

/**
 * Professional Trading Typography System
 * Combines readability with professional appearance
 */
export const typography = {
  // Font size scale
  fontSize: {
    xxs: 10,  // Micro text (timestamps, labels)
    xs: 12,   // Small text (captions, badges)
    sm: 14,   // Small text (secondary info)
    base: 16, // Base text size
    lg: 18,   // Large text (section titles)
    xl: 20,   // Extra large (card titles)
    xxl: 24,  // Headers
    xxxl: 32, // Large headers
    display: 48, // Display text
  },
  
  // Font weights
  fontWeight: {
    light: '300',      // Light text
    normal: '400',     // Normal text
    medium: '500',     // Medium text
    semibold: '600',   // Semi-bold text
    bold: '700',       // Bold text
    extrabold: '800',  // Extra bold text
    black: '900',      // Black text
  },
  
  // Line heights
  lineHeight: {
    dense: 1.2,    // Dense spacing (numbers, data)
    tight: 1.25,   // Tight spacing (titles)
    normal: 1.5,   // Normal spacing (body text)
    relaxed: 1.75, // Relaxed spacing (descriptions)
    loose: 2.0,    // Loose spacing (special cases)
  },
  
  // Font families for different use cases
  fontFamily: {
    // Primary font for UI text (system fonts)
    ui: 'System', // React Native will use platform default
    
    // Monospace fonts for numbers and data (critical for trading)
    mono: 'Menlo', // iOS: Menlo, Android: monospace
    
    // Display font for headers
    display: 'System',
  },
  
  // Trading-specific typography
  trading: {
    // Price display typography (large, prominent numbers)
    price: {
      fontSize: 24,
      fontWeight: '700',
      fontFamily: 'Menlo', // Monospace for consistent digit width
      lineHeight: 1.2,
    },
    
    // Balance/PnL typography
    balance: {
      fontSize: 18,
      fontWeight: '600',
      fontFamily: 'Menlo',
      lineHeight: 1.25,
    },
    
    // Data table typography
    data: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Menlo',
      lineHeight: 1.3,
    },
    
    // Status/badge typography
    status: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'System',
      lineHeight: 1.2,
    },
    
    // Chart label typography
    chart: {
      fontSize: 11,
      fontWeight: '500',
      fontFamily: 'Menlo',
      lineHeight: 1.0,
    },
  },
} as const;

/**
 * Professional Trading Shadow System
 * Subtle elevation for depth and focus
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Trading-specific shadows
  trading: {
    // Card shadow for trading cards
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    
    // Modal shadow
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    
    // Button pressed shadow
    pressed: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  },
} as const;

export const opacity = {
  disabled: 0.5,
  overlay: 0.3,
  backdrop: 0.8,
  subtle: 0.6,
  medium: 0.7,
  strong: 0.9,
} as const;

/**
 * Professional Trading Component Themes
 * Pre-configured component styling for consistent appearance
 */
export const components = {
  // Professional trading cards
  tradingCard: {
    padding: spacing.trading.cardPadding,
    borderRadius: borderRadius.trading.card,
    backgroundColor: tradingColors.dark.background.secondary,
    borderColor: tradingColors.dark.border.primary,
    borderWidth: 1,
    ...shadows.trading.card,
  },
  
  // Professional buttons
  button: {
    primary: {
      backgroundColor: tradingColors.primary,
      borderRadius: borderRadius.trading.button,
      paddingVertical: spacing.trading.buttonPadding,
      paddingHorizontal: spacing.lg,
      minHeight: 44, // Touch target
    },
    secondary: {
      backgroundColor: tradingColors.secondary,
      borderRadius: borderRadius.trading.button,
      paddingVertical: spacing.trading.buttonPadding,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
    danger: {
      backgroundColor: tradingColors.loss,
      borderRadius: borderRadius.trading.button,
      paddingVertical: spacing.trading.buttonPadding,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
    success: {
      backgroundColor: tradingColors.profit,
      borderRadius: borderRadius.trading.button,
      paddingVertical: spacing.trading.buttonPadding,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
  },
  
  // Professional inputs
  input: {
    backgroundColor: tradingColors.dark.surface.elevated,
    borderColor: tradingColors.dark.border.primary,
    borderWidth: 1,
    borderRadius: borderRadius.trading.input,
    paddingHorizontal: spacing.trading.inputPadding,
    paddingVertical: spacing.trading.inputPadding,
    fontSize: typography.fontSize.base,
    color: tradingColors.dark.text.primary,
    minHeight: 48, // Touch target
  },
  
  // Status chips/badges
  chip: {
    profit: {
      backgroundColor: tradingColors.pnl.positiveBg,
      borderColor: tradingColors.profit,
      borderWidth: 1,
      borderRadius: borderRadius.trading.chip,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    loss: {
      backgroundColor: tradingColors.pnl.negativeBg,
      borderColor: tradingColors.loss,
      borderWidth: 1,
      borderRadius: borderRadius.trading.chip,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    neutral: {
      backgroundColor: tradingColors.pnl.neutralBg,
      borderColor: tradingColors.neutral,
      borderWidth: 1,
      borderRadius: borderRadius.trading.chip,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
  },
  
  // Modal styling
  modal: {
    backgroundColor: tradingColors.dark.background.tertiary,
    borderRadius: borderRadius.trading.modal,
    padding: spacing.trading.modalPadding,
    ...shadows.trading.modal,
  },
  
  // Tab bar styling
  tabBar: {
    backgroundColor: tradingColors.dark.background.header,
    borderTopColor: tradingColors.dark.border.primary,
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.trading.tabBarPadding,
  },
} as const;

/**
 * Dark theme configuration (default for professional trading)
 */
export const darkTheme = {
  colors: tradingColors.dark,
  spacing,
  typography,
  borderRadius,
  shadows,
  components,
} as const;

/**
 * Light theme configuration (alternative for day trading)
 */
export const lightTheme = {
  colors: tradingColors.light,
  spacing,
  typography,
  borderRadius,
  shadows,
  components,
} as const;

/**
 * Helper function to get theme based on mode
 * Defaults to dark theme for professional trading
 */
export const getTheme = (mode: 'light' | 'dark' = 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Professional animation configurations
 */
export const animations = {
  // Duration constants
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easing curves
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
  
  // Trading-specific animations
  trading: {
    priceChange: {
      duration: 200,
      easing: 'ease-out',
    },
    chartUpdate: {
      duration: 100,
      easing: 'ease-in-out',
    },
  },
} as const;

/**
 * Type definitions for TypeScript support
 */
export type TradingColors = typeof tradingColors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type ComponentTheme = typeof components;
export type ThemeMode = 'light' | 'dark';
export type Theme = typeof darkTheme;