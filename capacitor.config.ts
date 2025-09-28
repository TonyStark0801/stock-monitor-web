import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stock.monitor',
  appName: 'stock.monitor',
  webDir: 'out',
  server: {
    url: "https://stock-monitor-web.vercel.app/",
    cleartext: true
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
      overlaysWebView: false
    },
    SafeArea: {
      enabled: true,
      customColorsForSystemBars: true,
      statusBarColor: '#0f172a',
      statusBarStyle: 'DARK',
      navigationBarColor: '#0f172a',
      navigationBarStyle: 'DARK'
    }
  }
};

export default config;
