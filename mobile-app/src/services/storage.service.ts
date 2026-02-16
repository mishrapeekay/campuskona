import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS, CACHE_DURATION } from '@/constants';

// Initialize MMKV for high-performance storage
const storage = new MMKV();

class StorageService {
  /**
   * Store data with expiration
   */
  async setWithExpiry(key: string, value: any, ttl: number = CACHE_DURATION.MEDIUM): Promise<void> {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    storage.set(key, JSON.stringify(item));
  }

  /**
   * Get data with expiration check
   */
  async getWithExpiry<T = any>(key: string): Promise<T | null> {
    const itemStr = storage.getString(key);
    if (!itemStr) {
      return null;
    }

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        storage.delete(key);
        return null;
      }
      return item.value as T;
    } catch (error) {
      console.error('Error parsing cached data:', error);
      storage.delete(key);
      return null;
    }
  }

  /**
   * Cache API response
   */
  async cacheResponse(endpoint: string, data: any, ttl?: number): Promise<void> {
    const key = `${STORAGE_KEYS.CACHED_DATA}${endpoint}`;
    await this.setWithExpiry(key, data, ttl);
  }

  /**
   * Get cached response
   */
  async getCachedResponse<T = any>(endpoint: string): Promise<T | null> {
    const key = `${STORAGE_KEYS.CACHED_DATA}${endpoint}`;
    return await this.getWithExpiry<T>(key);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    const keys = storage.getAllKeys();
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEYS.CACHED_DATA)) {
        storage.delete(key);
      }
    });
  }

  /**
   * Store sync queue for offline operations
   */
  async addToSyncQueue(operation: {
    endpoint: string;
    method: string;
    data?: any;
    timestamp: number;
    id?: string;
  }): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(operation);
    storage.set('sync_queue', JSON.stringify(queue));
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<any[]> {
    const queueStr = storage.getString('sync_queue');
    return queueStr ? JSON.parse(queueStr) : [];
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    storage.delete('sync_queue');
  }

  /**
   * Remove specific item from sync queue
   */
  async removeFromSyncQueue(index: number): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.splice(index, 1);
    storage.set('sync_queue', JSON.stringify(queue));
  }

  /**
   * Simple set (no expiration)
   */
  set(key: string, value: any): void {
    storage.set(key, JSON.stringify(value));
  }

  /**
   * Simple get
   */
  get<T = any>(key: string): T | null {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete a key
   */
  delete(key: string): void {
    storage.delete(key);
  }

  /**
   * Clear all storage
   */
  clearAll(): void {
    storage.clearAll();
  }
}

export const storageService = new StorageService();
export default storageService;
