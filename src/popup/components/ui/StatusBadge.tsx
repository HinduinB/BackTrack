import { theme } from '../../theme';

export interface StatusBadgeProps {
  status: number;
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return theme.colors.status.success;
  if (status >= 300 && status < 400) return theme.colors.status.info;
  if (status >= 400 && status < 500) return theme.colors.status.warning;
  return theme.colors.status.error;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = getStatusColor(status);
  
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 4px',
        borderRadius: theme.borderRadius.pill,
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.medium,
        background: `${color}33`,
        color,
      }}
    >
      {status}
    </span>
  );
} 