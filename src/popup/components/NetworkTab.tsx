import { useState, useEffect } from 'react';
import { type NetworkRequest, type NetworkTabProps, type ViewDensity } from '../types';
import { theme } from '../theme';
import { RippleButton as Button } from './magicui/RippleButton';
import { EmptyState } from './ui/EmptyState';
import { ClearIcon, NetworkIcon, SearchIcon, FilterIcon, ChevronDownIcon, CloseIcon, ListIcon, CardIcon } from './ui/Icons';
import { Checkbox } from './shadcn/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent } from './shadcn/tooltip';
import { Dropdown, type DropdownItem } from './ui/Dropdown';
import { getStatusColor } from './ui/StatusBadge';
import { NetworkRequestList } from './NetworkRequestList';
import { NetworkRequestTable } from './NetworkRequestTable';
import { RequestInspectorPanel } from './RequestInspectorPanel';

// Background script RequestEntry type
type RequestEntry = {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  statusLine: string;
  type: string;
  timeStamp: number;
  pinned: boolean;
  // Headers and body data
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  // Additional fields for compatibility
  domain: string;
  size?: string;
  error?: {
    message: string;
    stack?: string;
  };
};

// Transform background script data to popup format
function transformRequestEntry(entry: RequestEntry): NetworkRequest {
  const url = new URL(entry.url);
  
  // Extract name (filename or endpoint) like DevTools
  const name = (() => {
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) return url.hostname;
    
    const lastPart = pathParts[pathParts.length - 1];
    
    // If there's a query string, show the endpoint name with params
    if (url.search) {
      return lastPart + url.search;
    }
    
    // If it's just a path with no filename, show the endpoint
    if (!lastPart.includes('.')) {
      return lastPart || url.pathname;
    }
    
    // Otherwise show the filename
    return lastPart;
  })();
  
  // Format resource type for display
  const formatType = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'xmlhttprequest': return 'XHR';
      case 'stylesheet': return 'CSS';
      case 'script': return 'JS';
      case 'image': return 'IMG';
      case 'document': return 'Doc';
      case 'font': return 'Font';
      case 'media': return 'Media';
      case 'websocket': return 'WS';
      case 'manifest': return 'Manifest';
      case 'texttrack': return 'Track';
      case 'eventsource': return 'EventSource';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return {
    id: entry.id,
    status: entry.statusCode,
    name: name,
    method: entry.method,
    timestamp: new Date(entry.timeStamp).toLocaleString(),
    duration: '0.0s', // We'll calculate this when we have timing data
    viewed: false,
    // Use actual headers and body from background script
    requestHeaders: entry.requestHeaders || {},
    responseHeaders: entry.responseHeaders || {},
    requestBody: undefined, // Will be added when we capture request bodies
    responseBody: entry.responseBody || undefined,
    error: entry.error,
    // Additional DevTools-like fields
    url: entry.url,
    domain: entry.domain || url.hostname, // Use background-provided domain or fallback
    type: formatType(entry.type),
    size: entry.size,
  };
}

