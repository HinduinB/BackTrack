import { theme } from '../theme';


export function Header() {
  return (
    <header
      style={{
        height: '48px',
        padding: theme.spacing.md + ' ' + theme.spacing.lg,
        background: theme.colors.background.primary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        alignItems: 'center',
      }}

      
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          fontSize: theme.typography.sizes.base,
          fontWeight: theme.typography.weights.medium,
          color: theme.colors.text.primary,
        }}

      
      >
        <div
          style={{
            width: theme.spacing.sm,
            height: theme.spacing.sm,
            borderRadius: theme.borderRadius.full,
            background: theme.colors.primary.green,
          }}
        />
        BackTrack Enabled
      </div>
     
    </header>
  );
} 