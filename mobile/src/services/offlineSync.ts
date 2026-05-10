import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

interface OfflineData {
  properties: any[];
  inquiries: any[];
  favorites: any[];
  user: any;
  lastSync: string;
}

interface SyncQueue {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  type: 'property' | 'inquiry' | 'favorite' | 'user';
  data: any;
  timestamp: number;
}

class OfflineSyncService {
  private static instance: OfflineSyncService;
  private static readonly STORAGE_KEYS = {
    OFFLINE_DATA: 'offline_data',
    SYNC_QUEUE: 'sync_queue',
    LAST_SYNC: 'last_sync',
  };

  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(OfflineSyncService.STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : {
        properties: [],
        inquiries: [],
        favorites: [],
        user: null,
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting offline data:', error);
      return {
        properties: [],
        inquiries: [],
        favorites: [],
        user: null,
        lastSync: new Date().toISOString(),
      };
    }
  }

  async setOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const currentData = await this.getOfflineData();
      const updatedData = { ...currentData, ...data };
      await AsyncStorage.setItem(OfflineSyncService.STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error setting offline data:', error);
    }
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    try {
      const queue = await AsyncStorage.getItem(OfflineSyncService.STORAGE_KEYS.SYNC_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async addToSyncQueue(item: SyncQueue): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      queue.push(item);
      await AsyncStorage.setItem(OfflineSyncService.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OfflineSyncService.STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  async getLastSync(): Promise<string> {
    try {
      const lastSync = await AsyncStorage.getItem(OfflineSyncService.STORAGE_KEYS.LAST_SYNC);
      return lastSync || new Date(0).toISOString();
    } catch (error) {
      console.error('Error getting last sync:', error);
      return new Date(0).toISOString();
    }
  }

  async setLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(OfflineSyncService.STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache',
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  }

  async syncWhenOnline(): Promise<void> {
    const isOnline = await this.isOnline();
    if (isOnline) {
      await this.processSyncQueue();
    }
  }

  async processSyncQueue(): Promise<void> {
    const { user } = useAuth();
    
    if (!user) {
      console.log('Cannot sync: User not authenticated');
      await this.clearSyncQueue();
      return;
    }

    try {
      const queue = await this.getSyncQueue();
      const offlineData = await this.getOfflineData();
      
      for (const item of queue) {
        try {
          await this.processSyncItem(item, offlineData);
          
          // Update offline data after successful sync
          await this.updateOfflineDataAfterSync(item, offlineData);
          
        } catch (error) {
          console.error(`Error syncing ${item.type} ${item.action}:`, error);
        }
      }

      // Clear processed items from queue
      const remainingQueue = queue.slice(0, -1);
      await AsyncStorage.setItem(OfflineSyncService.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remainingQueue));
      
      // Update last sync timestamp
      await this.setLastSync(new Date().toISOString());
      
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }

  private async processSyncItem(item: SyncQueue, offlineData: OfflineData): Promise<void> {
    const { user } = useAuth();
    const token = await AsyncStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    switch (item.type) {
      case 'property':
        await this.syncProperty(item, offlineData, token);
        break;
      case 'inquiry':
        await this.syncInquiry(item, offlineData, token);
        break;
      case 'favorite':
        await this.syncFavorite(item, offlineData, token);
        break;
      case 'user':
        await this.syncUser(item, offlineData, token);
        break;
      default:
        console.warn('Unknown sync item type:', item.type);
    }
  }

  private async syncProperty(item: SyncQueue, offlineData: OfflineData, token: string): Promise<void> {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/properties`, {
      method: item.action === 'CREATE' ? 'POST' : item.action === 'DELETE' ? 'DELETE' : 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync property ${item.action}`);
    }

    // Update local cache
    let updatedProperties = [...offlineData.properties];
    
    switch (item.action) {
      case 'CREATE':
        updatedProperties.push(item.data);
        break;
      case 'UPDATE':
        updatedProperties = updatedProperties.map(p => p.id === item.data.id ? item.data : p);
        break;
      case 'DELETE':
        updatedProperties = updatedProperties.filter(p => p.id !== item.data.id);
        break;
    }

    await this.setOfflineData({ properties: updatedProperties });
  }

  private async syncInquiry(item: SyncQueue, offlineData: OfflineData, token: string): Promise<void> {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/inquiries`, {
      method: item.action === 'CREATE' ? 'POST' : item.action === 'DELETE' ? 'DELETE' : 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync inquiry ${item.action}`);
    }

