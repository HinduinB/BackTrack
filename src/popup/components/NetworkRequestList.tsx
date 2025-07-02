import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { StatusBadge } from './ui/StatusBadge';

interface NetworkRequestListProps {
  requests: NetworkRequest[];
  selectedRequest: NetworkRequest | null;
  onSelectRequest: (request: NetworkRequest | null) => void;
}

function getRowClasses(status: number, isSelected: boolean): string {
  const isError = status >= 400;
  const baseClass = isError ? 'error-row' : 'non-error-row';
  return `${baseClass}${isSelected ? ' selected' : ''}`;
}

export function NetworkRequestList({ requests, selectedRequest, onSelectRequest }: NetworkRequestListProps) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: theme.typography.sizes.base,
      }}
    >
      <thead>
        <tr
          style={{
            background: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            textAlign: 'left',
          }}
        >
          <th
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              color: theme.colors.text.muted,
              fontWeight: theme.typography.weights.semibold,
              width: '80px',
            }}
          >
            Status
          </th>
          <th
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              color: theme.colors.text.muted,
              fontWeight: theme.typography.weights.semibold,
              width: '120px',
            }}
          >
            Method
          </th>
          <th
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              color: theme.colors.text.muted,
              fontWeight: theme.typography.weights.semibold,
            }}
          >
            Path
          </th>
          <th
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              color: theme.colors.text.muted,
              fontWeight: theme.typography.weights.semibold,
              width: '100px',
            }}
          >
            Duration
          </th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr
            key={request.id}
            onClick={() => onSelectRequest(selectedRequest?.id === request.id ? null : request)}
            className={getRowClasses(request.status, selectedRequest?.id === request.id)}
            style={{
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              color: theme.colors.text.primary,
              cursor: 'pointer',
              transition: theme.transitions.fast,
            }}
          >
            <td style={{ padding: `${theme.spacing.sm} ${theme.spacing.md}` }}>
              <StatusBadge status={request.status} />
            </td>
            <td
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                color: theme.colors.text.secondary,
              }}
            >
              {request.method}
            </td>
            <td
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                maxWidth: '400px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              className="request-name"
            >
              {request.name}
            </td>
            <td
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                color: theme.colors.text.secondary,
              }}
            >
              {request.duration}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 