// Using the RequestEntry type from background script
type RequestEntry = {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  statusLine: string;
  type: string;
  timeStamp: number;
  pinned: boolean;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  domain: string;
  size?: string;
  error?: {
    message: string;
    stack?: string;
  };
  // Additional fields we might encounter
  duration?: number;
  mimeType?: string;
  requestBody?: any;
  requestBodySize?: number;
  responseSize?: number;
  redirectUrl?: string;
};

export interface HARLog {
  version: string;
  creator: {
    name: string;
    version: string;
  };
  browser?: {
    name: string;
    version: string;
  };
  pages: HARPage[];
  entries: HAREntry[];
  comment?: string;
}

export interface HARPage {
  startedDateTime: string;
  id: string;
  title: string;
  pageTimings: {
    onContentLoad?: number;
    onLoad?: number;
  };
}

export interface HAREntry {
  pageref?: string;
  startedDateTime: string;
  time: number;
  request: HARRequest;
  response: HARResponse;
  cache: {};
  timings: HARTimings;
  serverIPAddress?: string;
  connection?: string;
  comment?: string;
}

export interface HARRequest {
  method: string;
  url: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  queryString: HARQueryString[];
  postData?: HARPostData;
  headersSize: number;
  bodySize: number;
}

export interface HARResponse {
  status: number;
  statusText: string;
  httpVersion: string;
  cookies: HARCookie[];
  headers: HARHeader[];
  content: HARContent;
  redirectURL: string;
  headersSize: number;
  bodySize: number;
}

export interface HARHeader {
  name: string;
  value: string;
}

export interface HARCookie {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface HARQueryString {
  name: string;
  value: string;
}

export interface HARPostData {
  mimeType: string;
  params?: HARParam[];
  text?: string;
}

export interface HARParam {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
}

export interface HARContent {
  size: number;
  compression?: number;
  mimeType: string;
  text?: string;
  encoding?: string;
}

export interface HARTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send: number;
  wait: number;
  receive: number;
  ssl?: number;
}

export class HARExporter {
  static convertRequestsToHAR(requests: RequestEntry[], pageUrl?: string): HARLog {
    const now = new Date().toISOString();
    const pageId = `page_${Date.now()}`;
    
    // Create a single page entry
    const page: HARPage = {
      startedDateTime: now,
      id: pageId,
      title: pageUrl || 'BackTrack Captured Requests',
      pageTimings: {}
    };

    // Convert each request to HAR entry
    const entries: HAREntry[] = requests.map(request => this.convertRequestToHAREntry(request, pageId));

    return {
      version: '1.2',
      creator: {
        name: 'BackTrack',
        version: '1.0.0'
      },
      browser: {
        name: 'Chrome',
        version: navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'Unknown'
      },
      pages: [page],
      entries,
      comment: 'Exported from BackTrack - Note: Some security-sensitive headers may be missing due to Chrome extension limitations'
    };
  }

  private static convertRequestToHAREntry(request: RequestEntry, pageId: string): HAREntry {
    const startTime = new Date(request.timeStamp);
    
    // Parse URL for query parameters
    const url = new URL(request.url);
    const queryString: HARQueryString[] = Array.from(url.searchParams.entries()).map(([name, value]) => ({
      name,
      value
    }));

    // Convert headers
    const requestHeaders: HARHeader[] = Object.entries(request.requestHeaders || {}).map(([name, value]) => ({
      name,
      value: String(value || '')
    }));

    const responseHeaders: HARHeader[] = Object.entries(request.responseHeaders || {}).map(([name, value]) => ({
      name,
      value: String(value || '')
    }));

    // Estimate timing (Chrome extension API limitations)
    const totalTime = request.duration || 0;
    const timings: HARTimings = {
      blocked: -1, // Not available
      dns: -1,     // Not available
      connect: -1, // Not available
      send: 0,     // Assume minimal send time
      wait: Math.max(0, totalTime - 10), // Most time spent waiting
      receive: 10, // Assume 10ms receive time
      ssl: -1      // Not available
    };

    return {
      pageref: pageId,
      startedDateTime: startTime.toISOString(),
      time: totalTime,
      request: {
        method: request.method,
        url: request.url,
        httpVersion: 'HTTP/2.0', // Most modern requests use HTTP/2
        cookies: [], // Chrome extensions can't access cookies
        headers: requestHeaders,
        queryString,
        postData: request.requestBody ? {
          mimeType: this.guessMimeType(request),
          text: JSON.stringify(request.requestBody)
        } : undefined,
        headersSize: this.calculateHeadersSize(requestHeaders),
        bodySize: request.requestBodySize || 0
      },
      response: {
        status: request.statusCode,
        statusText: this.getStatusText(request.statusCode),
        httpVersion: 'HTTP/2.0',
        cookies: [], // Chrome extensions can't access response cookies
        headers: responseHeaders,
        content: {
          size: request.responseSize || 0,
          mimeType: request.mimeType || 'application/octet-stream',
          text: request.responseBody || undefined
        },
        redirectURL: request.redirectUrl || '',
        headersSize: this.calculateHeadersSize(responseHeaders),
        bodySize: request.responseSize || 0
      },
      cache: {},
      timings,
      comment: request.error ? `Error: ${request.error}` : undefined
    };
  }

  private static guessMimeType(request: RequestEntry): string {
    // Try to guess from content-type header
    const contentType = request.requestHeaders?.['content-type'] || request.requestHeaders?.['Content-Type'];
    if (contentType) return contentType;

    // Guess from method and URL
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      if (request.url.includes('/api/')) return 'application/json';
      return 'application/x-www-form-urlencoded';
    }

    return 'text/plain';
  }

  private static getStatusText(statusCode: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };

    return statusTexts[statusCode] || 'Unknown';
  }

  private static calculateHeadersSize(headers: HARHeader[]): number {
    return headers.reduce((size, header) => size + header.name.length + header.value.length + 4, 0);
  }

  static exportToFile(harData: HARLog, filename?: string): void {
    const jsonString = JSON.stringify(harData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const defaultFilename = `backtrack-export-${timestamp}.har`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async getCurrentPageUrl(): Promise<string | undefined> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab?.url;
    } catch (error) {
      console.warn('Could not get current page URL:', error);
      return undefined;
    }
  }

  static getExportStats(requests: RequestEntry[]): {
    totalRequests: number;
    uniqueDomains: number;
    errorCount: number;
    sizeStats: {
      totalBytes: number;
      avgResponseTime: number;
    };
    limitations: string[];
  } {
    const domains = new Set(requests.map(r => new URL(r.url).hostname));
    const errors = requests.filter(r => r.error || r.statusCode >= 400);
    const totalBytes = requests.reduce((sum, r) => sum + (r.responseSize || 0), 0);
    const avgResponseTime = requests.length > 0 
      ? requests.reduce((sum, r) => sum + (r.duration || 0), 0) / requests.length 
      : 0;

    return {
      totalRequests: requests.length,
      uniqueDomains: domains.size,
      errorCount: errors.length,
      sizeStats: {
        totalBytes,
        avgResponseTime: Math.round(avgResponseTime)
      },
      limitations: [
        'Security-sensitive headers (Cookie, Authorization) may be filtered',
        'Detailed timing data not available from Chrome extensions',
        'Response bodies limited to what Chrome extension API provides',
        'HTTP/2 pseudo-headers reconstructed from available data'
      ]
    };
  }
} 