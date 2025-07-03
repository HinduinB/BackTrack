"use client";

import { useState, useEffect, type ReactNode } from 'react';
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

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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

  return (
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
        onClick={onClose}
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
                  onClick={onClose}
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


    </>
  );
}

// Placeholder tab components (we'll implement these next)
function OverviewTab({ request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Overview Content</h3>
      <p>Status: {request.status}</p>
      <p>Method: {request.method}</p>
      <p>URL: {request.name}</p>
      <p>Duration: {request.duration}</p>
    </div>
  );
}

function HeadersTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Headers Content</h3>
      <p>Request and response headers will go here</p>
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

function ResponseTab({ request: _request }: { request: NetworkRequest }) {
  return (
    <div style={{ color: theme.colors.text.primary }}>
      <h3>Response Content</h3>
      <p>Response body content will go here</p>
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