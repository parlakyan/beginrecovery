import { useState, useEffect } from 'react';
import { networkService } from '../services/network';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await networkService.goOnline();
    };

    const handleOffline = async () => {
      setIsOnline(false);
      await networkService.goOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
