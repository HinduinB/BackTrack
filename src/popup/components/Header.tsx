import { useState, useEffect } from 'react';
import { theme } from '../theme';

interface HeaderProps {
  requestCount?: number;
  errorCount?: number;
  isActive?: boolean;
  onToggleActive?: (active: boolean) => void;
}

// Persistent state management
const STORAGE_KEY = 'backtrack-enabled';

const saveTrackingState = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  // TODO: Also update extension icon via background script
  console.log('BackTrack tracking:', enabled ? 'ENABLED' : 'DISABLED');
};

const loadTrackingState = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : true; // Default to enabled
  } catch {
    return true;
  }
};

export function Header({ requestCount = 0, errorCount = 0, isActive = true, onToggleActive }: HeaderProps) {
  const [internalActive, setInternalActive] = useState(loadTrackingState);

  // Load persistent state on mount
  useEffect(() => {
    const savedState = loadTrackingState();
    setInternalActive(savedState);
    onToggleActive?.(savedState);
  }, [onToggleActive]);

  // Use internal state if no external state provided
  const trackingActive = isActive !== undefined ? isActive : internalActive;

  const handleToggle = () => {
    const newState = !trackingActive;
    setInternalActive(newState);
    saveTrackingState(newState);
    onToggleActive?.(newState);
  };

  return (
    <header
      style={{
        height: '56px',
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        background: `linear-gradient(135deg, ${theme.colors.background.primary} 0%, rgba(30, 32, 38, 0.95) 100%)`,
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Smart status border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: trackingActive 
            ? 'rgba(0, 214, 127, 0.8)'
            : 'rgba(255, 76, 76, 0.8)',
          animation: trackingActive ? 'pulseGreen 2s ease-in-out infinite' : 'none',
        }}
      />

      {/* Left Side - Single Toggle */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Master Toggle Switch */}
        <div
          onClick={handleToggle}
          style={{
            width: '52px',
            height: '28px',
            borderRadius: '14px',
            background: trackingActive 
              ? 'linear-gradient(135deg, rgba(0, 214, 127, 0.9), rgba(0, 214, 127, 0.7))'
              : 'linear-gradient(135deg, rgba(255, 76, 76, 0.9), rgba(255, 76, 76, 0.7))',
            border: `1px solid ${trackingActive ? 'rgba(0, 214, 127, 0.4)' : 'rgba(255, 76, 76, 0.4)'}`,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            boxShadow: trackingActive 
              ? '0 0 16px rgba(0, 214, 127, 0.4)' 
              : '0 0 16px rgba(255, 76, 76, 0.3)',
          }}
        >
          {/* Toggle Slider */}
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
              position: 'absolute',
              top: '2px',
              left: trackingActive ? '26px' : '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            }}
          />
          
          {/* Optional: Icon inside slider */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: trackingActive ? '8px' : '32px',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              fontWeight: theme.typography.weights.semibold,
              color: 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }}
          >
            {trackingActive ? '●' : '○'}
          </div>
        </div>
      </div>

      {/* Center - Live Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: theme.borderRadius.lg,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        {/* Request Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          <div
            style={{
              padding: `2px ${theme.spacing.xs}`,
              background: requestCount > 0 
                ? 'linear-gradient(135deg, rgba(47, 130, 255, 0.2), rgba(47, 130, 255, 0.1))'
                : 'rgba(71, 77, 85, 0.3)',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${requestCount > 0 ? 'rgba(47, 130, 255, 0.3)' : 'rgba(71, 77, 85, 0.4)'}`,
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.semibold,
              color: requestCount > 0 ? '#60A5FA' : theme.colors.text.muted,
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {requestCount}
          </div>
          <span
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.text.secondary,
            }}
          >
            requests
          </span>
        </div>

        {/* Separator */}
        <div
          style={{
            width: '1px',
            height: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Error Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          <div
            style={{
              padding: `2px ${theme.spacing.xs}`,
              background: errorCount > 0 
                ? 'linear-gradient(135deg, rgba(255, 76, 76, 0.2), rgba(255, 76, 76, 0.1))'
                : 'rgba(71, 77, 85, 0.3)',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${errorCount > 0 ? 'rgba(255, 76, 76, 0.3)' : 'rgba(71, 77, 85, 0.4)'}`,
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.semibold,
              color: errorCount > 0 ? '#F87171' : theme.colors.text.muted,
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {errorCount}
          </div>
          <span
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.text.secondary,
            }}
          >
            errors
          </span>
        </div>
      </div>

      {/* Right Side - Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
        }}
      >
        {/* BackTrack Logo */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: theme.borderRadius.md,
            background: trackingActive 
              ? 'linear-gradient(135deg, rgba(0, 214, 127, 0.1), rgba(47, 130, 255, 0.1))'
              : 'linear-gradient(135deg, rgba(255, 76, 76, 0.1), rgba(107, 114, 128, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${trackingActive ? 'rgba(47, 130, 255, 0.3)' : 'rgba(255, 76, 76, 0.3)'}`,
            boxShadow: trackingActive 
              ? '0 4px 12px rgba(47, 130, 255, 0.2)' 
              : '0 4px 12px rgba(255, 76, 76, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`gradient-${trackingActive ? 'active' : 'inactive'}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {trackingActive ? (
                  <>
                    <stop offset="0%" style={{stopColor:'#00D67F', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:'#2F82FF', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#8B5CF6', stopOpacity:1}} />
                  </>
                ) : (
                  <>
                    <stop offset="0%" style={{stopColor:'#6B7280', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:'#EF4444', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#DC2626', stopOpacity:1}} />
                  </>
                )}
              </linearGradient>
            </defs>
            
            {/* Bold "BT" Text */}
            <text x="64" y="58" 
                  fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
                  fontSize="36" 
                  fontWeight="800" 
                  textAnchor="middle" 
                  fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`}
                  letterSpacing="-1px"
                  opacity={trackingActive ? 1 : 0.8}>BT</text>
            
            {/* Arrows underneath when active */}
            {trackingActive ? (
              <>
                <path d="M 42 78 L 52 78 L 52 75 L 58 81 L 52 87 L 52 84 L 42 84 Z" 
                      fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      opacity="0.9"/>
                <path d="M 58 78 L 68 78 L 68 75 L 74 81 L 68 87 L 68 84 L 58 84 Z" 
                      fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      opacity="0.7"/>
                <path d="M 74 78 L 84 78 L 84 75 L 90 81 L 84 87 L 84 84 L 74 84 Z" 
                      fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      opacity="0.5"/>
              </>
            ) : (
              <>
                {/* Pause bars */}
                <rect x="54" y="75" width="4" height="12" 
                      fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      opacity="0.7"/>
                <rect x="60" y="75" width="4" height="12" 
                      fill={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      opacity="0.7"/>
                {/* Broken arrows */}
                <path d="M 66 78 L 72 78 L 72 75" 
                      stroke={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      strokeWidth="2" 
                      fill="none"
                      opacity="0.5"
                      strokeDasharray="2,2"/>
                <path d="M 74 78 L 80 78 L 80 75" 
                      stroke={`url(#gradient-${trackingActive ? 'active' : 'inactive'})`} 
                      strokeWidth="2" 
                      fill="none"
                      opacity="0.3"
                      strokeDasharray="2,2"/>
              </>
            )}
          </svg>
        </div>
        
        {/* Brand Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.text.primary,
              lineHeight: 1,
            }}
          >
            BackTrack
          </span>
          <span
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.text.muted,
              lineHeight: 1,
            }}
          >
            Network Monitor
          </span>
        </div>
      </div>
    </header>
  );
} 