// Mock requests for fallback when no real data is available
const mockRequests: NetworkRequest[] = [
  { 
    id: 'mock-1',
    status: 200, 
    name: 'profile', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:20',
    duration: '0.3s',
    viewed: false,
    requestHeaders: {
      'Accept': 'application/json',
      'Authorization': 'Bearer abc123...'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      id: 123,
      name: 'John Doe',
      email: 'john@example.com'
    }, null, 2),
    url: 'https://api.example.com/api/users/profile',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-2',
    status: 201, 
    name: 'create', 
    method: 'POST',
    timestamp: '2024-03-20 10:45:21',
    duration: '0.5s',
    viewed: false,
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer abc123...'
    },
    requestBody: JSON.stringify({
      items: [{ id: '123', quantity: 2 }]
    }, null, 2),
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      orderId: '12345',
      status: 'created'
    }, null, 2),
    url: 'https://api.example.com/api/orders/create',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-3',
    status: 301, 
    name: 'products', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:22',
    duration: '0.2s',
    viewed: false,
    requestHeaders: {
      'Accept': 'application/json'
    },
    responseHeaders: {
      'Location': '/api/v2/products',
      'Content-Type': 'application/json'
    },
    url: 'https://api.example.com/api/v1/products',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-4',
    status: 404, 
    name: '999', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:23',
    duration: '0.3s',
    viewed: false,
    requestHeaders: {
      'Accept': 'application/json',
      'Authorization': 'Bearer abc123...'
    },
    responseHeaders: {
      'Content-Type': 'application/json',
      'X-Error-Code': 'PRODUCT_NOT_FOUND'
    },
    responseBody: JSON.stringify({
      error: 'Product not found',
      code: 'PRODUCT_NOT_FOUND',
      details: 'The requested product ID does not exist'
    }, null, 2),
    url: 'https://api.example.com/api/products/999',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-5',
    status: 403, 
    name: 'settings', 
    method: 'PUT',
    timestamp: '2024-03-20 10:45:24',
    duration: '0.2s',
    viewed: false,
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer abc123...'
    },
    requestBody: JSON.stringify({
      maintenance_mode: true
    }, null, 2),
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      error: 'Forbidden',
      message: 'Insufficient permissions to modify admin settings'
    }, null, 2),
    url: 'https://api.example.com/api/admin/settings',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-6',
    status: 500, 
    name: 'process', 
    method: 'POST',
    timestamp: '2024-03-20 10:45:25',
    duration: '2.5s',
    viewed: false,
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer abc123...'
    },
    requestBody: JSON.stringify({
      items: [{ id: '123', quantity: 2 }],
      paymentMethod: 'card'
    }, null, 2),
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      error: 'Internal Server Error',
      message: 'Failed to process payment',
      stack: 'Error: Payment gateway timeout\n  at ProcessPayment (/api/services/payment.js:45:12)'
    }, null, 2),
    url: 'https://api.example.com/api/checkout/process',
    domain: 'api.example.com',
    type: 'XHR'
  },
  { 
    id: 'mock-7',
    status: 502, 
    name: 'weather', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:26',
    duration: '3.0s',
    viewed: false,
    requestHeaders: {
      'Accept': 'application/json'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      error: 'Bad Gateway',
      message: 'External weather service unavailable'
    }, null, 2),
    url: 'https://api.example.com/api/external/weather',
    domain: 'api.example.com',
    type: 'XHR'
  }
];

