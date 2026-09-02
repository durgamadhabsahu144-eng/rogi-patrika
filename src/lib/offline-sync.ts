import {
  queueCaseTaking,
  queuePrescription,
  getUnsyncedCaseTakings,
  getUnsyncedPrescriptions,
  markCaseTakingSynced,
  markPrescriptionSynced,
} from './db';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const SYNC_TAG = 'sync-offline-queue';

function authHeaders() {
  const token = localStorage.getItem('token'); // match whatever key you already use for the JWT
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- Flush the queue to the Express API --------------------------------------

export async function syncOfflineQueue(): Promise<void> {
  const pendingCT = await getUnsyncedCaseTakings();
  for (const ct of pendingCT) {
    try {
      const res = await fetch(`${API_BASE}/case-takings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(ct.data),
      });
      if (res.ok) await markCaseTakingSynced(ct.id!);
      else break; // server rejected it (e.g. auth expired) — stop and retry later
    } catch {
      break; // still offline
    }
  }

  const pendingRx = await getUnsyncedPrescriptions();
  for (const rx of pendingRx) {
    try {
      const res = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rx.data),
      });
      if (res.ok) await markPrescriptionSynced(rx.id!);
      else break;
    } catch {
      break;
    }
  }
}

// Background Sync isn't supported in Safari/Firefox, so 'online' is the
// reliable fallback trigger; Background Sync (via the service worker) is the
// bonus that can fire even if the tab reconnects in the background.
window.addEventListener('online', () => {
  syncOfflineQueue();
});

// The service worker can't easily reach into Dexie's IndexedDB tables on its
// own (that needs a UMD Dexie build imported via importScripts), so instead
// its 'sync' event just posts a message to open tabs, which run the flush
// above using the app's normal Dexie import. Simpler and more reliable for
// this scope than duplicating Dexie inside the worker.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_OFFLINE_QUEUE') {
      syncOfflineQueue();
    }
  });
}

async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    // @ts-expect-error — SyncManager isn't in the default lib.dom.d.ts yet
    await reg.sync.register(SYNC_TAG);
  }
}

// --- Submit helpers: try the network first, fall back to the offline queue --

export async function submitCaseTaking(payload: {
  patientId: string;
  doctorId: string;
  [key: string]: unknown;
}): Promise<{ offline: boolean }> {
  if (navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE}/case-takings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return { offline: false };
    } catch {
      // fall through to offline queue
    }
  }

  await queueCaseTaking({
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    data: payload,
    createdAt: new Date().toISOString(),
  });
  await registerBackgroundSync();
  return { offline: true };
}

export async function submitPrescription(payload: {
  patientId: string;
  doctorId: string;
  [key: string]: unknown;
}): Promise<{ offline: boolean }> {
  if (navigator.onLine) {
    try {
      const res = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return { offline: false };
    } catch {
      // fall through to offline queue
    }
  }

  await queuePrescription({
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    data: payload,
    createdAt: new Date().toISOString(),
  });
  await registerBackgroundSync();
  return { offline: true };
}
