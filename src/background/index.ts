/// <reference types="chrome" />

// BackTrack Chrome Extension Background Service Worker
// Handles background network logging and communication with popup UI.
// See scope.md for architecture and requirements.

// Extension icon management
const STORAGE_KEY = 'backtrack-enabled';

// Detached window management
let detachedWindowId: number | null = null;

// Browser window tracking for auto-close functionality
let browserWindowIds: Set<number> = new Set();

async function updateExtensionIcon(enabled: boolean) {
  try {
    const iconColor = enabled ? 'green' : 'red';
    const iconPath = {
      16: `icons/backtrack-${iconColor}-16.png`,
      32: `icons/backtrack-${iconColor}-32.png`,
      48: `icons/backtrack-${iconColor}-48.png`,
      128: `icons/backtrack-${iconColor}-128.png`,
    };
    
    await chrome.action.setIcon({ path: iconPath });
  } catch (error) {
    console.error('BackTrack: Extension icon update failed:', error);
  }
}

async function getTrackingState(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] !== undefined ? JSON.parse(result[STORAGE_KEY]) : true; // Default to enabled
  } catch (error) {
    console.error('BackTrack: getTrackingState error:', error);
    return true;
  }
}

// Dynamic popup management - disable popup when detached window exists
async function updatePopupState() {
  try {
    if (detachedWindowId) {
      // Check if detached window still exists
      try {
        await chrome.windows.get(detachedWindowId);
        // Window exists, disable popup
        await chrome.action.setPopup({ popup: '' });
      } catch {
        // Window doesn't exist anymore, clear reference and restore popup
        detachedWindowId = null;
        await chrome.action.setPopup({ popup: 'index.html' });
      }
    } else {
      // No detached window, ensure popup is enabled
      await chrome.action.setPopup({ popup: 'index.html' });
    }
  } catch (error) {
    console.error('BackTrack: Error updating popup state:', error);
  }
}

// Handle toolbar icon clicks when popup is disabled (detached window exists)
chrome.action.onClicked.addListener(async () => {
  try {
    if (detachedWindowId) {
      // Focus existing detached window
      await chrome.windows.update(detachedWindowId, { focused: true });
      console.log('BackTrack: Focused existing detached window');
    }
  } catch (error) {
    console.error('BackTrack: Error handling action click:', error);
  }
});

// Track browser window creation
chrome.windows.onCreated.addListener((window) => {
  if (window.type === 'normal') {
    browserWindowIds.add(window.id!);
  }
});

// Track detached window lifecycle and browser window closing
chrome.windows.onRemoved.addListener(async (windowId) => {
  // Handle detached window closing
  if (windowId === detachedWindowId) {
    detachedWindowId = null;
    console.log('BackTrack: Detached window closed');
    // Restore popup functionality
    await updatePopupState();
  }
  
  // Handle browser window closing
  if (browserWindowIds.has(windowId)) {
    browserWindowIds.delete(windowId);
    
    // Check if this was the last browser window
    const remainingWindows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    const normalWindows = remainingWindows.filter(w => w.type === 'normal');
    
    if (normalWindows.length === 0 && detachedWindowId) {
      // No more browser windows, close detached window
      try {
        await chrome.windows.remove(detachedWindowId);
        console.log('BackTrack: Auto-closed detached window as browser closed');
      } catch (error) {
        console.log('BackTrack: Error auto-closing detached window:', error);
      }
      detachedWindowId = null;
    }
  }
});

// Handle extension suspension (browser closing)
chrome.runtime.onSuspend.addListener(async () => {
  if (detachedWindowId) {
    try {
      await chrome.windows.remove(detachedWindowId);
      console.log('BackTrack: Closed detached window on browser shutdown');
    } catch (error) {
      console.log('BackTrack: Error closing detached window on shutdown:', error);
    }
  }
});

// Initialize browser window tracking
async function initializeBrowserWindowTracking() {
  try {
    const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    browserWindowIds.clear();
    windows.forEach(window => {
      if (window.type === 'normal' && window.id) {
        browserWindowIds.add(window.id);
      }
    });
    console.log(`BackTrack: Tracking ${browserWindowIds.size} browser windows`);
  } catch (error) {
    console.error('BackTrack: Error initializing window tracking:', error);
  }
}

