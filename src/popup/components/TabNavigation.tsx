import { type TabType } from '../types';
import { theme } from '../theme';
import { RippleButton as Button } from './magicui/RippleButton';
import { AddIcon, DownloadIcon } from './ui/Icons';
import { Tooltip, TooltipTrigger, TooltipContent } from './shadcn/tooltip';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddMockData?: () => void;
  hasNetworkData?: boolean;
  onExportHAR?: () => void;
  isExporting?: boolean;
}

export function TabNavigation({ activeTab, onTabChange, onAddMockData, hasNetworkData, onExportHAR, isExporting }: TabNavigationProps) {
  const tabs: TabType[] = ['Console', 'Network', 'Settings'];

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

          {/* Export HAR Button - Only show when there's data */}
          {hasNetworkData && onExportHAR && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<DownloadIcon size={12} />}
                  onClick={onExportHAR}
                  disabled={isExporting || !hasNetworkData}
                  style={{
                    opacity: hasNetworkData ? 1 : 0.6,
                  }}
                >
                  {isExporting ? 'Exporting...' : 'Export HAR'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Export network requests to HAR file
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
} 