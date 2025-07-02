import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { CodeBlock } from './ui/CodeBlock';
import { getStatusColor } from './ui/StatusBadge';

interface NetworkRequestDetailsProps {
  request: NetworkRequest;
}

export function NetworkRequestDetails({ request }: NetworkRequestDetailsProps) {
  return (
    <div
      style={{
        flex: 1,
        background: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        fontSize: theme.typography.sizes.base,
        overflowY: 'auto',
      }}
    >
      {/* General Info */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          {request.method} {request.name}
        </div>
        <div
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.sizes.sm,
          }}
        >
          {request.timestamp} • {request.duration}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
        <div>
          {/* Request Details */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div
              style={{
                color: theme.colors.text.muted,
                fontWeight: theme.typography.weights.medium,
                marginBottom: theme.spacing.sm,
              }}
            >
              Request Headers
            </div>
            <CodeBlock content={JSON.stringify(request.requestHeaders, null, 2)} />
          </div>

          {/* Request Body if exists */}
          {request.requestBody && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <div
                style={{
                  color: theme.colors.text.muted,
                  fontWeight: theme.typography.weights.medium,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Request Body
              </div>
              <CodeBlock content={request.requestBody} />
            </div>
          )}
        </div>

        <div>
          {/* Response Headers */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div
              style={{
                color: theme.colors.text.muted,
                fontWeight: theme.typography.weights.medium,
                marginBottom: theme.spacing.sm,
              }}
            >
              Response Headers
            </div>
            <CodeBlock content={JSON.stringify(request.responseHeaders, null, 2)} />
          </div>

          {/* Response Body */}
          {request.responseBody && (
            <div>
              <div
                style={{
                  color: theme.colors.text.muted,
                  fontWeight: theme.typography.weights.medium,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Response Body
              </div>
              <CodeBlock 
                content={request.responseBody}
                color={request.status >= 400 ? getStatusColor(request.status) : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 