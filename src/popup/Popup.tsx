import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { type TabType, type ExportFormat, type NetworkRequest } from './types'
import { theme } from './theme'
import { Header } from './components/Header'
import { TabNavigation } from './components/TabNavigation'
import { ConsoleTab } from './components/ConsoleTab'
import { NetworkTab } from './components/NetworkTab'
import { SettingsTab } from './components/SettingsTab'

import { TooltipProvider } from './components/shadcn/tooltip'

function Popup() {
  const [activeTab, setActiveTab] = useState<TabType>('Network')
  const [networkRequestsCount, setNetworkRequestsCount] = useState(7) // Initial mock count
  const [networkErrorsCount, setNetworkErrorsCount] = useState(3) // Initial mock error count
  const [addMockDataFunction, setAddMockDataFunction] = useState<(() => void) | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null)
  const [allRequests, setAllRequests] = useState<NetworkRequest[]>([])
  
  // Debug helper for selectedRequest changes
  const handleSelectedRequestChange = (request: NetworkRequest | null) => {
    console.log('BackTrack Popup: handleSelectedRequestChange called with:', request?.id);
    console.log('BackTrack Popup: Current selectedRequest before change:', selectedRequest?.id);
    setSelectedRequest(request);
    console.log('BackTrack Popup: setSelectedRequest called with:', request?.id);
  }
  
  // Debug current selected request
  useEffect(() => {
    console.log('BackTrack Popup: Current selectedRequest state:', selectedRequest?.id || 'null');
  }, [selectedRequest])
  
  // Check if we're in detached mode
  const isDetached = new URLSearchParams(window.location.search).get('detached') === 'true'
  
  // Get selected request ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const selectedRequestId = urlParams.get('selectedRequest')
  
  // Restore selected request when requests are loaded and we have a selectedRequestId
  useEffect(() => {
    if (selectedRequestId && allRequests.length > 0) {
      const foundRequest = allRequests.find(req => req.id === selectedRequestId)
      if (foundRequest) {
        // Only restore if we don't have the same request already selected (avoid unnecessary updates)
        if (!selectedRequest || selectedRequest.id !== foundRequest.id) {
          console.log('BackTrack Popup: Restoring selected request from URL:', foundRequest.id);
          handleSelectedRequestChange(foundRequest)
        }
      }
    }
  }, [selectedRequestId, allRequests]) // Removed selectedRequest from dependencies to avoid blocking restoration
  
  // Set document title and favicon for detached mode
  useEffect(() => {
    if (isDetached) {
      document.title = 'BackTrack - Network Monitor'
      
      // Remove existing favicon links
      const existingIcons = document.querySelectorAll("link[rel*='icon']")
      existingIcons.forEach(icon => icon.remove())
      
      // Add new favicon links with white logo on dark background
      const head = document.head
      
      // Main favicon
      const favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/png'
      favicon.setAttribute('sizes', '32x32')
      favicon.href = '/icons/backtrack-32.png?' + Date.now() // Cache buster
      head.appendChild(favicon)
      
      // Shortcut icon
      const shortcut = document.createElement('link')
      shortcut.rel = 'shortcut icon'
      shortcut.href = '/icons/backtrack-32.png?' + Date.now() // Cache buster
      head.appendChild(shortcut)
      
      // Alternative sizes
      const favicon16 = document.createElement('link')
      favicon16.rel = 'icon'
      favicon16.type = 'image/png'
      favicon16.setAttribute('sizes', '16x16')
      favicon16.href = '/icons/backtrack-16.png?' + Date.now()
      head.appendChild(favicon16)
      
      const favicon128 = document.createElement('link')
      favicon128.rel = 'apple-touch-icon'
      favicon128.setAttribute('sizes', '128x128')
      favicon128.href = '/icons/backtrack-128.png?' + Date.now()
      head.appendChild(favicon128)
      
      // Force browser to reload favicon
      setTimeout(() => {
        const link = document.querySelector("link[rel*='icon'][sizes='32x32']") as HTMLLinkElement
        if (link) {
          const href = link.href
          link.href = ''
          setTimeout(() => {
            link.href = href
          }, 10)
        }
      }, 100)
    }
  }, [isDetached])

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
          width: isDetached ? '100vw' : '800px',
          height: isDetached ? '100vh' : 'auto',
          background: isDetached 
            ? `linear-gradient(135deg, ${theme.colors.background.primary} 0%, rgba(20, 21, 26, 0.95) 100%)`
            : theme.colors.background.primary,
          overflow: isDetached ? 'hidden' : 'visible',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header 
          requestCount={networkRequestsCount}
          errorCount={networkErrorsCount}
          isDetached={isDetached}
          selectedRequestId={selectedRequest?.id || null}
        />

        {/* Main Content */}
        <main style={{ 
          padding: isDetached 
            ? `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg}`
            : `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.xl}`,
          background: isDetached
            ? 'transparent'
            : `linear-gradient(135deg, ${theme.colors.background.primary} 0%, rgba(24, 25, 30, 0.95) 100%)`,
          flex: isDetached ? '1' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Card Container */}
          <div
            style={{
              position: 'relative',
              background: `linear-gradient(135deg, ${theme.colors.background.cardElevated} 0%, ${theme.colors.background.card} 100%)`,
              borderRadius: isDetached ? theme.borderRadius.md : theme.borderRadius.lg,
              overflow: 'visible',
              boxShadow: isDetached 
                ? `${theme.shadows.xl}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                : `${theme.shadows.floating}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
              border: `1px solid rgba(255, 255, 255, ${isDetached ? '0.06' : '0.08'})`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              transform: isDetached ? 'none' : 'translateY(-2px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flex: isDetached ? '1' : 'none',
              display: 'flex',
              flexDirection: 'column',
              minHeight: isDetached ? '0' : 'auto',
            }}
            onMouseEnter={!isDetached ? (e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.002)';
              e.currentTarget.style.boxShadow = `${theme.shadows.floating}, 0 20px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)`;
            } : undefined}
            onMouseLeave={!isDetached ? (e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
              e.currentTarget.style.boxShadow = `${theme.shadows.floating}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`;
            } : undefined}
          >
            
            
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
                minHeight: isDetached ? '0' : '300px',
                background: theme.colors.background.primary,
                flex: isDetached ? '1' : 'none',
                display: 'flex',
                flexDirection: 'column',
                borderBottomLeftRadius: isDetached ? theme.borderRadius.md : theme.borderRadius.lg,
                borderBottomRightRadius: isDetached ? theme.borderRadius.md : theme.borderRadius.lg,
              }}
            >
              {activeTab === 'Console' && <ConsoleTab />}
              {activeTab === 'Network' && (
                <NetworkTab 
                  onRequestsCountChange={setNetworkRequestsCount}
                  onErrorsCountChange={setNetworkErrorsCount}
                  onAddMockDataRef={setAddMockDataFunction}
                  isDetached={isDetached}
                  selectedRequest={selectedRequest}
                  onSelectedRequestChange={handleSelectedRequestChange}
                  onAllRequestsChange={setAllRequests}
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