    // Update local cache
    let updatedInquiries = [...offlineData.inquiries];
    
    switch (item.action) {
      case 'CREATE':
        updatedInquiries.push(item.data);
        break;
      case 'UPDATE':
        updatedInquiries = updatedInquiries.map(i => i.id === item.data.id ? item.data : i);
        break;
      case 'DELETE':
        updatedInquiries = updatedInquiries.filter(i => i.id !== item.data.id);
        break;
    }

    await this.setOfflineData({ inquiries: updatedInquiries });
  }

  private async syncFavorite(item: SyncQueue, offlineData: OfflineData, token: string): Promise<void> {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/favorites`, {
      method: item.action === 'CREATE' ? 'POST' : item.action === 'DELETE' ? 'DELETE' : 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync favorite ${item.action}`);
    }

    // Update local cache
    let updatedFavorites = [...offlineData.favorites];
    
    switch (item.action) {
      case 'CREATE':
        updatedFavorites.push(item.data);
        break;
      case 'UPDATE':
        updatedFavorites = updatedFavorites.map(f => f.id === item.data.id ? item.data : f);
        break;
      case 'DELETE':
        updatedFavorites = updatedFavorites.filter(f => f.id !== item.data.id);
        break;
    }

    await this.setOfflineData({ favorites: updatedFavorites });
  }

  private async syncUser(item: SyncQueue, offlineData: OfflineData, token: string): Promise<void> {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user profile');
    }

    const userData = await response.json();
    await this.setOfflineData({ user: userData });
  }

  private async updateOfflineDataAfterSync(item: SyncQueue, offlineData: OfflineData): Promise<void> {
    // Remove synced item from queue
    const queue = await this.getSyncQueue();
    const updatedQueue = queue.filter(q => q.timestamp !== item.timestamp);
    await AsyncStorage.setItem(OfflineSyncService.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));

    // Mark data as synced
    const syncTimestamp = new Date().toISOString();
    await this.setLastSync(syncTimestamp);
  }

  async downloadDataForOffline(): Promise<void> {
    const { user } = useAuth();
    const token = await AsyncStorage.getItem('auth_token');
    
    if (!user || !token) {
      console.log('Cannot download offline data: User not authenticated');
      return;
    }

    try {
      // Download properties
      const propertiesResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/properties?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
      });

      if (propertiesResponse.ok) {
        const properties = await propertiesResponse.json();
        await this.setOfflineData({ 
          ...await this.getOfflineData(), 
          properties: properties.properties || [] 
        });
      }

      // Download favorites
      const favoritesResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        await this.setOfflineData({ 
          ...await this.getOfflineData(), 
          favorites: favorites || [] 
        });
      }

      console.log('Offline data downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading offline data:', error);
    }
  }

  async initializeOfflineSupport(): Promise<void> {
    try {
      // Check if we have offline data
      const offlineData = await this.getOfflineData();
      const lastSync = await this.getLastSync();
      
      // If no data or last sync was very old, download fresh data
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const daysSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (!offlineData.properties.length || daysSinceLastSync > 7) {
        console.log('Downloading fresh offline data...');
        await this.downloadDataForOffline();
      }

      // Setup periodic sync when online
      setInterval(async () => {
        await this.syncWhenOnline();
      }, 60000); // Sync every minute

    } catch (error) {
      console.error('Error initializing offline support:', error);
    }
  }
}

export default OfflineSyncService;
