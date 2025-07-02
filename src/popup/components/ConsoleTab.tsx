import { type LogEntry } from '../types';
import { theme } from '../theme';

const mockLogs: LogEntry[] = [
  { timestamp: '10:45:23', level: 'info', message: 'Request initiated to /api/users' },
  { timestamp: '10:45:24', level: 'warn', message: 'Slow network detected' },
  { timestamp: '10:45:25', level: 'error', message: 'Failed to fetch resource' },
  { timestamp: '10:45:26', level: 'info', message: 'Cache updated successfully' },
];

function getLogLevelColor(level: LogEntry['level']): string {
  switch (level) {
    case 'error':
      return theme.colors.status.error;
    case 'warn':
      return theme.colors.status.warning;
    case 'info':
    default:
      return theme.colors.text.secondary;
  }
}

function getLogLevelBackground(level: LogEntry['level']): string {
  switch (level) {
    case 'error':
      return `${theme.colors.status.error}33`;
    case 'warn':
      return `${theme.colors.status.warning}33`;
    case 'info':
    default:
      return `${theme.colors.text.secondary}33`;
  }
}

export function ConsoleTab() {
  return (
    <div
      style={{
        padding: theme.spacing.sm,
        height: '100%',
        overflowY: 'auto',
        fontFamily: theme.typography.monoFamily,
        fontSize: theme.typography.sizes.sm,
      }}
    >
      {mockLogs.map((log, index) => (
        <div
          key={index}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            color: getLogLevelColor(log.level),
          }}
        >
          <span style={{ color: theme.colors.text.disabled }}>{log.timestamp}</span>
          {' '}
          <span
            style={{
              textTransform: 'uppercase',
              padding: `2px ${theme.spacing.xs}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.sizes.xs,
              background: getLogLevelBackground(log.level),
            }}
          >
            {log.level}
          </span>
          {' '}
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  );
} 