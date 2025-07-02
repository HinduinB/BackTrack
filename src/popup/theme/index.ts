export const theme = {
  colors: {
    primary: {
      blue: '#007ACC',
      green: '#00D67F',
    },
    status: {
      success: '#00D67F',
      info: '#2F82FF',
      warning: '#FFB020',
      error: '#FF4C4C',
    },
    background: {
      primary: '#1E1F24',
      secondary: '#2A2C32',
      tertiary: '#2C2D34',
      hover: '#3A3D44',
    },
    border: {
      primary: '#2A2C32',
      secondary: '#3A3D44',
      tertiary: '#2F3138',
      focus: '#007ACC',
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
  },
  
  transitions: {
    fast: '0.2s ease',
    slow: '0.3s ease',
  },
} as const;

export type Theme = typeof theme; 