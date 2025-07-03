import { type ReactNode, useRef, useEffect } from 'react';
import { theme } from '../../theme';

export interface DropdownItem {
  key: string;
  label: string;
  onClick: () => void;
  color?: string; // Optional color for status code items
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
          className="custom-scrollbar"
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: theme.spacing.xs,
            background: `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, rgba(42, 44, 50, 0.95) 100%)`,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border.secondary}`,
            boxShadow: '0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            padding: theme.spacing.xs,
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                marginBottom: index < items.length - 1 ? '2px' : '0',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                background: 'transparent',
                color: item.color || theme.colors.text.primary,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.medium,
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateX(2px)';
                e.currentTarget.style.color = item.color || theme.colors.text.primary;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0px)';
                e.currentTarget.style.color = item.color || theme.colors.text.primary;
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.outline = `2px solid ${theme.colors.primary.blue}`;
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.outline = 'none';
              }}
            >
              {item.color && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.color,
                    marginRight: theme.spacing.sm,
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 