/// <reference types="chrome" />

// BackTrack Chrome Extension Background Service Worker
// Handles background network logging and communication with popup UI.
// See scope.md for architecture and requirements.

// Extension icon management
const STORAGE_KEY = 'backtrack-enabled';

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
    console.log(`BackTrack: Extension icon updated to ${iconColor}`);
  } catch (error) {
    console.error('BackTrack: Extension icon update failed:', error);
  }
}

async function getTrackingState(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] !== undefined ? JSON.parse(result[STORAGE_KEY]) : true; // Default to enabled
  } catch {
    return true;
  }
}

// Initialize extension icon on startup
chrome.runtime.onStartup.addListener(async () => {
  const enabled = await getTrackingState();
  await updateExtensionIcon(enabled);
});

// Initialize extension icon when extension is installed or enabled
chrome.runtime.onInstalled.addListener(async () => {
  const enabled = await getTrackingState();
  await updateExtensionIcon(enabled);
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
  // Add more fields as needed (headers, initiator, etc.)
};

const LOG_RETENTION_MS = 5 * 60 * 1000; // 5 minutes
const LOG_MAX_ENTRIES = 1000;

const requestLog: Map<string, RequestEntry> = new Map();

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

// Restore log on startup
restoreLogFromStorage();

function pruneLogAndPersist() {
  pruneLog();
  saveLogToStorage();
}

chrome.runtime.onMessage.addListener(
  (msg: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
    console.log('Received network request:', msg);
    console.log('BackTrack: received message in background', msg);
  }
); 
console.log('Background service worker loaded');

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const id = `${details.requestId}-${details.timeStamp}`;
    const entry: RequestEntry = {
      id,
      url: details.url,
      method: details.method,
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      type: details.type,
      timeStamp: details.timeStamp,
      pinned: false,
    };
    requestLog.set(id, entry);
    pruneLogAndPersist();
    console.log('BackTrack: webRequest captured', entry);
  },
  { urls: ['<all_urls>'] }
);

/**
 * Message passing: Respond to popup requests for the current log.
 *
 * Message: { type: 'GET_LOG' }
 * Response: { log: RequestEntry[] } (sorted by time, newest first)
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'GET_LOG') {
    const logArr = Array.from(requestLog.values()).sort((a, b) => b.timeStamp - a.timeStamp);
    sendResponse({ log: logArr });
    return true; // Indicates async response is possible
  }
});