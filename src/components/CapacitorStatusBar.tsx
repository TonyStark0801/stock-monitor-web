'use client';

import { useEffect } from 'react';

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      platform: string;
      isNativePlatform: () => boolean;
    };
  }
}

export default function CapacitorStatusBar() {
  useEffect(() => {
    // Only run on mobile/Capacitor
    if (typeof window !== 'undefined' && window.Capacitor) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#0f172a' });
        StatusBar.setOverlaysWebView({ overlay: false });
      }).catch(err => {
        console.log('Status bar plugin not available:', err);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
