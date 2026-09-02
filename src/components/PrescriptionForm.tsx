import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, Pill } from "lucide-react";

interface MedicineItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  isAyurvedic: boolean;
}

interface PrescriptionFormProps {
  doctorProfileId: Id<"doctors">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultMedicine: MedicineItem = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  isAyurvedic: false,
};

export default function PrescriptionForm({
  doctorProfileId,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const patients = useQuery(api.patients.list, {});
  const createPrescription = useMutation(api.prescriptions.create);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { ...defaultMedicine },
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addMedicine = () => {
    setMedicines([...medicines, { ...defaultMedicine }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (
    index: number,
    field: keyof MedicineItem,
    value: string | boolean,
  ) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }

    const validMedicines = medicines.filter((m) => m.medicineName.trim());
    if (validMedicines.length === 0) {
      setError("Please add at least one medicine.");
      return;
    }

    setSaving(true);
    try {
      await createPrescription({
        patientId: selectedPatientId as Id<"patients">,
        doctorId: doctorProfileId,
        notes: notes || undefined,
        items: validMedicines.map((m) => ({
          medicineName: m.medicineName.trim(),
          dosage: m.dosage.trim() || "As directed",
          frequency: m.frequency.trim() || "As directed",
          duration: m.duration.trim() || "As needed",
          instructions: m.instructions.trim() || undefined,
          isAyurvedic: m.isAyurvedic || undefined,
        })),
      });
      onSuccess?.();
    } catch {
      setError("Failed to create prescription. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (patients === undefined) {
    return (
      <div className="flex items-center gap-3 py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
        <span className="text-sm text-[#64748B]">Loading patients...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
            <Pill className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">
            New Prescription
          </h3>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Patient selector */}
      <div>
        <label className="block text-sm font-medium text-[#334155] mb-1.5">
          Select Patient *
        </label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors"
        >
          <option value="">— Choose a patient —</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.userName || "Unnamed Patient"}
            </option>
          ))}
        </select>
      </div>

      {/* Medicine items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#334155]">
            Medicines *
          </label>
          <button
            type="button"
            onClick={addMedicine}
            className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medicine
          </button>
        </div>

        {medicines.map((med, idx) => (
          <div
            key={idx}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">
                Medicine #{idx + 1}
              </span>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(idx)}
                  className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Input
              placeholder="Medicine name *"
              value={med.medicineName}
              onChange={(e) =>
                updateMedicine(idx, "medicineName", e.target.value)
              }
              className="bg-white border-[#E2E8F0] rounded-xl text-sm"
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Dosage (e.g. 500mg)"
                value={med.dosage}
                onChange={(e) =>
                  updateMedicine(idx, "dosage", e.target.value)
                }
                className="bg-white border-[#E2E8F0] rounded-xl text-sm"
              />
              <Input
                placeholder="Frequency (e.g. 2x/day)"
                value={med.frequency}
                onChange={(e) =>
                  updateMedicine(idx, "frequency", e.target.value)
                }
                className="bg-white border-[#E2E8F0] rounded-xl text-sm"
              />
              <Input
                placeholder="Duration (e.g. 7 days)"
                value={med.duration}
                onChange={(e) =>
                  updateMedicine(idx, "duration", e.target.value)
                }
                className="bg-white border-[#E2E8F0] rounded-xl text-sm"
              />
            </div>

            <Input
              placeholder="Special instructions (optional)"
              value={med.instructions}
              onChange={(e) =>
                updateMedicine(idx, "instructions", e.target.value)
              }
              className="bg-white border-[#E2E8F0] rounded-xl text-sm"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={med.isAyurvedic}
                onChange={(e) =>
                  updateMedicine(idx, "isAyurvedic", e.target.checked)
                }
                className="w-4 h-4 rounded border-[#E2E8F0] text-[#059669] focus:ring-[#059669]/20"
              />
              <span className="text-xs font-medium text-[#334155]">
                🌿 Ayurvedic Medicine
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#334155] mb-1.5">
          Prescription Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional instructions, diet advice, precautions..."
          rows={3}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-medium text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold py-2.5 shadow-sm transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            <>
              <Pill className="w-4 h-4 mr-2" /> Create Prescription
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl text-sm font-semibold border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
