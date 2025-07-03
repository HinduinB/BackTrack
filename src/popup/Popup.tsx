import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { type TabType, type ExportFormat } from './types'
import { theme } from './theme'
import { Header } from './components/Header'
import { TabNavigation } from './components/TabNavigation'
import { ConsoleTab } from './components/ConsoleTab'
import { NetworkTab } from './components/NetworkTab'
import { SettingsTab } from './components/SettingsTab'
import { BorderBeam } from './components/magicui/BorderBeam'
import { TooltipProvider } from './components/shadcn/tooltip'

function Popup() {
  const [activeTab, setActiveTab] = useState<TabType>('Network')
  const [networkRequestsCount, setNetworkRequestsCount] = useState(7) // Initial mock count
  const [networkErrorsCount, setNetworkErrorsCount] = useState(3) // Initial mock error count
  const [addMockDataFunction, setAddMockDataFunction] = useState<(() => void) | null>(null)
  const [isBackTrackActive, setIsBackTrackActive] = useState(true)

  // Mock data to check if Network tab has data
  const hasNetworkData = networkRequestsCount > 0

  const handleExport = (format: ExportFormat) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  return (
    <TooltipProvider>
      <div
        style={{
          fontFamily: theme.typography.fontFamily,
          width: '800px',
          background: theme.colors.background.primary,
        }}
      >
        <Header 
          requestCount={networkRequestsCount}
          errorCount={networkErrorsCount}
          isActive={isBackTrackActive}
          onToggleActive={setIsBackTrackActive}
        />

        {/* Main Content */}
        <main style={{ padding: theme.spacing.lg }}>
          {/* Card Container */}
          <div
            style={{
              position: 'relative',
              background: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.lg,
              overflow: 'hidden',
              boxShadow: theme.shadows.sm,
            }}
          >
            <BorderBeam 
                 duration={6}
                 delay={3}
                 size={400}
                 borderWidth={2}
                 className="from-transparent via-blue-500 to-transparent"
            />
            
            <TabNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasNetworkData={hasNetworkData}
              onExport={handleExport}
              onAddMockData={addMockDataFunction || undefined}
            />

            {/* Tab Content */}
            <div
              style={{
                minHeight: '300px',
                background: theme.colors.background.primary,
              }}
            >
              {activeTab === 'Console' && <ConsoleTab />}
              {activeTab === 'Network' && (
                <NetworkTab 
                  onRequestsCountChange={setNetworkRequestsCount}
                  onErrorsCountChange={setNetworkErrorsCount}
                  onAddMockDataRef={setAddMockDataFunction}
                />
              )}
              {activeTab === 'Settings' && <SettingsTab />}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}

// Mount the Popup
const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Popup />
    </StrictMode>
  )
} 