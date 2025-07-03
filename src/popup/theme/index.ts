export const theme = {
  colors: {
    primary: {
      blue: '#007ACC',
      purple: '#8B5CF6',
      green: '#00D67F',
    },
    status: {
      success: '#00D67F',
      info: '#8B5CF6',
      warning: '#FFB020',
      error: '#FF4C4C',
    },
    background: {
      primary: '#1A1B20',
      secondary: '#2A2C32',
      tertiary: '#2C2D34',
      hover: '#3A3D44',
      card: '#2F3138',
      cardElevated: '#353842',
    },
    border: {
      primary: '#2A2C32',
      secondary: '#3A3D44',
      tertiary: '#2F3138',
      focus: '#8B5CF6',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C5C5D2',
      muted: '#A0A0B0',
      disabled: '#8B8D98',
    },
  },
  
  typography: {
    fontFamily: 'Inter, Segoe UI, Helvetica Neue, sans-serif',
    monoFamily: 'monospace',
    sizes: {
      xs: '10px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '50%',
    pill: '12px',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 12px rgba(0,0,0,0.25)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.25)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35)',
    floating: '0 16px 64px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  
  transitions: {
    fast: '0.2s ease',
    slow: '0.3s ease',
  },
} as const;

export type Theme = typeof theme; 