import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  show: boolean;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getStyles = () => {
    const baseStyles = {
      background: 'rgba(20, 24, 36, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      backdropFilter: 'blur(12px)',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          borderLeft: '3px solid #22c55e',
        };
      case 'error':
        return {
          ...baseStyles,
          borderLeft: '3px solid #ef4444',
        };
      case 'info':
        return {
          ...baseStyles,
          borderLeft: '3px solid #3b82f6',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'info': return 'i';
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 400
            }
          }}
          exit={{ 
            opacity: 0, 
            x: 300,
            transition: {
              duration: 0.2
            }
          }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            ...styles,
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '400px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              opacity: 0.9
            }}>
              {getIcon()}
            </span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
              onClick={() => {
                setIsVisible(false);
                onClose?.();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0 4px',
                marginLeft: '8px'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 1)'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 