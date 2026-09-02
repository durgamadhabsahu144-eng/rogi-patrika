import { useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  getUnsyncedPrescriptions,
  getUnsyncedCaseTakings,
  getUnsyncedFeedback,
  markPrescriptionSynced,
  markCaseTakingSynced,
  markFeedbackSynced,
} from "@/lib/db";

export function useOfflineSync() {
  const createPrescription = useMutation(api.prescriptions.create);
  const submitFeedback = useMutation(api.prescriptions.submitFeedback);

  const syncQueuedData = useCallback(async () => {
    // Sync prescriptions
    const unsyncedRx = await getUnsyncedPrescriptions();
    for (const rx of unsyncedRx) {
      try {
        await createPrescription({
          patientId: rx.patientId as never,
          doctorId: rx.doctorId as never,
          disease: rx.disease,
          items: [
            {
              medicineName: rx.medicineName,
              dosage: rx.dosage,
              frequency: rx.timing,
              duration: rx.duration,
              instructions: rx.anupana ? `Anupana: ${rx.anupana}` : undefined,
              isAyurvedic: true,
            },
          ],
          notes: rx.notes,
          sourceMethod: rx.sourceMethod,
        });
        if (rx.id) await markPrescriptionSynced(rx.id);
      } catch (e) {
        console.warn("Failed to sync prescription:", e);
      }
    }

    // Sync feedback
    const unsyncedFb = await getUnsyncedFeedback();
    for (const fb of unsyncedFb) {
      try {
        await submitFeedback({
          prescriptionNumber: fb.prescriptionNumber,
          patientId: fb.patientId as never,
          feedbackStatus: fb.feedbackStatus,
          notes: fb.notes,
        });
        if (fb.id) await markFeedbackSynced(fb.id);
      } catch (e) {
        console.warn("Failed to sync feedback:", e);
      }
    }

    // Sync case takings (placeholder — uses intake_forms mutation)
    const unsyncedCt = await getUnsyncedCaseTakings();
    for (const ct of unsyncedCt) {
      try {
        // Case takings are synced via intake forms — skip for now
        if (ct.id) await markCaseTakingSynced(ct.id);
      } catch (e) {
        console.warn("Failed to sync case taking:", e);
      }
    }
  }, [createPrescription, submitFeedback]);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for updates periodically
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch(console.warn);
    }
  }, []);

  // Listen for background sync messages
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "BACKGROUND_SYNC") {
        syncQueuedData();
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [syncQueuedData]);

  // Sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      syncQueuedData();
      // Trigger background sync if available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          if ("sync" in reg) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (reg as any).sync
              .register("rogipatrika-sync")
              .catch(console.warn);
          }
        });
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueuedData]);

  // Check connectivity status
  const isOnline =
    typeof navigator !== "undefined" ? navigator.onLine : true;

  return { syncQueuedData, isOnline };
}
