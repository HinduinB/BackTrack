"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { type NetworkRequest } from '../types';
import { theme } from '../theme';
import { CloseIcon } from './ui/Icons';
import { RippleButton } from './magicui/RippleButton';
import { Tooltip, TooltipTrigger, TooltipContent } from './shadcn/tooltip';
import { DotPattern } from './magicui/DotPattern';

interface RequestInspectorPanelProps {
  request: NetworkRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'headers' | 'payload' | 'response' | 'timing' | 'preview' | 'initiator';

interface TabDefinition {
  id: TabType;
  label: string;
  content: ReactNode;
}

// Helper function to get gradient colors based on status code
function getStatusGradient(statusCode: number): { background: string; dotColor: string; tabIndicator: string } {
  
  if (statusCode >= 200 && statusCode < 300) {
    // Success - Green gradient
    return {
      background: 'linear-gradient(135deg, rgba(0, 214, 127, 0.15) 0%, rgba(0, 214, 127, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
      dotColor: 'rgba(0, 214, 127, 0.4)',
      tabIndicator: 'linear-gradient(90deg, #00D67F, #8b5cf6)'
    };
  } else if (statusCode >= 300 && statusCode < 400) {
    // Redirect - Blue gradient  
    return {
      background: 'linear-gradient(135deg, rgba(47, 130, 255, 0.15) 0%, rgba(47, 130, 255, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
      dotColor: 'rgba(47, 130, 255, 0.4)',
      tabIndicator: 'linear-gradient(90deg, #8B5CF6, #A855F7)'
    };
  } else if (statusCode >= 400 && statusCode < 500) {
    // Client Error - Orange gradient
    return {
      background: 'linear-gradient(135deg, rgba(255, 176, 32, 0.15) 0%, rgba(255, 176, 32, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
      dotColor: 'rgba(255, 176, 32, 0.4)',
      tabIndicator: 'linear-gradient(90deg, #FFB020, #8b5cf6)'
    };
  } else if (statusCode >= 500) {
    // Server Error - Red gradient
    return {
      background: 'linear-gradient(135deg, rgba(255, 76, 76, 0.15) 0%, rgba(255, 76, 76, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
      dotColor: 'rgba(255, 76, 76, 0.4)',
      tabIndicator: 'linear-gradient(90deg, #FF4C4C, #8b5cf6)'
    };
  }
  
  // Default - Purple gradient
  return {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(6, 182, 212, 0.1) 100%)',
    dotColor: 'rgba(139, 92, 246, 0.4)',
    tabIndicator: 'linear-gradient(90deg, #8b5cf6, #06b6d4)'
  };
}

