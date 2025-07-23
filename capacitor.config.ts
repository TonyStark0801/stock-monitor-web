import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stock.monitor',
  appName: 'stock.monitor',
  webDir: 'out',
  server: {
    url: "https://stock-monitor-web.vercel.app/",
    cleartext: true
  }
};

export default config;
