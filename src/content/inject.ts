// BackTrack Chrome Extension Content Script
// Injected into every page to patch fetch and XMLHttpRequest for network request logging.
// See scope.md for architecture and requirements.

// Declare chrome for TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;

// Patch window.fetch to intercept network requests
(function () {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const [input, init] = args;
    const method = (init && init.method) || 'GET';
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.toString();
    }
    // Handle all header types
    let requestHeaders: Record<string, string> = {};
    if (init?.headers instanceof Headers) {
      requestHeaders = Object.fromEntries(init.headers.entries());
    } else if (Array.isArray(init?.headers)) {
      requestHeaders = Object.fromEntries(init.headers);
    } else if (init?.headers) {
      requestHeaders = { ...init.headers };
    }
    const requestBody = (init && init.body) || undefined;
    const startTime = Date.now();

    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      let responseBody = '';
      let responseHeaders = {};
      let status = response.status;
      let statusText = response.statusText;
      try {
        responseBody = await clonedResponse.text();
        responseHeaders = Object.fromEntries(clonedResponse.headers.entries());
      } catch (e) {
        responseBody = '[Content Unavailable]';
      }
      const endTime = Date.now();
      // Send captured data to background script
      console.log('BackTrack: sending network request to background (fetch)', {
        url,
        method,
        requestHeaders,
        requestBody,
        status,
        statusText,
        responseHeaders,
        responseBody,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        source: 'fetch',
      });
      return response;
    } catch (error) {
      // Send error to background script
      console.error('BackTrack: fetch error', error);
      throw error;
    }
  };
  console.log('BackTrack: fetch patched', window.fetch);
})();

// Subclass XMLHttpRequest for interception
class BackTrackXHR extends window.XMLHttpRequest {
  private _url = '';
  private _method = '';
  private _requestHeaders: Record<string, string> = {};
  private _requestBody: any = undefined;
  private _startTime = 0;

  open(method: string, url: string, async?: boolean, user?: string, password?: string) {
    this._method = method;
    this._url = url;
    super.open(method, url, async ?? true, user, password);
  }

  setRequestHeader(header: string, value: string) {
    this._requestHeaders[header] = value;
    super.setRequestHeader(header, value);
  }

  send(body?: Document | BodyInit | null) {
    this._requestBody = body;
    this._startTime = Date.now();
    this.addEventListener('loadend', () => {
      let responseBody = '';
      let responseHeaders = {};
      let status = this.status;
      let statusText = this.statusText;
      try {
        responseBody = this.responseText;
        responseHeaders = parseXHRHeaders(this.getAllResponseHeaders());
      } catch (e) {
        responseBody = '[Content Unavailable]';
      }
      const endTime = Date.now();
      console.log('BackTrack: sending network request to background (xhr)', {
        url: this._url,
        method: this._method,
        requestHeaders: this._requestHeaders,
        requestBody: this._requestBody,
        status,
        statusText,
        responseHeaders,
        responseBody,
        startTime: this._startTime,
        endTime,
        durationMs: endTime - this._startTime,
        source: 'xhr',
      });
    });
    super.send(body as XMLHttpRequestBodyInit | Document | null | undefined);
  }
}

function parseXHRHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  raw.split('\r\n').forEach((line) => {
    const [key, ...vals] = line.split(': ');
    if (key && vals.length) {
      headers[key] = vals.join(': ');
    }
  });
  return headers;
}

window.XMLHttpRequest = BackTrackXHR;
console.log('BackTrack: XHR patched', window.XMLHttpRequest); 