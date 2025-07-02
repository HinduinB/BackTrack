export type TabType = 'Console' | 'Network' | 'Settings';

export interface NetworkRequest {
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

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface NetworkTabProps {
  onRequestsCountChange: (count: number) => void;
}

export type ExportFormat = 'json' | 'har'; 