import { theme } from '../../theme';
import { RippleButton as Button } from '../magicui/RippleButton';
import { CloseIcon, WarningIcon, DownloadIcon } from './Icons';

interface ExportDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onNeverShowAgain: () => void;
  requestCount: number;
}

export function ExportDisclaimerModal({ 
  isOpen, 
  onClose, 
  onExport, 
  onNeverShowAgain, 
  requestCount 
}: ExportDisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: theme.spacing.lg,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.cardElevated} 0%, ${theme.colors.background.card} 100%)`,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          maxWidth: '480px',
          width: '100%',
          boxShadow: `${theme.shadows.floating}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            right: theme.spacing.md,
            background: 'transparent',
            border: 'none',
            color: theme.colors.text.muted,
            cursor: 'pointer',
            padding: theme.spacing.xs,
            borderRadius: theme.borderRadius.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = theme.colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = theme.colors.text.muted;
          }}
        >
          <CloseIcon size={16} />
        </button>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: theme.spacing.md, 
          marginBottom: theme.spacing.lg 
        }}>
          <div
            style={{
              background: 'rgba(255, 193, 7, 0.15)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon size={24} color="rgb(255, 193, 7)" />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.text.primary,
                lineHeight: '1.4',
              }}
            >
              Export HAR File
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.text.muted,
                lineHeight: '1.4',
              }}
            >
              {requestCount} network requests ready to export
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <p
            style={{
              margin: `0 0 ${theme.spacing.md} 0`,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.text.secondary,
              lineHeight: '1.6',
            }}
          >
            <strong>Important limitations:</strong> Due to browser security restrictions, 
            the exported HAR file may not include all data that DevTools can access:
          </p>
          
          <ul
            style={{
              margin: `0 0 ${theme.spacing.lg} 0`,
              paddingLeft: theme.spacing.lg,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.text.secondary,
              lineHeight: '1.6',
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Some security-sensitive headers may be filtered</li>
            <li style={{ marginBottom: theme.spacing.xs }}>Detailed timing information may be limited</li>
            <li style={{ marginBottom: theme.spacing.xs }}>Cookie data may be restricted</li>
            <li>Request/response bodies for some content types may be missing</li>
          </ul>

          <p
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.text.muted,
              lineHeight: '1.5',
              padding: theme.spacing.md,
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: theme.borderRadius.md,
            }}
          >
            💡 <strong>Tip:</strong> For complete data, use your browser's DevTools Network tab instead.
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onNeverShowAgain}
            style={{
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.text.muted,
            }}
          >
            Don't show again
          </Button>
          
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              leftIcon={<DownloadIcon size={14} />}
              onClick={onExport}
              style={{
                background: 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(21, 128, 61) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              Export HAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 