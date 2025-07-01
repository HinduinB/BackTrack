import { useState, useEffect } from 'react';

interface NetworkRequest {
  id: string;
  status: number;
  name: string;
  method: string;
  timestamp: string;
  duration: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  error?: {
    message: string;
    stack?: string;
  };
}

interface NetworkTabProps {
  onRequestsCountChange: (count: number) => void;
}

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

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return '#00D67F';
  if (status >= 300 && status < 400) return '#2F82FF';
  if (status >= 400 && status < 500) return '#FFB020';
  return '#FF4C4C';
}

function getRowClasses(status: number, isSelected: boolean): string {
  const isError = status >= 400;
  const baseClass = isError ? 'error-row' : 'non-error-row';
  return `${baseClass}${isSelected ? ' selected' : ''}`;
}

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
    <div style={{ 
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '300px'
    }}>
      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        alignItems: 'center'
      }}>
        <button
          onClick={clearRequests}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            color: '#C5C5D2',
            border: '1px solid #3A3D44',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#3A3D44';
            e.currentTarget.style.borderColor = '#4A4D54';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#3A3D44';
          }}
        >
          {/* Clear icon (circle with slash) */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 8L8 16M8 8l8 8" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Clear
        </button>
        
        <button
          onClick={addMockRequests}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 500,
            background: 'transparent',
            color: '#C5C5D2',
            border: '1px solid #3A3D44',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#3A3D44';
            e.currentTarget.style.borderColor = '#4A4D54';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#3A3D44';
          }}
        >
          {/* Add icon (plus) */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Mock Data
        </button>
      </div>

      {/* Request List */}
      <div style={{ 
        marginBottom: selectedRequest ? '12px' : 0,
        maxHeight: selectedRequest ? '100px' : '220px',
        overflowY: 'auto'
      }}>
        {requests.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '160px',
            color: '#8B8D98',
            fontSize: '14px',
            padding: '20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <div>No network requests recorded</div>
            <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center' }}>Start browsing to see network activity</div>
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{
                background: '#1E1F24',
                borderBottom: '1px solid #2A2C32',
                textAlign: 'left'
              }}>
                <th style={{
                  padding: '8px 12px',
                  color: '#A0A0B0',
                  fontWeight: 600,
                  width: '80px'
                }}>Status</th>
                <th style={{
                  padding: '8px 12px',
                  color: '#A0A0B0',
                  fontWeight: 600,
                  width: '120px'
                }}>Method</th>
                <th style={{
                  padding: '8px 12px',
                  color: '#A0A0B0',
                  fontWeight: 600
                }}>Path</th>
                <th style={{
                  padding: '8px 12px',
                  color: '#A0A0B0',
                  fontWeight: 600,
                  width: '100px'
                }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr 
                  key={request.id}
                  onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                  className={getRowClasses(request.status, selectedRequest?.id === request.id)}
                  style={{
                    borderBottom: '1px solid #2A2C32',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: `${getStatusColor(request.status)}33`,
                      color: getStatusColor(request.status)
                    }}>
                      {request.status}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '8px 12px',
                    color: '#C5C5D2'
                  }}>
                    {request.method}
                  </td>
                  <td style={{ 
                    padding: '8px 12px',
                    maxWidth: '400px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} className="request-name">
                    {request.name}
                  </td>
                  <td style={{ 
                    padding: '8px 12px',
                    color: '#C5C5D2'
                  }}>
                    {request.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Request Details */}
      {selectedRequest && (
        <div style={{
          flex: 1,
          background: '#2A2C32',
          borderRadius: '6px',
          padding: '16px',
          fontSize: '13px',
          overflowY: 'auto'
        }}>
          {/* General Info */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#FFFFFF', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              {selectedRequest.method} {selectedRequest.name}
            </div>
            <div style={{ color: '#C5C5D2', fontSize: '12px' }}>
              {selectedRequest.timestamp} • {selectedRequest.duration}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              {/* Request Details */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  color: '#A0A0B0', 
                  fontWeight: 500, 
                  marginBottom: '8px' 
                }}>
                  Request Headers
                </div>
                <pre style={{ 
                  margin: 0,
                  color: '#FFFFFF',
                  background: '#1E1F24',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(selectedRequest.requestHeaders, null, 2)}
                </pre>
              </div>

              {/* Request Body if exists */}
              {selectedRequest.requestBody && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    color: '#A0A0B0', 
                    fontWeight: 500, 
                    marginBottom: '8px' 
                  }}>
                    Request Body
                  </div>
                  <pre style={{ 
                    margin: 0,
                    color: '#FFFFFF',
                    background: '#1E1F24',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {selectedRequest.requestBody}
                  </pre>
                </div>
              )}
            </div>

            <div>
              {/* Response Headers */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  color: '#A0A0B0', 
                  fontWeight: 500, 
                  marginBottom: '8px' 
                }}>
                  Response Headers
                </div>
                <pre style={{ 
                  margin: 0,
                  color: '#FFFFFF',
                  background: '#1E1F24',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {JSON.stringify(selectedRequest.responseHeaders, null, 2)}
                </pre>
              </div>

              {/* Response Body */}
              {selectedRequest.responseBody && (
                <div>
                  <div style={{ 
                    color: '#A0A0B0', 
                    fontWeight: 500, 
                    marginBottom: '8px' 
                  }}>
                    Response Body
                  </div>
                  <pre style={{ 
                    margin: 0,
                    color: selectedRequest.status >= 400 ? getStatusColor(selectedRequest.status) : '#FFFFFF',
                    background: '#1E1F24',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {selectedRequest.responseBody}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 