export function NetworkTab({ 
  onRequestsCountChange, 
  onErrorsCountChange, 
  onAddMockDataRef, 
  isDetached = false,
  selectedRequest = null,
  onSelectedRequestChange,
  onAllRequestsChange
}: NetworkTabProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);
  
  // Notify parent about all requests changes
  useEffect(() => {
    onAllRequestsChange?.(requests);
  }, [requests, onAllRequestsChange]);
  
  // Ensure we always have a working close handler
  const handleClosePanel = () => {
    console.log('BackTrack: Close panel called');
    console.log('BackTrack: Current selectedRequest:', selectedRequest?.id);
    console.log('BackTrack: onSelectedRequestChange available:', !!onSelectedRequestChange);
    console.log('BackTrack: isDetached mode:', isDetached);
    
    if (onSelectedRequestChange) {
      onSelectedRequestChange(null);
      console.log('BackTrack: Called onSelectedRequestChange(null)');
    } else {
      console.warn('BackTrack: onSelectedRequestChange not provided, panel cannot close properly');
    }
  };
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  
  // View state
  const [viewDensity, setViewDensity] = useState<ViewDensity>('comfortable');
  
  // Cache control state
  const [cacheDisabled, setCacheDisabled] = useState(false);

  // Check tracking state from background script
  const checkTrackingState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TRACKING_STATE' });
      if (response && typeof response.enabled === 'boolean') {
        setIsTrackingEnabled(response.enabled);
      }
    } catch (error) {
      console.error('BackTrack: Failed to check tracking state:', error);
    }
  };

  // Fetch real network data from background script
  const fetchNetworkData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_LOG' });
      if (response && response.log && Array.isArray(response.log)) {
        const transformedRequests = response.log.map(transformRequestEntry);
        setRequests(transformedRequests);
        setIsLoadingRealData(false);
        // Only log when we actually have new data to avoid spam
        if (transformedRequests.length !== requests.length) {
          console.log('BackTrack: Updated network data:', transformedRequests.length, 'requests');
        }
      } else {
        // Fallback to mock data if no real data available
        if (requests.length === 0) {
          setRequests(mockRequests);
          console.log('BackTrack: Using mock data as fallback');
        }
        setIsLoadingRealData(false);
      }
    } catch (error) {
      console.error('BackTrack: Failed to fetch network data:', error);
      // Fallback to mock data on error
      if (requests.length === 0) {
        setRequests(mockRequests);
      }
      setIsLoadingRealData(false);
    }
  };

  // Initial data load and tracking state check
  useEffect(() => {
    fetchNetworkData();
    checkTrackingState();
  }, []);

  // Poll for new data more frequently for responsiveness  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNetworkData();
      checkTrackingState(); // Also check tracking state periodically
    }, 500); // 500ms for near real-time updates
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.method.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === '2xx' && request.status >= 200 && request.status < 300) ||
                         (statusFilter === '3xx' && request.status >= 300 && request.status < 400) ||
                         (statusFilter === 'errors' && request.status >= 400); // Combined 4xx/5xx errors
    
    const matchesMethod = !methodFilter || request.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Notify parent component when requests count changes
  useEffect(() => {
    onRequestsCountChange(requests.length);
  }, [requests.length, onRequestsCountChange]);

  // Notify parent component when error count changes
  useEffect(() => {
    const errorCount = requests.filter(request => request.status >= 400).length;
    onErrorsCountChange?.(errorCount);
  }, [requests, onErrorsCountChange]);

  // Expose addMockRequests function to parent
  useEffect(() => {
    if (onAddMockDataRef) {
      onAddMockDataRef(addMockRequests);
    }
  }, [onAddMockDataRef]);

  const clearRequests = async () => {
    console.log('BackTrack: Clear button clicked - starting clear process');
    
    // Clear local state immediately for responsive UI
    setRequests([]);
    onSelectedRequestChange?.(null);
    
    // Clear background script storage
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CLEAR_LOG' });
      if (response && response.success) {
        console.log('BackTrack: Successfully cleared background log');
        
        // Immediately verify the clear worked and start fresh polling
        setTimeout(async () => {
          const verifyResponse = await chrome.runtime.sendMessage({ type: 'GET_LOG' });
          console.log('BackTrack: Verification after clear - log size:', verifyResponse?.log?.length || 0);
          
          if (verifyResponse?.log?.length > 0) {
            console.warn('BackTrack: Background log not empty after clear, forcing local state clear');
            setRequests([]);
          } else {
            // Immediately start polling for new requests after successful clear
            fetchNetworkData();
          }
        }, 50); // Reduced delay for faster response
      }
    } catch (error) {
      console.error('BackTrack: Failed to clear background log:', error);
    }
  };

  const addMockRequests = () => {
    setRequests(mockRequests);
    setIsLoadingRealData(false);
  };

  const markRequestAsViewed = (requestId: string) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, viewed: true }
          : request
      )
    );
  };

  const clearStatusFilter = () => {
    setStatusFilter('');
    setShowStatusDropdown(false);
  };

  const clearMethodFilter = () => {
    setMethodFilter('');
    setShowMethodDropdown(false);
  };

  // Get status code color for button styling
  const getStatusFilterColor = (statusRange: string): string => {
    switch (statusRange) {
      case '2xx': return getStatusColor(200);
      case '3xx': return getStatusColor(300);
      case 'errors': return getStatusColor(400); // Use red for combined errors
      default: return theme.colors.primary.purple;
    }
  };

  const statusFilterItems: DropdownItem[] = [
    { 
      key: '2xx', 
      label: '2xx Success', 
      color: getStatusColor(200),
      onClick: () => { setStatusFilter('2xx'); setShowStatusDropdown(false); }
    },
    { 
      key: '3xx', 
      label: '3xx Redirects', 
      color: getStatusColor(300),
      onClick: () => { setStatusFilter('3xx'); setShowStatusDropdown(false); }
    },
    { 
      key: 'errors', 
      label: '4xx/5xx Errors', 
      color: getStatusColor(400),
      onClick: () => { setStatusFilter('errors'); setShowStatusDropdown(false); }
    },
  ];

  const methodFilterItems: DropdownItem[] = [
    { key: 'GET', label: 'GET', onClick: () => { setMethodFilter('GET'); setShowMethodDropdown(false); }},
    { key: 'POST', label: 'POST', onClick: () => { setMethodFilter('POST'); setShowMethodDropdown(false); }},
    { key: 'PUT', label: 'PUT', onClick: () => { setMethodFilter('PUT'); setShowMethodDropdown(false); }},
    { key: 'PATCH', label: 'PATCH', onClick: () => { setMethodFilter('PATCH'); setShowMethodDropdown(false); }},
    { key: 'DELETE', label: 'DELETE', onClick: () => { setMethodFilter('DELETE'); setShowMethodDropdown(false); }},
    { key: 'HEAD', label: 'HEAD', onClick: () => { setMethodFilter('HEAD'); setShowMethodDropdown(false); }},
    { key: 'OPTIONS', label: 'OPTIONS', onClick: () => { setMethodFilter('OPTIONS'); setShowMethodDropdown(false); }},
    { key: 'CONNECT', label: 'CONNECT', onClick: () => { setMethodFilter('CONNECT'); setShowMethodDropdown(false); }},
    { key: 'TRACE', label: 'TRACE', onClick: () => { setMethodFilter('TRACE'); setShowMethodDropdown(false); }},
  ];

  return (
    <div
      style={{
        position: 'relative',
        padding: theme.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        height: isDetached ? '100%' : '300px',
        flex: isDetached ? 1 : 'none',
        minHeight: isDetached ? 0 : 'auto',
      }}
    >
      {/* Action Buttons and Filters */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Left side - Action buttons */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ClearIcon />}
                onClick={clearRequests}
              >
                Clear
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Clear all network requests
            </TooltipContent>
          </Tooltip>

          {/* Data Source Indicator */}
          {requests.length > 0 && requests[0]?.id?.startsWith('mock-') && (
            <div
              style={{
                fontSize: '11px',
                color: theme.colors.text.muted,
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontWeight: 500,
              }}
            >
              DEMO DATA
            </div>
          )}
          
          {/* Tracking Status Indicator */}
          {!isTrackingEnabled && (
            <div
              style={{
                fontSize: '11px',
                color: theme.colors.text.muted,
                background: 'rgba(255, 76, 76, 0.1)',
                border: '1px solid rgba(255, 76, 76, 0.3)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontWeight: 500,
              }}
            >
              TRACKING DISABLED
            </div>
          )}
          
          {isLoadingRealData && isTrackingEnabled && (
            <div
              style={{
                fontSize: '11px',
                color: theme.colors.text.muted,
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontWeight: 500,
              }}
            >
              LOADING...
            </div>
          )}
          
          {/* Cache Disable Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.text.secondary,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              htmlFor="disable-cache"
            >
              <Checkbox
                id="disable-cache"
                checked={cacheDisabled}
                onCheckedChange={(checked) => {
                  setCacheDisabled(!!checked);
                  console.log('BackTrack: Cache disabled:', !!checked);
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span>Disable Cache</span>
            </label>
          </div>
        </div>

        {/* Center - Search */}
        <div style={{ 
          position: 'relative', 
          flex: 1, 
          maxWidth: '200px',
          minWidth: '150px' 
        }}>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              paddingLeft: '32px',
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.text.primary,
              fontSize: theme.typography.sizes.sm,
              outline: 'none',
              transition: theme.transitions.fast,
            }}
            onFocus={(e) => e.target.style.borderColor = theme.colors.border.focus}
            onBlur={(e) => e.target.style.borderColor = theme.colors.border.secondary}
          />
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.colors.text.muted,
              pointerEvents: 'none',
            }}
          >
            <SearchIcon size={14} />
          </span>
        </div>

        {/* Right side - Filter dropdowns */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
          {/* Status Filter */}
          <Dropdown
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FilterIcon size={12} />}
                    rightIcon={
                      statusFilter ? (
                        <span
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            clearStatusFilter();
                          }}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <CloseIcon size={12} />
                        </span>
                      ) : (
                        <span
                          style={{
                            transform: showStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: theme.transitions.fast,
                          }}
                        >
                          <ChevronDownIcon size={12} />
                        </span>
                      )
                    }
                    style={{
                      ...(statusFilter && {
                        background: getStatusFilterColor(statusFilter),
                        color: '#ffffff',
                        borderColor: getStatusFilterColor(statusFilter),
                      })
                    }}
                  >
                    {statusFilter === 'errors' ? 'Errors' : statusFilter || 'Status'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Filter by status code
                </TooltipContent>
              </Tooltip>
            }
            items={statusFilterItems}
            isOpen={showStatusDropdown}
            onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
            onClose={() => setShowStatusDropdown(false)}
          />

          {/* Method Filter */}
          <Dropdown
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FilterIcon size={12} />}
                    rightIcon={
                      methodFilter ? (
                        <span
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            clearMethodFilter();
                          }}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <CloseIcon size={12} />
                        </span>
                      ) : (
                        <span
                          style={{
                            transform: showMethodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: theme.transitions.fast,
                          }}
                        >
                          <ChevronDownIcon size={12} />
                        </span>
                      )
                    }
                    style={{
                      ...(methodFilter && {
                        background: theme.colors.primary.purple,
                        color: theme.colors.text.primary,
                      })
                    }}
                  >
                    {methodFilter || 'Method'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Filter by HTTP method
                </TooltipContent>
              </Tooltip>
            }
            items={methodFilterItems}
            isOpen={showMethodDropdown}
            onToggle={() => setShowMethodDropdown(!showMethodDropdown)}
            onClose={() => setShowMethodDropdown(false)}
          />

          {/* View Density Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewDensity === 'compact' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={viewDensity === 'compact' ? <ListIcon size={12} /> : <CardIcon size={12} />}
                onClick={() => setViewDensity(viewDensity === 'comfortable' ? 'compact' : 'comfortable')}
                style={{
                  minWidth: '40px',
                }}
              >
                {viewDensity === 'compact' ? 'Compact' : 'Comfortable'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {viewDensity === 'compact' 
                ? 'Switch to comfortable view' 
                : 'Switch to compact view'}
            </TooltipContent>
          </Tooltip>

        </div>
      </div>

      {/* Request List */}
      <div
        className="custom-scrollbar"
        style={{
          maxHeight: isDetached ? 'calc(100vh - 240px)' : '220px',
          flex: isDetached ? 1 : 'none',
          overflowY: 'auto',
          minHeight: isDetached ? '300px' : 'auto',
        }}
      >
        {!isTrackingEnabled ? (
          <EmptyState
            icon={<NetworkIcon />}
            title="Network tracking is disabled"
            description="Enable tracking in the header to start capturing network requests"
          />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={<NetworkIcon />}
            title={requests.length === 0 ? "No network requests recorded" : "No requests match filters"}
            description={requests.length === 0 ? "Start browsing to see network activity" : "Try adjusting your search or filter criteria"}
          />
        ) : (
          viewDensity === 'comfortable' ? (
            <NetworkRequestList
              requests={filteredRequests}
              selectedRequest={selectedRequest}
              onSelectRequest={onSelectedRequestChange || (() => {})}
              onMarkAsViewed={markRequestAsViewed}
            />
          ) : (
            <NetworkRequestTable
              requests={filteredRequests}
              selectedRequest={selectedRequest}
              onSelectRequest={onSelectedRequestChange || (() => {})}
              onMarkAsViewed={markRequestAsViewed}
            />
          )
        )}
      </div>

      {/* Request Inspector Panel */}
      <RequestInspectorPanel 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={handleClosePanel}
      />
    </div>
  );
} 