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
  viewed?: boolean;
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

export type ViewDensity = 'comfortable' | 'compact';

export interface NetworkTabProps {
  onRequestsCountChange: (count: number) => void;
  onErrorsCountChange?: (count: number) => void;
  onAddMockDataRef?: (addMockData: () => void) => void;
}

export type ExportFormat = 'json' | 'har'; 