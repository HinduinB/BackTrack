import { useState, useEffect } from 'react';
import { type NetworkRequest, type NetworkTabProps } from '../types';
import { theme } from '../theme';
import { RippleButton as Button } from './magicui/RippleButton';
import { EmptyState } from './ui/EmptyState';
import { ClearIcon, AddIcon, NetworkIcon, SearchIcon, FilterIcon, ChevronDownIcon, CloseIcon } from './ui/Icons';
import { Checkbox } from './shadcn/checkbox';
import { Dropdown, type DropdownItem } from './ui/Dropdown';
import { getStatusColor } from './ui/StatusBadge';
import { NetworkRequestList } from './NetworkRequestList';
import { NetworkRequestDetails } from './NetworkRequestDetails';

const mockRequests: NetworkRequest[] = [
  { 
    id: '1',
    status: 200, 
    name: '/api/users/profile', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:20',
    duration: '0.3s',
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
    }, null, 2)
  },
  { 
    id: '2',
    status: 201, 
    name: '/api/orders/create', 
    method: 'POST',
    timestamp: '2024-03-20 10:45:21',
    duration: '0.5s',
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
    }, null, 2)
  },
  { 
    id: '3',
    status: 301, 
    name: '/api/v1/products', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:22',
    duration: '0.2s',
    requestHeaders: {
      'Accept': 'application/json'
    },
    responseHeaders: {
      'Location': '/api/v2/products',
      'Content-Type': 'application/json'
    }
  },
  { 
    id: '4',
    status: 404, 
    name: '/api/products/999', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:23',
    duration: '0.3s',
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
    }, null, 2)
  },
  { 
    id: '5',
    status: 403, 
    name: '/api/admin/settings', 
    method: 'PUT',
    timestamp: '2024-03-20 10:45:24',
    duration: '0.2s',
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
    }, null, 2)
  },
  { 
    id: '6',
    status: 500, 
    name: '/api/checkout/process', 
    method: 'POST',
    timestamp: '2024-03-20 10:45:25',
    duration: '2.5s',
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
    }, null, 2)
  },
  { 
    id: '7',
    status: 502, 
    name: '/api/external/weather', 
    method: 'GET',
    timestamp: '2024-03-20 10:45:26',
    duration: '3.0s',
    requestHeaders: {
      'Accept': 'application/json'
    },
    responseHeaders: {
      'Content-Type': 'application/json'
    },
    responseBody: JSON.stringify({
      error: 'Bad Gateway',
      message: 'External weather service unavailable'
    }, null, 2)
  }
];

export function NetworkTab({ onRequestsCountChange }: NetworkTabProps) {
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [requests, setRequests] = useState<NetworkRequest[]>(mockRequests);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  
  // Cache control state
  const [cacheDisabled, setCacheDisabled] = useState(false);

  // Filter logic
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.method.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === '2xx' && request.status >= 200 && request.status < 300) ||
                         (statusFilter === '3xx' && request.status >= 300 && request.status < 400) ||
                         (statusFilter === '4xx' && request.status >= 400 && request.status < 500) ||
                         (statusFilter === '5xx' && request.status >= 500);
    
    const matchesMethod = !methodFilter || request.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Notify parent component when requests count changes
  useEffect(() => {
    onRequestsCountChange(filteredRequests.length);
  }, [filteredRequests.length, onRequestsCountChange]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  const addMockRequests = () => {
    setRequests(mockRequests);
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
      case '4xx': return getStatusColor(400);
      case '5xx': return getStatusColor(500);
      default: return theme.colors.primary.blue;
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
      label: '3xx Redirect', 
      color: getStatusColor(300),
      onClick: () => { setStatusFilter('3xx'); setShowStatusDropdown(false); }
    },
    { 
      key: '4xx', 
      label: '4xx Client Error', 
      color: getStatusColor(400),
      onClick: () => { setStatusFilter('4xx'); setShowStatusDropdown(false); }
    },
    { 
      key: '5xx', 
      label: '5xx Server Error', 
      color: getStatusColor(500),
      onClick: () => { setStatusFilter('5xx'); setShowStatusDropdown(false); }
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
        padding: theme.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        height: '300px',
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
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ClearIcon />}
            onClick={clearRequests}
          >
            Clear
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<AddIcon />}
            onClick={addMockRequests}
          >
            Add Mock Data
          </Button>
          
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
                    <ChevronDownIcon size={12} />
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
                {statusFilter || 'Status'}
              </Button>
            }
            items={statusFilterItems}
            isOpen={showStatusDropdown}
            onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
            onClose={() => setShowStatusDropdown(false)}
          />

          {/* Method Filter */}
          <Dropdown
            trigger={
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
                    <ChevronDownIcon size={12} />
                  )
                }
                style={{
                  ...(methodFilter && {
                    background: theme.colors.primary.blue,
                    color: theme.colors.text.primary,
                  })
                }}
              >
                {methodFilter || 'Method'}
              </Button>
            }
            items={methodFilterItems}
            isOpen={showMethodDropdown}
            onToggle={() => setShowMethodDropdown(!showMethodDropdown)}
            onClose={() => setShowMethodDropdown(false)}
          />


        </div>
      </div>

      {/* Request List */}
      <div
        style={{
          marginBottom: selectedRequest ? theme.spacing.md : 0,
          maxHeight: selectedRequest ? '100px' : '220px',
          overflowY: 'auto',
        }}
      >
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={<NetworkIcon />}
            title={requests.length === 0 ? "No network requests recorded" : "No requests match filters"}
            description={requests.length === 0 ? "Start browsing to see network activity" : "Try adjusting your search or filter criteria"}
          />
        ) : (
          <NetworkRequestList
            requests={filteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
          />
        )}
      </div>

      {/* Request Details */}
      {selectedRequest && (
        <NetworkRequestDetails request={selectedRequest} />
      )}
    </div>
  );
} 