import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useNetwork } from '../hooks/useNetwork';

export default function NetworkStatus() {
  const isOnline = useNetwork();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <WifiOff className="w-4 h-4" />
      <span>Offline mode - Some features may be limited</span>
    </div>
  );
}