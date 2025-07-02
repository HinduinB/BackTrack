import { type ReactNode, useRef, useEffect } from 'react';
import { theme } from '../../theme';

export interface DropdownItem {
  key: string;
  label: string;
  onClick: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Dropdown({ trigger, items, isOpen, onToggle, onClose }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div onClick={onToggle}>
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: theme.spacing.xs,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.md,
            overflow: 'hidden',
            zIndex: 10,
            minWidth: '140px',
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              onClick={item.onClick}
              style={{
                display: 'block',
                width: '100%',
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                border: 'none',
                borderBottom: index < items.length - 1 ? `1px solid ${theme.colors.border.tertiary}` : 'none',
                background: 'transparent',
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes.base,
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme.colors.background.hover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 