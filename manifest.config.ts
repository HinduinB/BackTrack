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
  icons: {
    16: 'icons/placeholder-16.png',
    32: 'icons/placeholder-32.png',
    48: 'icons/placeholder-48.png',
    128: 'icons/placeholder-128.png',
  },
  permissions: ['storage', 'scripting', 'activeTab'],
  host_permissions: ['<all_urls>'],
}); 