// Initialize extension icon on startup
chrome.runtime.onStartup.addListener(async () => {
  const enabled = await getTrackingState();
  await updateExtensionIcon(enabled);
  // Ensure popup state is correct on startup
  await updatePopupState();
  // Initialize browser window tracking
  await initializeBrowserWindowTracking();
});

// Initialize extension icon when extension is installed or enabled
chrome.runtime.onInstalled.addListener(async () => {
  const enabled = await getTrackingState();
  await updateExtensionIcon(enabled);
  // Ensure popup state is correct on install
  await updatePopupState();
  // Initialize browser window tracking
  await initializeBrowserWindowTracking();
});

// Listen for storage changes to update icon
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    const enabled = JSON.parse(changes[STORAGE_KEY].newValue);
    await updateExtensionIcon(enabled);
  }
});

type RequestEntry = {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  statusLine: string;
  type: string;
  timeStamp: number;
  pinned: boolean;
  // Headers and body data
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody?: string;
  // Additional fields for compatibility
  domain: string;
  size?: string;
  error?: {
    message: string;
    stack?: string;
  };
};

const LOG_RETENTION_MS = 5 * 60 * 1000; // 5 minutes
const LOG_MAX_ENTRIES = 1000;

const requestLog: Map<string, RequestEntry> = new Map();
// Temporary storage for request headers (keyed by requestId)
const requestHeadersMap: Map<string, Record<string, string>> = new Map();
// Temporary storage for response headers (keyed by requestId)  
const responseHeadersMap: Map<string, Record<string, string>> = new Map();

function pruneLog() {
  const now = Date.now();
  // Remove entries older than retention window (unless pinned)
  for (const [id, entry] of requestLog) {
    if (!entry.pinned && now - entry.timeStamp > LOG_RETENTION_MS) {
      requestLog.delete(id);
    }
  }
  // If over max entries, remove oldest (except pinned)
  if (requestLog.size > LOG_MAX_ENTRIES) {
    const unpinned = Array.from(requestLog.values())
      .filter(e => !e.pinned)
      .sort((a, b) => a.timeStamp - b.timeStamp);
    while (requestLog.size > LOG_MAX_ENTRIES && unpinned.length) {
      const oldest = unpinned.shift();
      if (oldest) requestLog.delete(oldest.id);
    }
  }
}

async function saveLogToStorage() {
  const logArr = Array.from(requestLog.values());
  try {
    await chrome.storage.session.set({ requestLog: logArr });
  } catch (e) {
    // Fallback to local if session fails
    try {
      await chrome.storage.local.set({ requestLog: logArr });
    } catch (err) {
      console.error('BackTrack: Failed to persist log', err);
    }
  }
}

async function restoreLogFromStorage() {
  let logArr: RequestEntry[] = [];
  try {
    const sessionData = await chrome.storage.session.get('requestLog');
    if (sessionData.requestLog) {
      logArr = sessionData.requestLog;
    } else {
      const localData = await chrome.storage.local.get('requestLog');
      if (localData.requestLog) {
        logArr = localData.requestLog;
      }
    }
  } catch (e) {
    console.error('BackTrack: Failed to restore log', e);
  }
  for (const entry of logArr) {
    requestLog.set(entry.id, entry);
  }
  pruneLog();
}

// Function to clear all requests
async function clearAllRequests() {
  const prevSize = requestLog.size;
  requestLog.clear();
  
  // Clear temporary header storage
  requestHeadersMap.clear();
  responseHeadersMap.clear();
  
  // Clear storage
  try {
    await chrome.storage.session.remove('requestLog');
  } catch (e) {
    try {
      await chrome.storage.local.remove('requestLog');
    } catch (err) {
      console.error('BackTrack: Failed to clear storage during navigation', err);
    }
  }
  
  if (prevSize > 0) {
    console.log(`BackTrack: Auto-cleared ${prevSize} requests on page navigation`);
  }
}

// Auto-clear requests on page navigation/refresh
// Only clear on main frame navigations to actual web pages (not extension pages, iframes, etc.)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only process main frame navigations (not iframes)
  if (details.frameId !== 0) {
    return;
  }
  
  // Skip extension URLs and other internal Chrome URLs
  if (details.url.startsWith('chrome://') || 
      details.url.startsWith('chrome-extension://') ||
      details.url.startsWith('moz-extension://') ||
      details.url.startsWith('edge-extension://') ||
      details.url.startsWith('about:') ||
      details.url.startsWith('data:') ||
      details.url.startsWith('blob:')) {
    return;
  }
  
  // Check if tracking is enabled before auto-clearing
  const isTrackingEnabled = await getTrackingState();
  if (!isTrackingEnabled) {
    return;
  }
  
  // Clear all requests for this new page
  await clearAllRequests();
}, { url: [{ schemes: ['http', 'https'] }] });

