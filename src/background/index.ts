/// <reference types="chrome" />

// BackTrack Chrome Extension Background Service Worker
// Handles background network logging and communication with popup UI.
// See scope.md for architecture and requirements.

// Placeholder background service worker for BackTrack Chrome Extension
// You can add listeners and logic here as needed.

chrome.runtime.onMessage.addListener(
  (msg: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
    console.log('Received network request:', msg);
    console.log('BackTrack: received message in background', msg);
  }
); 
console.log('Background service worker loaded');

chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log('BackTrack: webRequest captured', details);
  },
  { urls: ['<all_urls>'] }
);