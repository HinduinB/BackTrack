import { useState, useEffect } from 'react';
import { theme } from '../theme';
import HeaderLogoGreenSvg from '../../assets/HeaderLogo-green.svg';
import HeaderLogoRedSvg from '../../assets/HeaderLogo-red.svg';

interface HeaderProps {
  requestCount?: number;
  errorCount?: number;
  onToggleActive?: (active: boolean) => void;
  isDetached?: boolean;
  selectedRequestId?: string | null;
}

// Persistent state management through Chrome storage only





export function Header({ requestCount = 0, errorCount = 0, onToggleActive, isDetached = false, selectedRequestId = null }: HeaderProps) {
  // Start with null to indicate unloaded state
  const [internalActive, setInternalActive] = useState<boolean | null>(null);
  const [isDetachedWindow, setIsDetachedWindow] = useState(false);

  // Load state immediately and synchronously when possible
  useEffect(() => {
    let mounted = true;
    
    const loadState = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          // Access Chrome storage directly
          const result = await chrome.storage.local.get('backtrack-enabled');
          const state = result['backtrack-enabled'] !== undefined ? JSON.parse(result['backtrack-enabled']) : true;
          
          if (mounted) {
            setInternalActive(state);
          }
        } else {
          // Fallback for development environment
          if (mounted) {
            setInternalActive(true);
          }
        }
              } catch (error) {
          if (mounted) {
            setInternalActive(true); // Default to enabled on error
          }
        }
    };

    // Check if we're in a detached window
    const checkWindowType = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.windows) {
          const currentWindow = await chrome.windows.getCurrent();
          if (mounted) {
            setIsDetachedWindow(currentWindow.type === 'popup');
          }
        }
      } catch (err) {
        // Not in extension context or no permission
        if (mounted) {
          setIsDetachedWindow(false);
        }
      }
    };
    
    loadState();
    checkWindowType();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Use loaded state, fallback to false (disabled) while loading to prevent green flash
  const trackingActive = internalActive !== null ? internalActive : false;

  const handleToggle = async () => {
    const newState = !trackingActive;
    setInternalActive(newState);
    
    // Save state to Chrome storage directly
    try {
      await chrome.storage.local.set({ 'backtrack-enabled': JSON.stringify(newState) });
    } catch (error) {
      console.error('BackTrack: Failed to save tracking state:', error);
    }
    
    onToggleActive?.(newState);
  };

  return (
    <header
      style={{
        height: isDetached ? '80px' : '56px',
        padding: isDetached 
          ? `${theme.spacing.lg} ${theme.spacing.xl}` 
          : `${theme.spacing.md} ${theme.spacing.lg}`,
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

      {/* Right Side - Controls and Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        {/* Detach/Attach Button */}
        {!isDetachedWindow && !isDetached ? (
          // Detach Button - Only show if not already detached
          <button
            onClick={() => {
              // Create detached window with minimal chrome
              const baseUrl = chrome.runtime.getURL('index.html') + '?detached=true'
              const urlWithSelection = selectedRequestId 
                ? baseUrl + '&selectedRequest=' + encodeURIComponent(selectedRequestId)
                : baseUrl
              chrome.windows.create({
                url: urlWithSelection,
                type: 'popup',
                width: 820,
                height: 640,
                focused: true,
                left: Math.round((screen.width - 820) / 2),
                top: Math.round((screen.height - 640) / 2)
              }).then((createdWindow) => {
                // Register the detached window with background script
                if (createdWindow.id) {
                  chrome.runtime.sendMessage({
                    type: 'REGISTER_DETACHED_WINDOW',
                    windowId: createdWindow.id
                  }).catch(err => {
                    console.log('Failed to register detached window:', err);
                  });
                }
                // Close current popup
                window.close();
              }).catch(_err => {
                console.log('Detach feature requires Chrome extension APIs');
              });
            }}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.xs,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = theme.colors.text.primary;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = theme.colors.text.secondary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16z"/>
            </svg>
            Detach
          </button>
        ) : isDetached ? (
          // Attach Button - Only show when in detached mode
          <button
            onClick={async () => {
              try {
                // Send message to restore popup functionality  
                await chrome.runtime.sendMessage({
                  type: 'ATTACH_TO_POPUP'
                });
                
                console.log('BackTrack: Restored popup functionality, closing detached window');
                
                // Close the detached window immediately
                // The background script automatically restores popup functionality
                // User can now click the toolbar icon to open the popup
                window.close();
                
              } catch (error) {
                console.log('BackTrack: Error in attach process:', error);
                window.close();
              }
            }}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.sizes.xs,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.color = theme.colors.text.primary;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = theme.colors.text.secondary;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            Attach
          </button>
        ) : null}

        {/* BackTrack Logo */}
        <img
          src={trackingActive ? HeaderLogoGreenSvg : HeaderLogoRedSvg}
          alt="BackTrack Logo"
          style={{
            width: '50px',
            height: '50px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: trackingActive 
              ? 'drop-shadow(0 0 8px rgba(0, 214, 127, 0.4))'
              : 'drop-shadow(0 0 8px rgba(255, 76, 76, 0.4))',
          }}
        />
      </div>
    </header>
  );
} 