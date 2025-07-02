import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { StatusBadge } from './ui/StatusBadge';

interface NetworkRequestListProps {
  requests: NetworkRequest[];
  selectedRequest: NetworkRequest | null;
  onSelectRequest: (request: NetworkRequest | null) => void;
}

export function NetworkRequestList({ requests, selectedRequest, onSelectRequest }: NetworkRequestListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm,
      }}
    >
      {requests.map((request) => {
        const isSelected = selectedRequest?.id === request.id;
        const isError = request.status >= 400;
        
        return (
          <div
            key={request.id}
            onClick={() => onSelectRequest(isSelected ? null : request)}
            style={{
              position: 'relative',
              padding: theme.spacing.md,
              background: isSelected 
                ? `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.tertiary} 100%)`
                : `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, rgba(42, 44, 50, 0.6) 100%)`,
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${
                isSelected 
                  ? theme.colors.border.focus
                  : isError 
                    ? 'rgba(255, 76, 76, 0.3)'
                    : theme.colors.border.secondary
              }`,
              cursor: 'pointer',
              transition: 'all 0.2s ease-out',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: isSelected 
                ? `0 8px 32px rgba(47, 130, 255, 0.2), 0 0 0 1px ${theme.colors.border.focus}`
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = theme.colors.border.tertiary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = isError ? 'rgba(255, 76, 76, 0.3)' : theme.colors.border.secondary;
              }
            }}
          >
            {/* Subtle animated gradient overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: isSelected 
                  ? `linear-gradient(90deg, transparent, ${theme.colors.primary.blue}, transparent)`
                  : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                opacity: isSelected ? 1 : 0.5,
              }}
            />

            {/* Card Content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
              }}
            >
              {/* Status Badge */}
              <div style={{ flexShrink: 0 }}>
                <StatusBadge status={request.status} />
              </div>

              {/* Method */}
              <div
                style={{
                  flexShrink: 0,
                  minWidth: '60px',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: theme.typography.weights.medium,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: theme.borderRadius.sm,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {request.method}
              </div>

              {/* Path and Duration */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: theme.typography.sizes.base,
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.xs,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {request.name}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    color: theme.colors.text.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                  }}
                >
                  <span>{request.duration}</span>
                  <span style={{ opacity: 0.6 }}>•</span>
                  <span>{request.timestamp.split(' ')[1]}</span>
                </div>
              </div>

              {/* Status indicator line */}
              <div
                style={{
                  width: '3px',
                  height: '40px',
                  borderRadius: '2px',
                  background: request.status >= 400 
                    ? 'linear-gradient(180deg, rgba(255, 76, 76, 0.8), rgba(255, 76, 76, 0.4))'
                    : request.status >= 300
                      ? 'linear-gradient(180deg, rgba(255, 170, 64, 0.8), rgba(255, 170, 64, 0.4))'
                      : 'linear-gradient(180deg, rgba(0, 214, 127, 0.8), rgba(0, 214, 127, 0.4))',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Ripple effect on click */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `radial-gradient(circle, rgba(47, 130, 255, 0.1) 0%, transparent 70%)`,
                  borderRadius: theme.borderRadius.lg,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
} 