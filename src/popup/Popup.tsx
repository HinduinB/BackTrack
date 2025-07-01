import { StrictMode, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { ConsoleTab } from './components/ConsoleTab'
import { NetworkTab } from './components/NetworkTab'
import { SettingsTab } from './components/SettingsTab'

type TabType = 'Console' | 'Network' | 'Settings';

function Popup() {
  const [activeTab, setActiveTab] = useState<TabType>('Network');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [networkRequestsCount, setNetworkRequestsCount] = useState(7); // Initial mock count
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data to check if Network tab has data
  const hasNetworkData = networkRequestsCount > 0;

  const handleExport = (format: 'json' | 'har') => {
    setShowExportDropdown(false);
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'Inter, Segoe UI, Helvetica Neue, sans-serif',
      width: '800px',
      background: '#1E1F24'
    }}>
      {/* Header */}
      <header style={{
        height: '48px',
        padding: '12px 16px',
        background: '#1E1F24',
        borderBottom: '1px solid #2A2C32',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#FFFFFF'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#00D67F' 
          }} />
          BackTrack Enabled
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '16px' }}>
        {/* Card Container */}
        <div style={{
          background: '#2A2C32',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#2A2C32',
            borderBottom: '1px solid #3A3D44'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Console', 'Network', 'Settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    background: activeTab === tab ? '#2C2D34' : 'transparent',
                    color: activeTab === tab ? '#FFFFFF' : '#C5C5D2',
                    border: activeTab === tab ? '1px solid #007ACC' : '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.background = '#3A3D44';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.background = 'transparent';
                    } else {
                      e.currentTarget.style.background = '#2C2D34';
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Export Button - Only show for Network tab with data */}
            {activeTab === 'Network' && hasNetworkData && (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  onMouseEnter={(e) => {
                    if (!showExportDropdown) {
                      e.currentTarget.style.background = '#3A3D44';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showExportDropdown) {
                      e.currentTarget.style.background = '#2A2C32';
                    } else {
                      e.currentTarget.style.background = '#2C2D34';
                    }
                  }}
                  style={{
                    background: showExportDropdown ? '#2C2D34' : '#2A2C32',
                    color: showExportDropdown ? '#FFFFFF' : '#C5C5D2',
                    border: showExportDropdown ? '1px solid #007ACC' : '1px solid transparent',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                  }}
                >
                  Export as
                  <span style={{ 
                    marginLeft: '4px',
                    transform: showExportDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>▼</span>
                </button>

                {showExportDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '4px',
                    background: '#2A2C32',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                    zIndex: 10,
                    minWidth: '140px'
                  }}>
                    <button
                      onClick={() => handleExport('json')}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 16px',
                        border: 'none',
                        borderBottom: '1px solid #2F3138',
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#3A3D44'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleExport('har')}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 16px',
                        border: 'none',
                        background: 'transparent',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#3A3D44'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Export as HAR
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div style={{ 
            minHeight: '300px',
            background: '#1E1F24'
          }}>
            {activeTab === 'Console' && <ConsoleTab />}
            {activeTab === 'Network' && <NetworkTab onRequestsCountChange={setNetworkRequestsCount} />}
            {activeTab === 'Settings' && <SettingsTab />}
          </div>
        </div>
      </main>
    </div>
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