import { useState } from 'react';
import { type TabType, type ExportFormat } from '../types';
import { theme } from '../theme';
import { RippleButton as Button } from './magicui/RippleButton';
import { Dropdown, type DropdownItem } from './ui/Dropdown';
import { ChevronDownIcon, AddIcon } from './ui/Icons';
import { Tooltip, TooltipTrigger, TooltipContent } from './shadcn/tooltip';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasNetworkData: boolean;
  onExport: (format: ExportFormat) => void;
  onAddMockData?: () => void;
}

export function TabNavigation({ activeTab, onTabChange, hasNetworkData, onExport, onAddMockData }: TabNavigationProps) {
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

      {/* Network Tab Actions */}
      {activeTab === 'Network' && (
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
          {/* Add Mock Data Button */}
          {onAddMockData && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<AddIcon />}
                  onClick={onAddMockData}
                >
                  Add Mock Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Add sample requests
              </TooltipContent>
            </Tooltip>
          )}

          {/* Export Button - Only show when there's data */}
          {hasNetworkData && (
            <Dropdown
              trigger={
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    Export as JSON or HAR
                  </TooltipContent>
                </Tooltip>
              }
              items={exportItems}
              isOpen={showExportDropdown}
              onToggle={() => setShowExportDropdown(!showExportDropdown)}
              onClose={() => setShowExportDropdown(false)}
            />
          )}
        </div>
      )}
    </div>
  );
} 