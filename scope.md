# BackTrack Chrome Extension — Scope & Development Plan

---

## Overview

BackTrack is a Chrome extension that helps developers and QAs capture network requests, even if DevTools wasn't open. It logs all fetch and XHR requests in the background, keeping the last 5 minutes (and up to 1,000 entries) available. The UI is a modern, minimalist dark-mode popup with tabs for Live Logs, History, and Settings. The extension is built with Vite + CRXJS, React + TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.

---

## 1. Project Structure (File/Folder Layout)

```
BackTrack/
├── public/
│   └── icons/
├── src/
│   ├── background/
│   │   └── index.ts
│   ├── content/
│   │   └── inject.js
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Tabs.tsx
│   │   │   ├── LiveLogsTab.tsx
│   │   │   ├── HistoryTab.tsx
│   │   │   ├── SettingsTab.tsx
│   │   │   ├── RequestCard.tsx
│   │   │   └── RequestDetailsModal.tsx
│   │   ├── hooks/
│   │   │   └── useLogs.ts
│   │   └── index.tsx
│   ├── styles/
│   │   └── tailwind.css
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── logUtils.ts
│   │   └── types.ts
│   ├── manifest.config.ts
│   └── shadcn/
├── tests/
│   ├── background.test.ts
│   ├── content.test.ts
│   ├── popup/
│   │   └── App.test.tsx
│   └── utils/
│       └── logUtils.test.ts
├── .env
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── README.md
└── docs/
```

---

## 2. Architecture for Background Logging and UI Communication

### A. Request Interception
- Content script patches `fetch` and `XMLHttpRequest`.
- Fallback if patching fails or is overridden; log a warning and display a UI notice.
- Handle CORS/same-origin restrictions; mark unreadable responses and show "[Content Unavailable]" in UI.
- If "Ignore Authorization Headers" is enabled, redact or omit those headers before logging.

### B. Background Service Worker
- Receives request data from content script.
- Uses a `Map<string, RequestEntry>` for log storage (ID as key).
- Prunes log by 5-minute window and 1,000 entry cap.
- Supports pinning requests (not pruned until unpinned/cleared).
- Stores logs in `chrome.storage.session` (fallback to `chrome.storage.local`).
- Supports HMR in dev mode and dotenv for environment variables.
- Sends dev-mode debug toasts to popup.
- All modules and components are documented and commented.

### C. Popup UI Communication
- HMR for popup in dev mode.
- Shows shadcn/ui toast notifications for debug/status if `DEBUG=true`.
- All modules and components are commented for clarity and maintainability.

---

## 3. Breakdown of Each Tab's Purpose and UI

### A. Live Logs Tab
- Real-time log with streaming indicator.
- Highlight failed requests in red.
- "Show Failed Only" filter.
- Click to open request details modal.
- Minimalist dark mode with shadcn/ui and Tailwind.

### B. History Tab
- Searchable/filterable log.
- "Clear log" button.
- Pin/unpin requests (kept at top, not pruned until unpinned/cleared).
- Copy-to-clipboard icons for URLs and headers.
- "Show Failed Only" filter.
- "Export as JSON" button.
- Click to open request details modal.
- Minimalist dark mode.

### C. Settings Tab
- Toggle for enabling/disabling logging.
- Retention time setting (default 5 min, max 15).
- Theme toggle (dark/light).
- Toggle for "Ignore Authorization Headers."
- Privacy flag: warn if logging on localhost/private domains.
- About/version info.
- Disclaimer on first use (local-only storage).

### D. Request Details Modal
- Tabs for Headers, Payload, Preview, Response.
- Show "[Content Unavailable]" if response body is unreadable.
- Copy-to-clipboard for headers, payload, response.

---

## 4. How to Store a Rolling 5-Minute Log

- Internally use a `Map<string, RequestEntry>` for fast lookup and deduplication.
- Expose as an array for UI rendering, sorted by timestamp.
- Prune by time (default 5 minutes, configurable) and by size (max 1,000 entries).
- Pinned requests are kept at the top and not pruned until explicitly unpinned or cleared.
- If "Ignore Authorization Headers" is enabled, redact or omit those headers from logs and exports.

---

## 5. Plan for Testing and Validation

### A. Unit Tests
- Fallback logic for fetch/XHR patching.
- CORS/unreadable response handling.
- Log pruning by time and size, and pinning logic.
- Header redaction when privacy toggle is enabled.

### B. Integration Tests
- Simulate CORS failures and verify "[Content Unavailable]" is shown.
- Test "Clear log", pinning, and copy-to-clipboard features.
- Test dev toasts and debug features in dev mode.

### C. Manual QA
- Validate fallback and error states for network interception.
- Test all new UI features (streaming indicator, pinning, clear, copy, disclaimer, privacy flag).
- Confirm that logs are never sent to remote servers.

### D. Linting & Formatting
- As before, with extra emphasis on code comments and documentation.

