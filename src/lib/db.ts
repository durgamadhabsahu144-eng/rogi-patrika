import Dexie, { type EntityTable } from 'dexie';

// --- Types -----------------------------------------------------------------

export interface OfflineCaseTaking {
  id?: number;
  patientId: string;
  doctorId: string;
  data: Record<string, unknown>; // full case-taking form payload
  createdAt: string;
  synced: number; // 0 = pending, 1 = synced — number, not boolean, for reliable IndexedDB indexing across browsers
}

export interface OfflinePrescription {
  id?: number;
  patientId: string;
  doctorId: string;
  data: Record<string, unknown>; // full prescription payload
  createdAt: string;
  synced: number; // 0 = pending, 1 = synced
}

export interface CachedPatient {
  id: string; // server-assigned patient id, primary key
  name: string;
  data: Record<string, unknown>;
  cachedAt: string;
}

// --- Database ----------------------------------------------------------------

const db = new Dexie('RogiPatrikaOfflineDB') as Dexie & {
  caseTakings: EntityTable<OfflineCaseTaking, 'id'>;
  prescriptions: EntityTable<OfflinePrescription, 'id'>;
  patients: EntityTable<CachedPatient, 'id'>;
};

db.version(1).stores({
  caseTakings: '++id, patientId, doctorId, synced, createdAt',
  prescriptions: '++id, patientId, doctorId, synced, createdAt',
  patients: 'id, name, cachedAt',
});

// --- Queue functions ---------------------------------------------------------
// Return Promise<void>: EntityTable.add() resolves to the new numeric key,
// which we don't need the caller to see, so we await it and return nothing.

export async function queueCaseTaking(
  ct: Omit<OfflineCaseTaking, 'id' | 'synced'>
): Promise<void> {
  await db.caseTakings.add({ ...ct, synced: 0 });
}

export async function queuePrescription(
  rx: Omit<OfflinePrescription, 'id' | 'synced'>
): Promise<void> {
  await db.prescriptions.add({ ...rx, synced: 0 });
}

export async function getUnsyncedCaseTakings() {
  return db.caseTakings.where('synced').equals(0).toArray();
}

export async function getUnsyncedPrescriptions() {
  return db.prescriptions.where('synced').equals(0).toArray();
}

export async function markCaseTakingSynced(id: number): Promise<void> {
  await db.caseTakings.update(id, { synced: 1 });
}

export async function markPrescriptionSynced(id: number): Promise<void> {
  await db.prescriptions.update(id, { synced: 1 });
}

// --- Patient cache (for offline dashboard restriction) -----------------------

export async function cachePatient(patient: CachedPatient): Promise<void> {
  await db.patients.put(patient);
}

export async function cachePatients(patients: CachedPatient[]): Promise<void> {
  await db.patients.bulkPut(patients);
}

export async function getCachedPatients(): Promise<CachedPatient[]> {
  return db.patients.toArray();
}

export default db;
