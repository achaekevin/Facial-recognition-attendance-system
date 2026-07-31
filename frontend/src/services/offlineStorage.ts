/**
 * IndexedDB Offline Engine for caching attendance check-ins and camera telemetry
 * during network outages, auto-syncing when internet connectivity resumes.
 */

export interface OfflineAttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  location: string;
  imageData: string;
  synced: boolean;
}

const DB_NAME = 'BioAuth_OfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_attendance';

class OfflineStorageEngine {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB initialization failed. Using in-memory fallback.');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveOfflineRecord(record: Omit<OfflineAttendanceRecord, 'id' | 'synced'>): Promise<OfflineAttendanceRecord> {
    await this.init();
    const fullRecord: OfflineAttendanceRecord = {
      ...record,
      id: `off-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      synced: false,
    };

    if (this.db) {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(fullRecord);
    } else {
      const existing = JSON.parse(localStorage.getItem(STORE_NAME) || '[]');
      existing.push(fullRecord);
      localStorage.setItem(STORE_NAME, JSON.stringify(existing));
    }

    return fullRecord;
  }

  async getPendingRecords(): Promise<OfflineAttendanceRecord[]> {
    await this.init();

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const records: OfflineAttendanceRecord[] = request.result || [];
          resolve(records.filter((r) => !r.synced));
        };

        request.onerror = () => resolve([]);
      });
    }

    const existing: OfflineAttendanceRecord[] = JSON.parse(localStorage.getItem(STORE_NAME) || '[]');
    return existing.filter((r) => !r.synced);
  }

  async syncPendingQueue(): Promise<{ syncedCount: number; errors: number }> {
    const pending = await this.getPendingRecords();
    let syncedCount = 0;
    let errors = 0;

    for (const item of pending) {
      try {
        await fetch('/api/v1/attendance/manual-override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: item.userId,
            user_name: item.userName,
            date: item.timestamp.split('T')[0],
            clock_in: item.timestamp.split('T')[1]?.substring(0, 8) || '08:00:00',
            status: 'present',
            location: `${item.location} (Offline Sync)`,
            notes: 'Synchronized from Edge Terminal Offline Queue'
          })
        });

        item.synced = true;
        syncedCount++;
      } catch (e) {
        errors++;
      }
    }

    // Clear synced records
    if (this.db) {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
    } else {
      localStorage.removeItem(STORE_NAME);
    }

    return { syncedCount, errors };
  }
}

export const offlineStorage = new OfflineStorageEngine();