### E. CI/CD
- Ensure all new features and toggles are covered by tests and documentation.

---

## 6. Development Phases & Tasks

### Phase 1: Project Setup & Tooling
- [x] Scaffold project with Vite + CRXJS for Chrome extension.
- [x] Set up TypeScript, React, Tailwind CSS, and shadcn/ui.
- [x] Integrate Framer Motion for UI animations.
- [x] Configure environment variables with dotenv.
- [x] Set up ESLint, Prettier, and strict TypeScript settings.
- [x] Add HMR (Hot Module Reloading) for popup and background in dev mode.
- [x] Create initial folder structure and add documentation stubs.
- [x] Add extension icons and manifest configuration (Manifest V3).
- [ ] Set up basic CI/CD pipeline (lint, test, build).

### Phase 2: Core Network Logging Engine
- [ ] Implement content script to patch `fetch` and `XMLHttpRequest`.
- [ ] Add fallback logic if patching fails or is overridden.
- [ ] Handle CORS/same-origin restrictions; mark unreadable responses.
- [ ] Send request/response data to background service worker.
- [ ] In background, use a `Map<string, RequestEntry>` for log storage.
- [ ] Implement rolling log: prune by 5-minute window and 1,000 entry cap.
- [ ] Add support for pinning requests (not pruned until unpinned/cleared).
- [ ] Add logic to redact/omit Authorization headers if privacy toggle is enabled.
- [ ] Store logs in `chrome.storage.session` (fallback to `chrome.storage.local` if needed).
- [ ] Add dev-mode debug toasts and logging.
- [ ] Document all modules and add code comments.

### Phase 3: Popup UI & User Experience
- [ ] Scaffold popup React app with shadcn/ui and Tailwind dark mode.
- [ ] Implement tab navigation: Live Logs, History, Settings.
- [ ] Live Logs Tab:
  - [ ] Display real-time log with streaming indicator.
  - [ ] Highlight failed requests in red.
  - [ ] Add "Show Failed Only" filter.
  - [ ] Click to open request details modal.
- [ ] History Tab:
  - [ ] Display searchable/filterable log.
  - [ ] Add "Clear log" button.
  - [ ] Implement pin/unpin for requests.
  - [ ] Add copy-to-clipboard icons for URLs and headers.
  - [ ] Add "Show Failed Only" filter.
  - [ ] Add "Export as JSON" button.
  - [ ] Click to open request details modal.
- [ ] Settings Tab:
  - [ ] Toggle for enabling/disabling logging.
  - [ ] Retention time setting (default 5 min, max 15).
  - [ ] Theme toggle (dark/light).
  - [ ] Toggle for "Ignore Authorization Headers."
  - [ ] Privacy flag: warn if logging on localhost/private domains.
  - [ ] About/version info.
  - [ ] Show disclaimer on first use (local-only storage).
- [ ] Request Details Modal:
  - [ ] Tabs for Headers, Payload, Preview, Response.
  - [ ] Show "[Content Unavailable]" if response body is unreadable.
  - [ ] Add copy-to-clipboard for headers, payload, response.
- [ ] Use Framer Motion for subtle UI animations.
- [ ] Ensure all UI is responsive and accessible.
- [ ] Add thorough documentation and comments for all components.

### Phase 4: Communication & State Management
- [ ] Implement message passing between content script, background, and popup.
- [ ] Ensure popup can fetch current log and subscribe to live updates.
- [ ] Handle log updates, pinning, clearing, and export actions.
- [ ] Sync settings (e.g., privacy toggles) between popup and background.
- [ ] Add dev-mode toast notifications for debug/status.
- [ ] Test and document all communication flows.

### Phase 5: Testing, Validation & QA
- [ ] Write unit tests for:
  - [ ] Log storage, pruning, and pinning logic.
  - [ ] Fallback and error handling in network interception.
  - [ ] Header redaction and privacy features.
  - [ ] UI components and state management.
- [ ] Write integration tests for:
  - [ ] End-to-end request capture and display.
  - [ ] CORS/unreadable response handling.
  - [ ] Pinning, clearing, and exporting logs.
  - [ ] Copy-to-clipboard and streaming indicator.
- [ ] Manual QA:
  - [ ] Test on various sites (SPA, traditional, localhost, private domains).
  - [ ] Validate all UI/UX features and error states.
  - [ ] Confirm logs are never sent to remote servers.
- [ ] Lint, format, and review all code and documentation.
- [ ] Update README and developer docs.

### Phase 6: Release & Post-Launch
- [ ] Finalize and polish UI/UX.
- [ ] Review and update all documentation.
- [ ] Prepare Chrome Web Store assets (screenshots, description, privacy policy).
- [ ] Tag and release v1.0.0.
- [ ] Plan for user feedback and future feature requests.

---

This scope.md will be referenced throughout the project to ensure alignment and track progress. 