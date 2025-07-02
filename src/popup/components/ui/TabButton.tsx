import { type ReactNode } from 'react';
import { theme } from '../../theme';
import { RippleButton } from '../magicui/RippleButton';

export interface TabButtonProps {
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export function TabButton({ children, isActive, onClick }: TabButtonProps) {
  return (
    <RippleButton
      onClick={onClick}
      rippleColor={isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.2)"}
      style={{
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.sizes.base,
        fontWeight: theme.typography.weights.medium,
        borderRadius: theme.borderRadius.md,
        background: isActive ? theme.colors.background.tertiary : 'transparent',
        color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
        border: isActive ? `1px solid ${theme.colors.border.focus}` : '1px solid transparent',
        cursor: 'pointer',
        outline: 'none',
        transition: theme.transitions.fast,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = theme.colors.background.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
        } else {
          e.currentTarget.style.background = theme.colors.background.tertiary;
        }
      }}
    >
      {children}
    </RippleButton>
  );
} 