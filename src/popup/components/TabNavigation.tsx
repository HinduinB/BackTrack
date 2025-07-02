import { useState } from 'react';
import { type TabType, type ExportFormat } from '../types';
import { theme } from '../theme';
import { RippleButton as Button } from './magicui/RippleButton';
import { Dropdown, type DropdownItem } from './ui/Dropdown';
import { ChevronDownIcon } from './ui/Icons';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasNetworkData: boolean;
  onExport: (format: ExportFormat) => void;
}

export function TabNavigation({ activeTab, onTabChange, hasNetworkData, onExport }: TabNavigationProps) {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const tabs: TabType[] = ['Console', 'Network', 'Settings'];

  const exportItems: DropdownItem[] = [
    {
      key: 'json',
      label: 'Export as JSON',
      onClick: () => {
        onExport('json');
        setShowExportDropdown(false);
      },
    },
    {
      key: 'har',
      label: 'Export as HAR',
      onClick: () => {
        onExport('har');
        setShowExportDropdown(false);
      },
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md + ' ' + theme.spacing.lg,
        background: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.secondary}`,
      }}
    >
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "primary" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Export Button - Only show for Network tab with data */}
      {activeTab === 'Network' && hasNetworkData && (
        <Dropdown
          trigger={
            <Button
              variant="secondary"
              size="sm"
              rightIcon={
                <span
                  style={{
                    transform: showExportDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: theme.transitions.fast,
                  }}
                >
                  <ChevronDownIcon size={12} />
                </span>
              }
            >
              Export as
            </Button>
          }
          items={exportItems}
          isOpen={showExportDropdown}
          onToggle={() => setShowExportDropdown(!showExportDropdown)}
          onClose={() => setShowExportDropdown(false)}
        />
      )}
    </div>
  );
} 