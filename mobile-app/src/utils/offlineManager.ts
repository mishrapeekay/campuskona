import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { EventEmitter } from 'events';
import { storageService } from '@/services/storage.service';
import { apiClient } from '@/services/api/client';

export interface OfflineAction {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

class OfflineManager extends EventEmitter {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  private constructor() {
    super();
    this.initialize();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initialize(): Promise<void> {
    // Setup network listener
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      this.emit('connectionChange', this.isOnline);

      // If we just came online, sync the queue
      if (!wasOnline && this.isOnline) {
        console.log('🌐 App back online, triggering sync...');
        this.syncOfflineQueue();
      }
    });

    // Check initial network status
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    if (this.isOnline) {
      this.syncOfflineQueue();
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await storageService.addToSyncQueue(offlineAction);
    const queue = await storageService.getSyncQueue();
    this.emit('queueUpdated', queue.length);
  }

  public async syncOfflineQueue(): Promise<void> {
    const queue = await storageService.getSyncQueue();

    if (!this.isOnline || this.syncInProgress || queue.length === 0) {
      return;
    }

    console.log(`🔄 Starting sync for ${queue.length} items...`);
    this.syncInProgress = true;
    this.emit('syncStarted');

    const remainingActions: OfflineAction[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const action of queue) {
      try {
        await apiClient.request({
          method: action.method,
          url: action.endpoint,
          data: action.data,
        });

        console.log(`✅ Synced action: ${action.method} ${action.endpoint}`);
        this.emit('actionSynced', action);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Sync failed for ${action.endpoint}:`, error);

        // Conflict resolution: If 409 or 400 with specific message, we might need to handle it
        // For now, retry up to 3 times unless it's a permanent failure
        const status = error?.status;
        const isPermanentError = status === 400 || status === 401 || status === 403 || status === 404;

        if (!isPermanentError && action.retryCount < 3) {
          action.retryCount++;
          remainingActions.push(action);
        } else {
          console.warn(`🗑️ Removing permanently failed action: ${action.endpoint} (Status: ${status})`);
          this.emit('actionFailed', { action, error });
          failedCount++;
        }
      }
    }

    // Update queue with remaining items
    storageService.set('sync_queue', remainingActions);

    this.syncInProgress = false;
    this.emit('queueUpdated', remainingActions.length);
    this.emit('syncCompleted', {
      success: true,
      successCount,
      failedCount,
      remaining: remainingActions.length,
    });

    console.log(`🏁 Sync completed. Success: ${successCount}, Failed: ${failedCount}, Remaining: ${remainingActions.length}`);
  }

  public async cacheData(key: string, data: any, expiresInMs?: number): Promise<void> {
    await storageService.setWithExpiry(`offline_cache_${key}`, data, expiresInMs);
  }

  public async getCachedData(key: string): Promise<any | null> {
    return await storageService.getWithExpiry(`offline_cache_${key}`);
  }

  public async clearCache(): Promise<void> {
    storageService.clearCache();
  }

  public async clearQueue(): Promise<void> {
    storageService.clearSyncQueue();
    this.emit('queueUpdated', 0);
  }

  public getQueueLength(): number {
    // Note: This is synchronous in current storageService implementation for get(), 
    // but the actual MMKV is synchronous anyway.
    const queue = storageService.get<OfflineAction[]>('sync_queue') || [];
    return queue.length;
  }

  public getQueueItems(): OfflineAction[] {
    return storageService.get<OfflineAction[]>('sync_queue') || [];
  }

  public async removeFromQueue(actionId: string): Promise<void> {
    const queue = await storageService.getSyncQueue();
    const updatedQueue = queue.filter((action: OfflineAction) => action.id !== actionId);
    storageService.set('sync_queue', updatedQueue);
    this.emit('queueUpdated', updatedQueue.length);
  }

  // Helper method to check if we should use cached data
  public async shouldUseCachedData(cacheKey: string): Promise<boolean> {
    if (this.isOnline) {
      return false;
    }

    const data = await this.getCachedData(cacheKey);
    return data !== null;
  }
}

export default OfflineManager.getInstance();
