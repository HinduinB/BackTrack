import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { getStatusColor } from './ui/StatusBadge';

interface NetworkRequestTableProps {
  requests: NetworkRequest[];
  selectedRequest: NetworkRequest | null;
  onSelectRequest: (request: NetworkRequest | null) => void;
  onMarkAsViewed: (requestId: string) => void;
}

export function NetworkRequestTable({ requests, selectedRequest, onSelectRequest, onMarkAsViewed }: NetworkRequestTableProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          background: theme.colors.background.tertiary,
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.text.muted,
          fontWeight: theme.typography.weights.medium,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <div style={{ width: '50px', flexShrink: 0 }}>Status</div>
        <div style={{ width: '60px', flexShrink: 0 }}>Method</div>
        <div style={{ flex: 1, minWidth: 0 }}>Name</div>
        <div style={{ width: '50px', flexShrink: 0 }}>Type</div>
        <div style={{ width: '100px', flexShrink: 0 }}>Domain</div>
        <div style={{ width: '60px', flexShrink: 0, textAlign: 'right' }}>Size</div>
        <div style={{ width: '60px', flexShrink: 0, textAlign: 'right' }}>Time</div>
      </div>

      {/* Table Rows */}
      {requests.map((request) => {
        const isSelected = selectedRequest?.id === request.id;
        const isViewed = request.viewed === true;
        const isError = request.status >= 400;
        const statusColor = getStatusColor(request.status);
        
        return (
          <div
            key={request.id}
            onClick={() => {
              if (!isViewed) {
                onMarkAsViewed(request.id);
              }
              onSelectRequest(isSelected ? null : request);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              minHeight: '24px',
              background: isSelected 
                ? theme.colors.background.hover
                : 'transparent',
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              fontSize: theme.typography.sizes.xs,
              opacity: isViewed && !isSelected ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {/* Status */}
            <div 
              style={{ 
                width: '50px', 
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >

              <span
                style={{
                  color: statusColor,
                  fontWeight: theme.typography.weights.medium,
                }}
              >
                {request.status}
              </span>
            </div>

            {/* Method */}
            <div 
              style={{ 
                width: '60px', 
                flexShrink: 0,
                color: isError ? 'rgba(255, 76, 76, 0.9)' : theme.colors.text.secondary,
                fontWeight: theme.typography.weights.medium,
              }}
            >
              {request.method}
            </div>

            {/* Name */}
            <div 
              style={{ 
                flex: 1, 
                minWidth: 0,
                color: isError ? 'rgba(255, 76, 76, 0.9)' : theme.colors.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={request.url}
            >
              {request.name}
            </div>

            {/* Type */}
            <div 
              style={{ 
                width: '50px', 
                flexShrink: 0,
                color: theme.colors.text.muted,
                fontSize: '10px',
                fontWeight: theme.typography.weights.medium,
              }}
            >
              {request.type}
            </div>

            {/* Domain */}
            <div 
              style={{ 
                width: '100px', 
                flexShrink: 0,
                color: isError ? 'rgba(255, 76, 76, 0.7)' : theme.colors.text.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={request.domain}
            >
              {request.domain}
            </div>

            {/* Size */}
            <div 
              style={{ 
                width: '60px', 
                flexShrink: 0,
                textAlign: 'right',
                color: theme.colors.text.muted,
              }}
            >
              {request.size || '-'}
            </div>

            {/* Time */}
            <div 
              style={{ 
                width: '60px', 
                flexShrink: 0,
                textAlign: 'right',
                color: theme.colors.text.muted,
              }}
            >
              {request.duration}
            </div>
          </div>
        );
      })}
    </div>
  );
} 