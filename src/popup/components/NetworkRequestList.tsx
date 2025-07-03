import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { StatusBadge } from './ui/StatusBadge';

interface NetworkRequestListProps {
  requests: NetworkRequest[];
  selectedRequest: NetworkRequest | null;
  onSelectRequest: (request: NetworkRequest | null) => void;
  onMarkAsViewed: (requestId: string) => void;
}

export function NetworkRequestList({ requests, selectedRequest, onSelectRequest, onMarkAsViewed }: NetworkRequestListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {requests.map((request) => {
        const isSelected = selectedRequest?.id === request.id;
        const isError = request.status >= 400;
        const isViewed = request.viewed === true;
        
        return (
          <div
            key={request.id}
            className={!isSelected ? (isError ? 'request-card-error' : 'request-card-normal') : ''}
            onClick={() => {
              if (!isViewed) {
                onMarkAsViewed(request.id);
              }
              onSelectRequest(isSelected ? null : request);
            }}
            style={{
              position: 'relative',
              padding: '8px',
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
              opacity: isViewed && !isSelected ? 0.7 : 1,
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
                  ? `linear-gradient(90deg, transparent, ${theme.colors.primary.purple}, transparent)`
                  : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                opacity: isSelected ? 1 : 0.5,
              }}
            />

            {/* Card Content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Unread Indicator Dot */}
              {!isViewed && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: request.status >= 400 
                      ? 'rgba(255, 76, 76, 0.9)'
                      : request.status >= 300
                        ? 'rgba(255, 170, 64, 0.9)'
                        : 'rgba(0, 214, 127, 0.9)',
                    flexShrink: 0,
                    boxShadow: request.status >= 400 
                      ? '0 0 4px rgba(255, 76, 76, 0.5)'
                      : request.status >= 300
                        ? '0 0 4px rgba(255, 170, 64, 0.5)'
                        : '0 0 4px rgba(0, 214, 127, 0.5)',
                  }}
                />
              )}

              {/* Status Badge */}
              <div style={{ flexShrink: 0 }}>
                <StatusBadge status={request.status} />
              </div>

              {/* Method */}
              <div
                style={{
                  flexShrink: 0,
                  minWidth: '42px',
                  fontSize: theme.typography.sizes.xs,
                  fontWeight: theme.typography.weights.medium,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  padding: '1px 4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: theme.borderRadius.sm,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {request.method}
              </div>

              {/* Name, Domain, Type and Duration */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.text.primary,
                    marginBottom: '1px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span 
                    style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                    title={request.url}
                  >
                    {request.name}
                  </span>
                  {request.type && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: theme.typography.weights.medium,
                        color: theme.colors.text.muted,
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '3px',
                        padding: '1px 4px',
                        flexShrink: 0,
                        lineHeight: '1',
                      }}
                    >
                      {request.type}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.sizes.xs,
                    color: theme.colors.text.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <span 
                    style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      maxWidth: '120px',
                    }}
                    title={request.domain}
                  >
                    {request.domain}
                  </span>
                  <span style={{ opacity: 0.6, flexShrink: 0 }}>•</span>
                  <span style={{ flexShrink: 0 }}>{request.duration}</span>
                  <span style={{ opacity: 0.6, flexShrink: 0 }}>•</span>
                  <span style={{ flexShrink: 0 }}>{request.timestamp.split(' ')[1]}</span>
                </div>
              </div>

              {/* Status indicator line */}
              <div
                style={{
                  width: '3px',
                  height: '20px',
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