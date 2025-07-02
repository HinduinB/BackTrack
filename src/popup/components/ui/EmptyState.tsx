import { type ReactNode } from 'react';
import { theme } from '../../theme';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '160px',
        color: theme.colors.text.disabled,
        fontSize: theme.typography.sizes.md,
        padding: theme.spacing.xl,
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{ marginBottom: theme.spacing.md, opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <div>{title}</div>
      {description && (
        <div
          style={{
            fontSize: theme.typography.sizes.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
} 