export function RequestInspectorPanel({ request, isOpen, onClose }: RequestInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Debug helper for close tracking
  const handleClose = () => {
    console.log('BackTrack RequestInspectorPanel: Close button clicked');
    console.log('BackTrack RequestInspectorPanel: onClose callback available:', !!onClose);
    console.log('BackTrack RequestInspectorPanel: Current request:', request?.id);
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  if (!isOpen && !isAnimating) return null;
  if (!request) return null;

  const { background, dotColor, tabIndicator } = getStatusGradient(request.status);

  const tabs: TabDefinition[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab request={request} />
    },
    {
      id: 'headers',
      label: 'Headers',
      content: <HeadersTab request={request} />
    },
    {
      id: 'payload',
      label: 'Payload',
      content: <PayloadTab request={request} />
    },
    {
      id: 'response',
      label: 'Response',
      content: <ResponseTab request={request} />
    },
    {
      id: 'timing',
      label: 'Timing',
      content: <TimingTab request={request} />
    },
    {
      id: 'preview',
      label: 'Preview',
      content: <PreviewTab request={request} />
    },
    {
      id: 'initiator',
      label: 'Initiator',
      content: <InitiatorTab request={request} />
    }
  ];

  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 500ms ease-out',
        }}
        onClick={handleClose}
      />

      {/* Slide-in Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '60%',
          minWidth: '500px',
          height: '100vh',
          background: 'rgba(18, 18, 19, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${theme.colors.border.secondary}`,
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onTransitionEnd={handleAnimationEnd}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border.secondary}`,
            background,
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          {/* Dot Pattern Background */}
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1.5}
            color={dotColor}
            glow={true}
            style={{
              maskImage: 'radial-gradient(circle at center, white 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle at center, white 40%, transparent 70%)',
            }}
          />
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <h2
                style={{
                  fontSize: theme.typography.sizes.lg,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.colors.text.primary,
                  margin: 0,
                  marginBottom: theme.spacing.xs,
                }}
              >
                Request Details
              </h2>
              <div
                style={{
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.text.secondary,
                  fontFamily: 'monospace',
                }}
              >
                {request.method} {request.name}
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <RippleButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  rippleColor="rgba(255, 255, 255, 0.2)"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: '50%',
                  }}
                >
                  <CloseIcon size={20} />
                </RippleButton>
              </TooltipTrigger>
              <TooltipContent>
                Close (Esc)
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            padding: `0 ${theme.spacing.lg} ${theme.spacing.xs}`,
            borderBottom: `1px solid ${theme.colors.border.secondary}`,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div 
            style={{ 
              position: 'relative',
              display: 'flex', 
              width: '100%',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: 'relative',
                  padding: `${theme.spacing.sm} ${theme.spacing.xs}`,
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: activeTab === tab.id ? theme.typography.weights.medium : theme.typography.weights.normal,
                  cursor: 'pointer',
                  transition: 'all 200ms ease-out',
                  outline: 'none',
                  flex: 1,
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = theme.colors.text.primary;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = theme.colors.text.secondary;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {tab.label}
              </button>
                          ))}
              
              {/* Traveling Tab Indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: `${100 / tabs.length}%`,
                  height: '2px',
                  background: 'transparent',
                  transform: `translateX(${activeTabIndex * 100}%)`,
                  transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '80%',
                    height: '2px',
                    background: tabIndicator,
                    borderRadius: '1px',
                  }}
                />
              </div>
            </div>
        </div>

        {/* Tab Content */}
        <div
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: theme.spacing.lg,
          }}
        >
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </>,
    document.body
  );
}

