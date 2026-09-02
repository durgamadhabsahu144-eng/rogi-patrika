import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@//convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queuePrescription } from "@/lib/db";
import {
  Plus,
  X,
  Loader2,
  Pill,
  Mic,
  Upload,
  Type,
  Leaf,
  Search,
  Camera,
} from "lucide-react";

// ─── Ayurvedic Formulation Reference ───
const AYURVEDIC_FORMULATIONS = [
  { name: "Ashwagandha Churna", category: "Churna", defaultDosage: "500mg", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Triphala Churna", category: "Churna", defaultDosage: "3gm", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Brahmi Vati", category: "Vati", defaultDosage: "250mg", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Sitopaladi Churna", category: "Churna", defaultDosage: "250mg", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Guggulu Churna", category: "Churna", defaultDosage: "1gm", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Haridra Churna", category: "Churna", defaultDosage: "500mg", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Chyawanprash", category: "Avaleha", defaultDosage: "1 tsp", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Dashmool Kashayam", category: "Kashayam", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Amalaki Kashayam", category: "Kashayam", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Kumaryasava", category: "Arishta", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Drakshasava", category: "Arishta", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Jatamansi Churna", category: "Churna", defaultDosage: "250mg", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Brahmi Syrup", category: "Syrup", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Amla Juice", category: "Juice", defaultDosage: "15ml", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Shatavari Churna", category: "Churna", defaultDosage: "500mg", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Saraswatarishta", category: "Arishta", defaultDosage: "15ml", defaultFrequency: "Twice daily", isAyurvedic: true },
  { name: "Pippali Vati", category: "Vati", defaultDosage: "250mg", defaultFrequency: "Once daily", isAyurvedic: true },
  { name: "Talisadi Churna", category: "Churna", defaultDosage: "500mg", defaultFrequency: "Twice daily", isAyurvedic: true },
  // Common modern medicines
  { name: "Paracetamol", category: "Tablet", defaultDosage: "500mg", defaultFrequency: "Thrice daily", isAyurvedic: false },
  { name: "Metformin", category: "Tablet", defaultDosage: "500mg", defaultFrequency: "Twice daily", isAyurvedic: false },
  { name: "Amlodipine", category: "Tablet", defaultDosage: "5mg", defaultFrequency: "Once daily", isAyurvedic: false },
  { name: "Cetirizine", category: "Tablet", defaultDosage: "10mg", defaultFrequency: "Once daily", isAyurvedic: false },
  { name: "Omeprazole", category: "Capsule", defaultDosage: "20mg", defaultFrequency: "Once daily", isAyurvedic: false },
  { name: "Levothyroxine", category: "Tablet", defaultDosage: "50mcg", defaultFrequency: "Once daily", isAyurvedic: false },
];

interface MedicineItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string;
  anupana: string;
  duration: string;
  instructions: string;
  isAyurvedic: boolean;
}

interface PrescriptionFormProps {
  doctorProfileId: Id<"doctors">;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOffline?: boolean;
}

type EntryMethod = "structured" | "voice" | "upload";

const defaultMedicine: MedicineItem = {
  medicineName: "",
  dosage: "",
  frequency: "",
  timing: "",
  anupana: "",
  duration: "",
  instructions: "",
  isAyurvedic: false,
};

