import Dexie, { type EntityTable } from "dexie";

// ─── Types for offline-cached data ───

export interface OfflinePrescription {
  id?: number;
  patientId: string;
  doctorId: string;
  prescriptionNumber: string;
  version: number;
  disease: string;
  medicineName: string;
  dosage: string;
  timing: string;
  anupana: string;
  duration: string;
  sourceMethod: "structured" | "voice" | "upload";
  notes: string;
  status: "active" | "superseded" | "discontinued";
  synced: boolean;
  createdAt: number;
}

export interface OfflineCaseTaking {
  id?: number;
  patientId: string;
  doctorId: string;
  formData: Record<string, unknown>;
  synced: boolean;
  createdAt: number;
}

export interface OfflinePrescriptionFeedback {
  id?: number;
  prescriptionNumber: string;
  patientId: string;
  feedbackStatus: "working" | "not_working" | "partial" | "side_effects";
  notes: string;
  reviewedByDoctor: boolean;
  synced: boolean;
  submittedAt: number;
}

// ─── Dexie Database ───

const db = new Dexie("RogiPatrikaOffline") as Dexie & {
  prescriptions: EntityTable<OfflinePrescription, "id">;
  caseTakings: EntityTable<OfflineCaseTaking, "id">;
  prescriptionFeedback: EntityTable<OfflinePrescriptionFeedback, "id">;
};

db.version(1).stores({
  prescriptions:
    "++id, patientId, doctorId, prescriptionNumber, status, synced, createdAt",
  caseTakings: "++id, patientId, doctorId, synced, createdAt",
  prescriptionFeedback:
    "++id, prescriptionNumber, patientId, reviewedByDoctor, synced, submittedAt",
});

export default db;

// ─── Helpers ───

export async function queuePrescription(
  rx: Omit<OfflinePrescription, "id" | "synced">,
): Promise<void> {
  await db.prescriptions.add({ ...rx, synced: false });
}

export async function queueCaseTaking(
  ct: Omit<OfflineCaseTaking, "id" | "synced">,
): Promise<void> {
  await db.caseTakings.add({ ...ct, synced: false });
}

export async function queuePrescriptionFeedback(
  fb: Omit<OfflinePrescriptionFeedback, "id" | "synced">,
): Promise<void> {
  await db.prescriptionFeedback.add({ ...fb, synced: false });
}

export async function getUnsyncedPrescriptions(): Promise<OfflinePrescription[]> {
  return db.prescriptions.where("synced").equals(0).toArray();
}

export async function getUnsyncedCaseTakings(): Promise<OfflineCaseTaking[]> {
  return db.caseTakings.where("synced").equals(0).toArray();
}

export async function getUnsyncedFeedback(): Promise<OfflinePrescriptionFeedback[]> {
  return db.prescriptionFeedback.where("synced").equals(0).toArray();
}

export async function markPrescriptionSynced(id: number | undefined): Promise<void> {
  if (id !== undefined) await db.prescriptions.update(id, { synced: true });
}

export async function markCaseTakingSynced(id: number | undefined): Promise<void> {
  if (id !== undefined) await db.caseTakings.update(id, { synced: true });
}

export async function markFeedbackSynced(id: number | undefined): Promise<void> {
  if (id !== undefined) await db.prescriptionFeedback.update(id, { synced: true });
}

export async function getCachedPrescriptions(
  patientId?: string,
): Promise<OfflinePrescription[]> {
  if (patientId) {
    return db.prescriptions.where("patientId").equals(patientId).toArray();
  }
  return db.prescriptions.toArray();
}

export async function getCachedPatients(): Promise<string[]> {
  const rx = await db.prescriptions.toArray();
  return [...new Set(rx.map((r) => r.patientId))];
}
