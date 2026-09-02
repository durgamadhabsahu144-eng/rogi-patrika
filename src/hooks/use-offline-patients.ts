import { useEffect, useState } from 'react';
import { cachePatients, getCachedPatients, type CachedPatient } from '../lib/db';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface UseOfflinePatientsResult {
  patients: CachedPatient[];
  isOnline: boolean;
  loading: boolean;
}

/**
 * While online: fetches the full patient list from the server (which does
 * the real role-based permission check) and refreshes the local cache.
 * While offline: serves only what's already cached locally, since role
 * checks can't be verified against the server. Doctor dashboard should show
 * an "Offline — limited to cached patients" banner whenever isOnline is false.
 */
export function useOfflinePatients(token: string | null): UseOfflinePatientsResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [patients, setPatients] = useState<CachedPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (isOnline && token) {
        try {
          const res = await fetch(`${API_BASE}/patients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data: CachedPatient[] = await res.json();
            if (!cancelled) setPatients(data);
            await cachePatients(data.map((p) => ({ ...p, cachedAt: new Date().toISOString() })));
            setLoading(false);
            return;
          }
        } catch {
          // fall through to cache
        }
      }
      const cached = await getCachedPatients();
      if (!cancelled) setPatients(cached);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOnline, token]);

  return { patients, isOnline, loading };
}
