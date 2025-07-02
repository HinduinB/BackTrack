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
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: theme.spacing.xs,
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            boxShadow: theme.shadows.md,
            zIndex: 1000,
            minWidth: '140px',
            maxHeight: '200px',
            overflowY: 'auto',
            // Hide scrollbar but keep functionality
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
          className="dropdown-scroll"
        >
          <style>{`
            .dropdown-scroll::-webkit-scrollbar {
              display: none; /* Chrome, Safari */
            }
          `}</style>
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
                color: item.color || theme.colors.text.secondary,
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.medium,
                textAlign: 'left',
                cursor: 'pointer',
                outline: 'none',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.colors.background.hover;
                e.currentTarget.style.color = item.color || theme.colors.text.secondary;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = item.color || theme.colors.text.secondary;
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 