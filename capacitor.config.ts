import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stock.monitor',
  appName: 'stock.monitor',
  webDir: 'dist'
  server: {
    url: "https://stock-monitor-hlw3o6vz4-tonystark0801s-projects.vercel.app", // your Vercel URL
    cleartext: true
  }
};

export default config;