export default function PrescriptionForm({
  doctorProfileId,
  onSuccess,
  onCancel,
  isOffline = false,
}: PrescriptionFormProps) {
  const patients = useQuery(api.patients.list, {});
  const createPrescription = useMutation(api.prescriptions.create);

  const [entryMethod, setEntryMethod] = useState<EntryMethod>("structured");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [disease, setDisease] = useState("");
  const [medicines, setMedicines] = useState<MedicineItem[]>([{ ...defaultMedicine }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Search state for formulation autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState<number | null>(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [extracting, setExtracting] = useState(false);

  // Upload/OCR state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFormulations = AYURVEDIC_FORMULATIONS.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addMedicine = () => setMedicines([...medicines, { ...defaultMedicine }]);
  const removeMedicine = (index: number) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };
  const updateMedicine = (index: number, field: keyof MedicineItem, value: string | boolean) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  // ─── Voice Entry ───
  const startVoiceRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const text = event.results[0][0].transcript;
      setVoiceTranscript(text);
      setIsRecording(false);
      parseVoicePrescription(text);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    setIsRecording(true);
    recognition.start();
  }, []);

  const parseVoicePrescription = (text: string) => {
    setExtracting(true);
    // Simple AI-like parsing — extract medicine name and dosage from speech
    setTimeout(() => {
      const lines = text.split(/,|and|then|also/i).map((s) => s.trim()).filter(Boolean);
      const newMeds: MedicineItem[] = lines.map((line) => {
        const match = line.match(/^(.+?)\s+(\d+\s*(?:mg|gm|ml|mcg|tsp|tablet|capsule)[\w]*)\s*(.*)/i);
        return {
          medicineName: match?.[1]?.trim() || line,
          dosage: match?.[2]?.trim() || "As directed",
          frequency: "Twice daily",
          timing: "After food",
          anupana: "",
          duration: "7 days",
          instructions: match?.[3]?.trim() || "",
          isAyurvedic: /churna|vati|kashayam|arishta|lehya/i.test(line),
        };
      });
      setMedicines(newMeds.length > 0 ? newMeds : [{ ...defaultMedicine }]);
      setExtracting(false);
    }, 1000);
  };

  // ─── Upload/OCR Entry ───
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      // Simulate OCR processing
      setExtracting(true);
      setTimeout(() => {
        const simulatedOcr =
          "Ashwagandha Churna 500mg twice daily after food for 30 days, Brahmi Vati 250mg once daily morning for 30 days, Triphala Churna 3gm at bedtime with warm water";
        setOcrResult(simulatedOcr);
        parseVoicePrescription(simulatedOcr);
        setExtracting(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  // ─── Submit ───
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
      const payload = {
        patientId: selectedPatientId as Id<"patients">,
        doctorId: doctorProfileId,
        disease: disease || undefined,
        sourceMethod: entryMethod,
        notes: notes || undefined,
        items: validMedicines.map((m) => ({
          medicineName: m.medicineName.trim(),
          dosage: m.dosage.trim() || "As directed",
          frequency: m.frequency.trim() || "As directed",
          timing: m.timing || undefined,
          anupana: m.anupana || undefined,
          duration: m.duration.trim() || "As needed",
          instructions: m.instructions.trim() || undefined,
          isAyurvedic: m.isAyurvedic || undefined,
        })),
      };

      if (isOffline) {
        // Queue in IndexedDB for background sync
        await queuePrescription({
          patientId: selectedPatientId,
          doctorId: doctorProfileId,
          prescriptionNumber: `RX-OFFLINE-${Date.now()}`,
          version: 1,
          disease: disease || "",
          medicineName: validMedicines[0].medicineName,
          dosage: validMedicines[0].dosage,
          timing: validMedicines[0].timing || validMedicines[0].frequency,
          anupana: validMedicines[0].anupana,
          duration: validMedicines[0].duration,
          sourceMethod: entryMethod,
          notes: notes || "",
          status: "active",
          createdAt: Date.now(),
        });
      } else {
        await createPrescription(payload);
      }
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
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">New Prescription</h3>
            <p className="text-xs text-[#64748B]">Choose an entry method below</p>
          </div>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[#64748B] hover:text-[#0F172A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Patient + Disease */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">Select Patient *</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="">— Choose a patient —</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.userName || "Unnamed Patient"}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">Disease / Condition</label>
          <Input
            placeholder="e.g. Anxiety, Diabetes, Hypertension"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="bg-white border-[#E2E8F0] rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Entry Method Tabs */}
      <div className="flex gap-2 p-1 bg-[#F1F5F9] rounded-xl">
        {([
          { key: "structured" as EntryMethod, icon: Type, label: "Structured", desc: "Search & fill" },
          { key: "voice" as EntryMethod, icon: Mic, label: "Voice", desc: "Speak prescription" },
          { key: "upload" as EntryMethod, icon: Camera, label: "Upload", desc: "Photo/scan" },
        ]).map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => setEntryMethod(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              entryMethod === key
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            <Icon className="w-4 h-4" />
            <div className="text-left">
              <span className="block">{label}</span>
              <span className="block text-[10px] font-normal text-[#94A3B8]">{desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Voice Entry Panel */}
      {entryMethod === "voice" && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-[#059669]">🎤 Voice Entry — Speak the prescription</p>
          <Button
            type="button"
            onClick={startVoiceRecording}
            disabled={isRecording || extracting}
            className={`w-full rounded-xl font-semibold ${isRecording ? "bg-[#DC2626] text-white animate-pulse" : "bg-[#059669] text-white hover:bg-[#047857]"}`}
          >
            {isRecording ? "🔴 Listening... Speak now" : extracting ? "Extracting data..." : "🎤 Start Recording"}
          </Button>
          {voiceTranscript && (
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <p className="text-xs font-medium text-[#64748B] mb-1">Transcript:</p>
              <p className="text-sm text-[#0F172A]">{voiceTranscript}</p>
            </div>
          )}
        </div>
      )}

      {/* Upload/OCR Entry Panel */}
      {entryMethod === "upload" && (
        <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-[#C2410C]">📸 Upload Written Prescription — Scan & extract</p>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          <div className="flex gap-2">
            <Button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 bg-[#C2410C] text-white rounded-xl font-semibold hover:bg-[#9A3412]">
              <Camera className="w-4 h-4 mr-2" /> Take Photo / Choose File
            </Button>
            <input type="file" accept="image/*" className="hidden" id="upload-rx-desktop" onChange={handleImageUpload} />
            <label htmlFor="upload-rx-desktop" className="flex-1 flex items-center justify-center bg-white border border-[#FED7AA] rounded-xl text-sm font-semibold text-[#C2410C] cursor-pointer hover:bg-[#FFF7ED]">
              <Upload className="w-4 h-4 mr-2" /> Upload File
            </label>
          </div>
          {uploadedImage && (
            <img src={uploadedImage} alt="Uploaded prescription" className="w-full max-h-48 object-contain rounded-lg border border-[#E2E8F0]" />
          )}
          {ocrResult && (
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-3">
              <p className="text-xs font-medium text-[#64748B] mb-1">OCR Extracted:</p>
              <p className="text-sm text-[#0F172A]">{ocrResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Medicine Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#334155]">Medicines *</label>
          <button type="button" onClick={addMedicine} className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {medicines.map((med, idx) => (
          <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">#{idx + 1}</span>
              {medicines.length > 1 && (
                <button type="button" onClick={() => removeMedicine(idx)} className="text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Medicine name with autocomplete (structured mode) */}
            <div className="relative">
              <Input
                placeholder="Medicine name *"
                value={med.medicineName}
                onChange={(e) => {
                  updateMedicine(idx, "medicineName", e.target.value);
                  setSearchQuery(e.target.value);
                  setShowSearch(entryMethod === "structured" ? idx : null);
                }}
                onFocus={() => entryMethod === "structured" && setShowSearch(idx)}
                className="bg-white border-[#E2E8F0] rounded-xl text-sm"
              />
              {showSearch === idx && entryMethod === "structured" && searchQuery.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredFormulations.length === 0 ? (
                    <p className="p-3 text-xs text-[#94A3B8]">No matches — type custom name</p>
                  ) : (
                    filteredFormulations.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        className="w-full p-3 text-left hover:bg-[#F1F5F9] transition-colors border-b border-[#F1F5F9] last:border-0"
                        onClick={() => {
                          updateMedicine(idx, "medicineName", f.name);
                          updateMedicine(idx, "dosage", f.defaultDosage);
                          updateMedicine(idx, "frequency", f.defaultFrequency);
                          updateMedicine(idx, "isAyurvedic", f.isAyurvedic);
                          setShowSearch(null);
                          setSearchQuery("");
                        }}
                      >
                        <p className="text-sm font-medium text-[#0F172A]">{f.name}</p>
                        <p className="text-[10px] text-[#64748B]">
                          {f.category} • {f.defaultDosage} • {f.defaultFrequency}
                          {f.isAyurvedic && " • 🌿 Ayurvedic"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Dosage (500mg)" value={med.dosage} onChange={(e) => updateMedicine(idx, "dosage", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />
              <Input placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedicine(idx, "frequency", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />
              <Input placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(idx, "duration", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Timing (before/after food)" value={med.timing} onChange={(e) => updateMedicine(idx, "timing", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />
              <Input placeholder="Anupana (honey, warm water...)" value={med.anupana} onChange={(e) => updateMedicine(idx, "anupana", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />
            </div>

            <Input placeholder="Special instructions (optional)" value={med.instructions} onChange={(e) => updateMedicine(idx, "instructions", e.target.value)} className="bg-white border-[#E2E8F0] rounded-xl text-sm" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={med.isAyurvedic} onChange={(e) => updateMedicine(idx, "isAyurvedic", e.target.checked)} className="w-4 h-4 rounded border-[#E2E8F0] text-[#059669]" />
              <span className="text-xs font-medium text-[#334155]">🌿 Ayurvedic Medicine</span>
            </label>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#334155] mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Diet advice, precautions, follow-up instructions..."
          rows={3}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={saving} className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold py-2.5 shadow-sm transition-colors">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
          ) : (
            <><Pill className="w-4 h-4 mr-2" /> Create Prescription</>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl text-sm font-semibold border-[#E2E8F0] text-[#64748B]">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