// Placeholder tab components (we'll implement these next)
function OverviewTab({ request }: { request: NetworkRequest }) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`BackTrack: Copied ${label} to clipboard`);
    } catch (error) {
      console.error('BackTrack: Failed to copy to clipboard:', error);
    }
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return '#00D67F'; // Success - Green
    if (status >= 300 && status < 400) return '#2F82FF'; // Redirect - Blue  
    if (status >= 400 && status < 500) return '#FFB020'; // Client Error - Orange
    if (status >= 500) return '#FF4C4C'; // Server Error - Red
    return theme.colors.text.muted; // Unknown
  };

  const getStatusText = (status: number): string => {
    if (status >= 200 && status < 300) return 'OK';
    if (status >= 300 && status < 400) return 'Redirect';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  const getCacheStatus = (): string => {
    const cacheControl = request.responseHeaders['cache-control'] || request.responseHeaders['Cache-Control'] || '';
    const expires = request.responseHeaders['expires'] || request.responseHeaders['Expires'] || '';
    const etag = request.responseHeaders['etag'] || request.responseHeaders['ETag'] || '';
    
    if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) return 'No Cache';
    if (etag || expires || cacheControl.includes('max-age')) return 'Cacheable';
    return 'Unknown';
  };

  const getProtocol = (): string => {
    // Try to detect from URL or headers
    if (request.url.startsWith('https://')) return 'HTTPS';
    if (request.url.startsWith('http://')) return 'HTTP';
    return 'HTTP/1.1'; // Fallback
  };

  const getResponseSize = (): string => {
    if (request.size) return request.size;
    
    const contentLength = request.responseHeaders['content-length'] || request.responseHeaders['Content-Length'];
    if (contentLength) {
      const bytes = parseInt(contentLength);
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    
    if (request.responseBody) {
      const bytes = new Blob([request.responseBody]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    
    return 'N/A';
  };

  const getRemoteIP = (): string => {
    // This would typically come from webRequest API details
    return 'N/A'; // Chrome extension limitation
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const InfoRow = ({ icon, label, value, color, copyable = false }: {
    icon: string;
    label: string; 
    value: string;
    color?: string;
    copyable?: boolean;
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      background: 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${theme.colors.border.secondary}`,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    }}>
      <span style={{ marginRight: theme.spacing.sm, fontSize: '16px' }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.text.muted,
          marginBottom: '2px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.medium,
          color: color || theme.colors.text.primary,
          fontFamily: copyable ? 'monospace' : 'inherit',
          wordBreak: 'break-all',
        }}>
          {value}
        </div>
      </div>
      {copyable && (
        <button
          onClick={() => copyToClipboard(value, label)}
          style={{
            padding: theme.spacing.xs,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: theme.borderRadius.sm,
            color: theme.colors.primary.purple,
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
          }}
        >
          📋
        </button>
      )}
    </div>
  );

  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3 style={{
        margin: `0 0 ${theme.spacing.lg} 0`,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.text.primary,
      }}>
        Request Overview
      </h3>

      <div style={{ display: 'grid', gap: theme.spacing.sm }}>
        <InfoRow
          icon="✅"
          label="Status"
          value={`${request.status} ${getStatusText(request.status)}`}
          color={getStatusColor(request.status)}
        />

        <InfoRow
          icon="🔗"
          label="URL"
          value={request.url}
          copyable={true}
        />

        <InfoRow
          icon="⚡"
          label="Method"
          value={request.method}
          color={request.method === 'GET' ? '#00D67F' : '#2F82FF'}
        />

        <InfoRow
          icon="⏱️"
          label="Duration"
          value={request.duration}
        />

        <InfoRow
          icon="📅"
          label="Timestamp"
          value={formatTimestamp(request.timestamp)}
        />

        <InfoRow
          icon="🏷️"
          label="Response Size"
          value={getResponseSize()}
        />

        <InfoRow
          icon="📡"
          label="Protocol"
          value={getProtocol()}
        />

        <InfoRow
          icon="🔄"
          label="Cache Status"
          value={getCacheStatus()}
        />

        <InfoRow
          icon="🌐"
          label="Remote IP"
          value={getRemoteIP()}
        />

        {request.type && (
          <InfoRow
            icon="🏗️"
            label="Resource Type"
            value={request.type}
          />
        )}

        {request.domain && (
          <InfoRow
            icon="🌍"
            label="Domain"
            value={request.domain}
            copyable={true}
          />
        )}

        {request.error && (
          <div style={{
            padding: theme.spacing.md,
            background: 'rgba(255, 76, 76, 0.1)',
            border: '1px solid rgba(255, 76, 76, 0.3)',
            borderRadius: theme.borderRadius.md,
            marginTop: theme.spacing.md,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
            }}>
              <span style={{ marginRight: theme.spacing.sm, fontSize: '16px' }}>
                ❌
              </span>
              <span style={{
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.semibold,
                color: '#FF4C4C',
              }}>
                Error Details
              </span>
            </div>
            <div style={{
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.text.primary,
              fontFamily: 'monospace',
            }}>
              {request.error.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeadersTab({ request }: { request: NetworkRequest }) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add toast notification
      console.log(`BackTrack: Copied ${label} to clipboard`);
    } catch (error) {
      console.error('BackTrack: Failed to copy to clipboard:', error);
    }
  };

  const copyAllRequestHeaders = () => {
    const headerText = Object.entries(request.requestHeaders)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    copyToClipboard(headerText, 'Request Headers');
  };

  const copyAllResponseHeaders = () => {
    const headerText = Object.entries(request.responseHeaders)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    copyToClipboard(headerText, 'Response Headers');
  };

  const copyCurl = () => {
    const headersString = Object.entries(request.requestHeaders)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ');
    
    const curlCommand = `curl -X ${request.method} ${headersString} "${request.url}"`;
    copyToClipboard(curlCommand, 'cURL Command');
  };

  const renderHeaderSection = (title: string, headers: Record<string, string>, onCopyAll: () => void) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.border.secondary}`
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          color: theme.colors.text.primary,
        }}>
          {title}
        </h3>
        <button
          onClick={onCopyAll}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: theme.borderRadius.md,
            color: theme.colors.primary.purple,
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Copy All
        </button>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${theme.colors.border.secondary}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {Object.keys(headers).length === 0 ? (
          <div style={{
            color: theme.colors.text.muted,
            fontStyle: 'italic',
            textAlign: 'center',
            padding: theme.spacing.lg
          }}>
            No headers available
          </div>
        ) : (
          Object.entries(headers).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                padding: `${theme.spacing.xs} 0`,
                borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
              }}
            >
              <div style={{
                fontWeight: theme.typography.weights.medium,
                color: theme.colors.text.secondary,
                minWidth: '120px',
                marginRight: theme.spacing.md,
                fontFamily: 'monospace',
                fontSize: theme.typography.sizes.sm,
              }}>
                {key}:
              </div>
              <div style={{
                color: theme.colors.text.primary,
                flex: 1,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: theme.typography.sizes.sm,
              }}>
                {value}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ color: theme.colors.text.primary }}>
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: theme.spacing.sm, 
        marginBottom: theme.spacing.lg,
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={copyCurl}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            background: 'rgba(0, 214, 127, 0.1)',
            border: '1px solid rgba(0, 214, 127, 0.3)',
            borderRadius: theme.borderRadius.md,
            color: '#00D67F',
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 214, 127, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 214, 127, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Copy as cURL
        </button>
      </div>

      {/* Headers Layout */}
      <div style={{ 
        display: 'flex', 
        gap: theme.spacing.lg,
        minHeight: '300px'
      }}>
        {renderHeaderSection("Request Headers", request.requestHeaders, copyAllRequestHeaders)}
        {renderHeaderSection("Response Headers", request.responseHeaders, copyAllResponseHeaders)}
      </div>
    </div>
  );
}

function PayloadTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Payload Content</h3>
      <p>Request payload content will go here</p>
    </div>
  );
}

function ResponseTab({ request }: { request: NetworkRequest }) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`BackTrack: Copied ${label} to clipboard`);
    } catch (error) {
      console.error('BackTrack: Failed to copy to clipboard:', error);
    }
  };

  const downloadResponse = () => {
    try {
      const responseBody = request.responseBody || '';
      const contentType = request.responseHeaders['content-type'] || 'text/plain';
      const blob = new Blob([responseBody], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `response-${request.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('BackTrack: Response downloaded');
    } catch (error) {
      console.error('BackTrack: Failed to download response:', error);
    }
  };

  const formatJSON = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const isJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const getContentType = (): string => {
    const contentType = request.responseHeaders['content-type'] || request.responseHeaders['Content-Type'] || '';
    return contentType.split(';')[0].trim();
  };

  const renderJSONContent = (content: string) => {
    const formatted = formatJSON(content);
    const lines = formatted.split('\n');
    
    return (
      <pre style={{
        margin: 0,
        fontFamily: 'monospace',
        fontSize: theme.typography.sizes.sm,
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {lines.map((line, index) => (
          <div key={index} style={{
            padding: '2px 0',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            paddingLeft: theme.spacing.sm,
            marginLeft: theme.spacing.xs,
          }}>
            <span style={{
              color: theme.colors.text.muted,
              marginRight: theme.spacing.sm,
              minWidth: '30px',
              display: 'inline-block',
              textAlign: 'right',
              fontSize: '11px',
            }}>
              {index + 1}
            </span>
            <span style={{ color: getLineColor(line) }}>
              {line}
            </span>
          </div>
        ))}
      </pre>
    );
  };

  const getLineColor = (line: string): string => {
    const trimmed = line.trim();
    if (trimmed.match(/^["{]/)) return theme.colors.text.primary;
    if (trimmed.match(/^"/)) return '#98D8C8'; // String values
    if (trimmed.match(/^[\d.-]+,?$/)) return '#F7DC6F'; // Numbers
    if (trimmed.match(/^(true|false),?$/)) return '#BB8FCE'; // Booleans
    if (trimmed.match(/^null,?$/)) return '#EC7063'; // null
    return theme.colors.text.secondary;
  };

  const responseBody = request.responseBody || '';
  const contentType = getContentType();
  const isEmpty = !responseBody.trim();

  return (
    <div style={{ color: theme.colors.text.primary }}>
      {/* Header with Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.border.secondary}`
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary,
          }}>
            Response Body
          </h3>
          <p style={{
            margin: `${theme.spacing.xs} 0 0 0`,
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.muted,
          }}>
            Content-Type: {contentType || 'unknown'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          {isJSON(responseBody) && (
            <button
              onClick={() => copyToClipboard(formatJSON(responseBody), 'Formatted JSON')}
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: theme.borderRadius.md,
                color: theme.colors.primary.purple,
                fontSize: theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.medium,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Copy JSON
            </button>
          )}
          
          <button
            onClick={() => copyToClipboard(responseBody, 'Raw Response')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: 'rgba(47, 130, 255, 0.1)',
              border: '1px solid rgba(47, 130, 255, 0.3)',
              borderRadius: theme.borderRadius.md,
              color: '#2F82FF',
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(47, 130, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(47, 130, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Copy Raw
          </button>

          <button
            onClick={downloadResponse}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              background: 'rgba(0, 214, 127, 0.1)',
              border: '1px solid rgba(0, 214, 127, 0.3)',
              borderRadius: theme.borderRadius.md,
              color: '#00D67F',
              fontSize: theme.typography.sizes.xs,
              fontWeight: theme.typography.weights.medium,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 214, 127, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 214, 127, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Download
          </button>
        </div>
      </div>

      {/* Response Content */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${theme.colors.border.secondary}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        maxHeight: '500px',
        overflowY: 'auto',
        minHeight: '200px'
      }}>
        {isEmpty ? (
          <div style={{
            color: theme.colors.text.muted,
            fontStyle: 'italic',
            textAlign: 'center',
            padding: theme.spacing.xl
          }}>
            No response body available
          </div>
        ) : isJSON(responseBody) ? (
          renderJSONContent(responseBody)
        ) : contentType.includes('image') ? (
          <div style={{
            color: theme.colors.text.muted,
            textAlign: 'center',
            padding: theme.spacing.xl
          }}>
            <div style={{ marginBottom: theme.spacing.sm }}>📷 Image Response</div>
            <div style={{ fontSize: theme.typography.sizes.sm }}>
              Image content cannot be displayed in extension popup
            </div>
          </div>
        ) : (
          <pre style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: theme.typography.sizes.sm,
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: theme.colors.text.primary,
          }}>
            {responseBody}
          </pre>
        )}
      </div>
    </div>
  );
}

function TimingTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Timing Content</h3>
      <p>Request timing breakdown will go here</p>
    </div>
  );
}

function PreviewTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Preview Content</h3>
      <p>Smart content preview will go here</p>
    </div>
  );
}

function InitiatorTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Initiator Content</h3>
      <p>Request initiator and call stack will go here</p>
    </div>
  );
} 