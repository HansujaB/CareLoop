/**
 * Local AsyncStorage cache for caregiver data that doesn't change unless
 * the parent adds a memory.
 *
 * Strategy:
 *  - Each entry is stored with a `fetchedAt` timestamp.
 *  - TTL is 4 hours. Within TTL: serve from AsyncStorage, no network call.
 *  - After TTL (or on end-shift / revoked-token): clear cache and re-fetch.
 *  - The backend uses its own memory_version–based cache, so even a cache miss
 *    here is usually instant (no Groq call) unless the parent has added new
 *    memories since the last generation.
 *  - When the parent calls remember(), the backend bumps memory_version which
 *    invalidates its server-side cache. The next fetch from any caregiver will
 *    trigger a fresh Groq generation and the frontend cache will be updated.
 *
 * Keys are scoped to the caregiver token so different caregivers on the
 * same device don't share stale data.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours — backend handles version-based regeneration,
// so client cache just avoids redundant network round-trips.
// Cache is cleared on end-shift and on revoked-token errors.

type CacheEntry<T> = {
  data: T;
  fetchedAt: number; // Date.now()
};

function handoverKey(token: string) {
  return `cl_handover_${token}`;
}
function emergencyKey(token: string) {
  return `cl_emergency_${token}`;
}

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > TTL_MS) return null; // stale
    return entry.data;
  } catch {
    return null;
  }
}

async function write<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // non-fatal — worst case we fetch again next time
  }
}

async function invalidate(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const caregiverCache = {
  /**
   * Return cached handover summary for this token, or null if stale/missing.
   * Caller should fetch from network on null and then call `saveHandover`.
   */
  getHandover: (token: string) => read<string>(handoverKey(token)),

  saveHandover: (token: string, summary: string) =>
    write(handoverKey(token), summary),

  /**
   * Return cached emergency card for this token, or null if stale/missing.
   * Caller should fetch from network on null and then call `saveEmergency`.
   */
  getEmergency: (token: string) => read<string>(emergencyKey(token)),

  saveEmergency: (token: string, content: string) =>
    write(emergencyKey(token), content),

  /**
   * Called when the caregiver ends their shift or a revoked-token error fires.
   * Clears all cached data for this token.
   */
  clear: async (token: string) => {
    await Promise.all([
      invalidate(handoverKey(token)),
      invalidate(emergencyKey(token)),
    ]);
  },
};
