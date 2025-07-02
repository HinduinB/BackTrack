"use client";

import React, { type MouseEvent, useEffect, useState, type CSSProperties, type ButtonHTMLAttributes } from "react";
import { theme } from '../../theme';

export interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rippleColor?: string;
  duration?: string;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      className,
      children,
      variant = 'secondary',
      size = 'md',
      leftIcon,
      rightIcon,
      rippleColor = "rgba(255, 255, 255, 0.3)",
      duration = "600ms",
      onClick,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([]);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      onClick?.(event);
    };

    const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = { x, y, size, key: Date.now() };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    useEffect(() => {
      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1];
        const timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key),
          );
        }, parseInt(duration));
        return () => clearTimeout(timeout);
      }
    }, [buttonRipples, duration]);

    // Base styles using theme system
    const baseStyles: CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      outline: 'none',
      transition: theme.transitions.fast,
      border: '1px solid transparent',
      overflow: 'hidden',
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
      
      // Store original styles before hover
      const originalBackground = target.style.background || style?.background;
      const originalBorderColor = target.style.borderColor || style?.borderColor;
      target.setAttribute('data-original-bg', originalBackground?.toString() || '');
      target.setAttribute('data-original-border', originalBorderColor?.toString() || '');
      
      // Apply hover styles based on variant, but respect custom styles
      if (style?.background) {
        // If custom background is set (like status filters), just reduce opacity
        target.style.opacity = '0.8';
      } else {
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
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      
      // Restore original styles
      const originalBackground = target.getAttribute('data-original-bg');
      const originalBorderColor = target.getAttribute('data-original-border');
      
      if (style?.background) {
        // Restore custom background and remove hover opacity
        target.style.background = originalBackground || style.background.toString();
        target.style.opacity = '1';
        if (originalBorderColor) {
          target.style.borderColor = originalBorderColor;
        }
      } else {
        // Default variant behavior
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
      }
      onMouseLeave?.(e);
    };

    return (
      <button
        className={className}
        style={{
          ...baseStyles,
          ...sizeStyles,
          ...variantStyles,
          ...style,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref}
        {...props}
      >
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          {leftIcon}
          {children}
          {rightIcon}
        </div>
        <span style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
          {buttonRipples.map((ripple) => (
            <span
              key={ripple.key}
              style={{
                position: 'absolute',
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: rippleColor,
                borderRadius: '50%',
                transform: 'scale(0)',
                animation: `ripple ${duration} ease-out`,
                opacity: 0.6,
              }}
            />
          ))}
        </span>
      </button>
    );
  },
);

RippleButton.displayName = "RippleButton"; 