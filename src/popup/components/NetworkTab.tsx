import { useState, useEffect } from 'react';
import { type NetworkRequest, type NetworkTabProps } from '../types';
import { theme } from '../theme';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { ClearIcon, AddIcon, NetworkIcon } from './ui/Icons';
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

  // Notify parent component when requests count changes
  useEffect(() => {
    onRequestsCountChange(requests.length);
  }, [requests.length, onRequestsCountChange]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  const addMockRequests = () => {
    setRequests(mockRequests);
  };

  return (
    <div
      style={{
        padding: theme.spacing.md,
        display: 'flex',
        flexDirection: 'column',
        height: '300px',
      }}
    >
      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          alignItems: 'center',
        }}
      >
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
      </div>

      {/* Request List */}
      <div
        style={{
          marginBottom: selectedRequest ? theme.spacing.md : 0,
          maxHeight: selectedRequest ? '100px' : '220px',
          overflowY: 'auto',
        }}
      >
        {requests.length === 0 ? (
          <EmptyState
            icon={<NetworkIcon />}
            title="No network requests recorded"
            description="Start browsing to see network activity"
          />
        ) : (
          <NetworkRequestList
            requests={requests}
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