// Restore log on startup
restoreLogFromStorage();

function pruneLogAndPersist() {
  pruneLog();
  saveLogToStorage();
}

console.log('Background service worker loaded');

// Capture request headers
chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    // Note: Can't check tracking state here due to async limitations
    // Will be filtered in onCompleted instead
    
    if (details.url.includes('chrome-extension://') ||
        details.url.includes('moz-extension://') ||
        details.url.includes('edge-extension://')) {
      return;
    }

    // Store request headers temporarily
    const headers: Record<string, string> = {};
    if (details.requestHeaders) {
      details.requestHeaders.forEach(header => {
        headers[header.name] = header.value || '';
      });
    }
    
    // Reconstruct missing HTTP/2 pseudo-headers that Chrome filters out
    // These are what DevTools shows but webRequest API doesn't provide
    try {
      const url = new URL(details.url);
      headers[':authority'] = url.host;
      headers[':method'] = details.method;
      headers[':path'] = url.pathname + url.search;
      headers[':scheme'] = url.protocol.slice(0, -1); // Remove trailing ':'
    } catch (error) {
      console.warn('BackTrack: Failed to reconstruct pseudo-headers for', details.url, error);
    }
    
    requestHeadersMap.set(details.requestId.toString(), headers);
    
    // Debug logging
    console.log('BackTrack: Request headers captured for', details.url, 
      'headers:', Object.keys(headers).length, 'requestId:', details.requestId);
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders']
);

// Capture response headers
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    // Note: Can't check tracking state here due to async limitations
    // Will be filtered in onCompleted instead
    
    if (details.url.includes('chrome-extension://') ||
        details.url.includes('moz-extension://') ||
        details.url.includes('edge-extension://')) {
      return undefined;
    }

    // Store response headers temporarily
    const headers: Record<string, string> = {};
    if (details.responseHeaders) {
      details.responseHeaders.forEach(header => {
        headers[header.name] = header.value || '';
      });
    }
    responseHeadersMap.set(details.requestId.toString(), headers);
    
    // Debug logging
    console.log('BackTrack: Response headers captured for', details.url, 
      'headers:', Object.keys(headers).length, 'requestId:', details.requestId);
    
    return undefined;
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const requestId = details.requestId.toString();
    
    // Get headers from temporary storage FIRST (before any early returns)
    const requestHeaders = requestHeadersMap.get(requestId) || {};
    const responseHeaders = responseHeadersMap.get(requestId) || {};
    
    // Clean up temporary storage immediately to prevent memory leaks
    requestHeadersMap.delete(requestId);
    responseHeadersMap.delete(requestId);

    // Debug header capture
    if (Object.keys(requestHeaders).length > 0 || Object.keys(responseHeaders).length > 0) {
      console.log('BackTrack: Headers captured for', details.url, {
        requestHeaders: Object.keys(requestHeaders).length,
        responseHeaders: Object.keys(responseHeaders).length,
        requestId: requestId
      });
    } else {
      console.warn('BackTrack: No headers captured for', details.url, 'requestId:', requestId);
    }

    // Check if tracking is enabled before saving requests
    const isTrackingEnabled = await getTrackingState();
    if (!isTrackingEnabled) {
      console.log('BackTrack: Tracking disabled, skipping request storage');
      return; // Skip capturing if tracking is disabled
    }

    // Skip extension requests entirely - don't capture them at all
    if (details.url.includes('chrome-extension://') ||
        details.url.includes('moz-extension://') ||
        details.url.includes('edge-extension://')) {
      return; // Skip all extension requests
    }

    const id = `${details.requestId}-${details.timeStamp}`;

    // Extract domain from URL
    let domain = '';
    try {
      domain = new URL(details.url).hostname;
    } catch {
      domain = details.url;
    }

    // Calculate response size
    let size: string | undefined;
    const contentLength = responseHeaders['content-length'] || responseHeaders['Content-Length'];
    if (contentLength) {
      const bytes = parseInt(contentLength);
      if (bytes < 1024) size = `${bytes} B`;
      else if (bytes < 1024 * 1024) size = `${(bytes / 1024).toFixed(1)} KB`;
      else size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const entry: RequestEntry = {
      id,
      url: details.url,
      method: details.method,
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      type: details.type,
      timeStamp: details.timeStamp,
      pinned: false,
      requestHeaders,
      responseHeaders,
      domain,
      size,
    };
    requestLog.set(id, entry);
    pruneLogAndPersist();
    
    console.log('BackTrack: captured', `${details.method} ${new URL(details.url).pathname}`, 
      `(${requestLog.size} total)`, 
      `Headers stored: req=${Object.keys(requestHeaders).length}, resp=${Object.keys(responseHeaders).length}`);
  },
  { urls: ['<all_urls>'] }
);

