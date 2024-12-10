import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Network service for managing online/offline functionality
 */
export const networkService = {
  async goOnline() {
    try {
      console.log('Enabling network connectivity');
      await enableNetwork(db);
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  },

  async goOffline() {
    try {
      console.log('Disabling network connectivity');
      await disableNetwork(db);
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }
};
