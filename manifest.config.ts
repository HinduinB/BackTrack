import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'BackTrack',
  version: '0.1.0',
  description: "Capture network requests even if DevTools wasn't open.",
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/inject.ts'],
      run_at: 'document_start',
    },
  ],
  icons: {
    16: 'icons/backtrack-16.png',
    32: 'icons/backtrack-32.png',
    48: 'icons/backtrack-48.png',
    128: 'icons/backtrack-128.png',
  },
  permissions: ['storage', 'scripting', 'activeTab', 'webRequest', 'webRequestBlocking', 'windows', 'webNavigation'],
  host_permissions: ['<all_urls>'],
}); 