/**
 * Message passing: Handle popup requests
 *
 * Messages:
 * - { type: 'GET_LOG' } -> Response: { log: RequestEntry[] } (sorted by time, newest first)
 * - { type: 'CLEAR_LOG' } -> Response: { success: boolean }
 * - { type: 'GET_TRACKING_STATE' } -> Response: { enabled: boolean }
 * - { type: 'SET_TRACKING_STATE', enabled: boolean } -> Response: { success: boolean }
 * - { type: 'REGISTER_DETACHED_WINDOW', windowId: number } -> Response: { success: boolean }
 * - { type: 'ATTACH_TO_POPUP' } -> Response: { success: boolean }
 */
chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg && msg.type === 'GET_LOG') {
    const logArr = Array.from(requestLog.values()).sort((a, b) => b.timeStamp - a.timeStamp);
    // Only log when we have data to avoid spam from frequent polling
    if (logArr.length > 0) {
      console.log('BackTrack: returning', logArr.length, 'requests to popup');
    }
    sendResponse({ log: logArr });
    return true; // Indicates async response is possible
  }
  
  if (msg && msg.type === 'CLEAR_LOG') {
    console.log('BackTrack: CLEAR_LOG message received - clearing', requestLog.size, 'requests');
    
    // Clear the in-memory log
    requestLog.clear();
    
    // Clear storage
    chrome.storage.session.remove('requestLog').catch(() => {
      // Fallback to local storage if session fails
      chrome.storage.local.remove('requestLog').catch((err) => {
        console.error('BackTrack: Failed to clear storage', err);
      });
    });
    
    console.log('BackTrack: Request log cleared by user - log size now:', requestLog.size);
    sendResponse({ success: true });
    return true;
  }

  if (msg && msg.type === 'GET_TRACKING_STATE') {
    // Handle async operation properly
    (async () => {
      try {
        const enabled = await getTrackingState();
        sendResponse({ enabled });
      } catch (error) {
        console.error('BackTrack: Error in GET_TRACKING_STATE:', error);
        sendResponse({ enabled: true }); // Fallback
      }
    })();
    return true; // Keep the message channel open for async response
  }

  if (msg && msg.type === 'SET_TRACKING_STATE' && typeof msg.enabled === 'boolean') {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: JSON.stringify(msg.enabled) });
      await updateExtensionIcon(msg.enabled);
      sendResponse({ success: true });
    } catch (error) {
      console.error('BackTrack: Failed to set tracking state:', error);
      sendResponse({ success: false, error: String(error) });
    }
    return true;
  }

  if (msg && msg.type === 'REGISTER_DETACHED_WINDOW' && typeof msg.windowId === 'number') {
    detachedWindowId = msg.windowId;
    console.log('BackTrack: Registered detached window:', msg.windowId);
    // Update popup state to disable popup
    await updatePopupState();
    sendResponse({ success: true });
    return true;
  }

  if (msg && msg.type === 'ATTACH_TO_POPUP') {
    try {
      // Clear detached window reference
      detachedWindowId = null;
      console.log('BackTrack: Attaching to popup mode');
      
      // Restore popup functionality
      await chrome.action.setPopup({ popup: 'index.html' });
      console.log('BackTrack: Popup functionality restored');
      
      // Try to open popup after a small delay
      setTimeout(async () => {
        try {
          await chrome.action.openPopup();
          console.log('BackTrack: Popup opened successfully');
        } catch (error) {
          console.log('BackTrack: Auto-open popup failed (user can click toolbar icon):', error instanceof Error ? error.message : error);
        }
      }, 200);
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('BackTrack: Error in ATTACH_TO_POPUP:', error);
      sendResponse({ success: false });
    }
    return true;
  }
});