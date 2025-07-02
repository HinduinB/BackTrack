import { type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from 'react';
import { theme } from '../../theme';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({ 
  variant = 'secondary', 
  size = 'md',
  children, 
  leftIcon, 
  rightIcon, 
  style,
  onMouseEnter,
  onMouseLeave,
  ...props 
}: ButtonProps) {
  const baseStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.medium,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    outline: 'none',
    transition: theme.transitions.fast,
    border: '1px solid transparent',
  };

  const sizeStyles: CSSProperties = size === 'sm' 
    ? {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.sizes.sm,
      }
    : {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.sizes.base,
      };

  const variantStyles: CSSProperties = (() => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary.blue,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.primary.blue}`,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.colors.text.secondary,
          border: 'none',
        };
      case 'secondary':
      default:
        return {
          background: 'transparent',
          color: theme.colors.text.secondary,
          border: `1px solid ${theme.colors.border.secondary}`,
        };
    }
  })();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    switch (variant) {
      case 'primary':
        target.style.background = theme.colors.primary.blue;
        target.style.opacity = '0.9';
        break;
      case 'ghost':
        target.style.background = theme.colors.background.hover;
        break;
      case 'secondary':
      default:
        target.style.background = theme.colors.background.hover;
        target.style.borderColor = theme.colors.border.tertiary;
        break;
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    switch (variant) {
      case 'primary':
        target.style.background = theme.colors.primary.blue;
        target.style.opacity = '1';
        break;
      case 'ghost':
        target.style.background = 'transparent';
        break;
      case 'secondary':
      default:
        target.style.background = 'transparent';
        target.style.borderColor = theme.colors.border.secondary;
        break;
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
} 