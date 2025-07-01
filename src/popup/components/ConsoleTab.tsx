interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

const mockLogs: LogEntry[] = [
  { timestamp: '10:45:23', level: 'info', message: 'Request initiated to /api/users' },
  { timestamp: '10:45:24', level: 'warn', message: 'Slow network detected' },
  { timestamp: '10:45:25', level: 'error', message: 'Failed to fetch resource' },
  { timestamp: '10:45:26', level: 'info', message: 'Cache updated successfully' },
];

export function ConsoleTab() {
  return (
    <div style={{ 
      padding: '8px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {mockLogs.map((log, index) => (
        <div
          key={index}
          style={{
            padding: '4px 8px',
            borderBottom: '1px solid #2A2C32',
            color: log.level === 'error' ? '#FF4C4C' : 
                   log.level === 'warn' ? '#FFB020' : 
                   '#C5C5D2'
          }}
        >
          <span style={{ color: '#888888' }}>{log.timestamp}</span>
          {' '}
          <span style={{ 
            textTransform: 'uppercase',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '10px',
            background: log.level === 'error' ? '#FF4C4C33' : 
                       log.level === 'warn' ? '#FFB02033' : 
                       '#C5C5D233'
          }}>
            {log.level}
          </span>
          {' '}
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  );
} 