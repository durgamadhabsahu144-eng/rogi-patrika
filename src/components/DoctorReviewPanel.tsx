import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  ThumbsDown,
  Minus,
  CheckCircle,
  Loader2,
  Pill,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

interface FeedbackItem {
  _id: Id<"prescription_feedback">;
  prescriptionNumber: string;
  patientName?: string;
  feedbackStatus: "working" | "not_working" | "partial" | "side_effects";
  notes?: string;
  submittedAt: number;
  prescription?: {
    _id: Id<"prescriptions">;
    disease?: string;
    prescriptionNumber: string;
    version: number;
    doctorId: Id<"doctors">;
  };
  prescriptionItems?: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing?: string;
    anupana?: string;
    duration: string;
    instructions?: string;
    isAyurvedic?: boolean;
  }>;
}

interface DoctorReviewPanelProps {
  feedbackItems: FeedbackItem[];
  doctorProfileId: Id<"doctors">;
}

export default function DoctorReviewPanel({
  feedbackItems,
  doctorProfileId,
}: DoctorReviewPanelProps) {
  const reviewFeedback = useMutation(api.prescriptions.reviewFeedback);
  const revisePrescription = useMutation(api.prescriptions.revise);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [showRevision, setShowRevision] = useState<string | null>(null);

  // Revision form state
  const [revDisease, setRevDisease] = useState("");
  const [revNotes, setRevNotes] = useState("");
  const [revMeds, setRevMeds] = useState<
    Array<{ medicineName: string; dosage: string; frequency: string; timing: string; anupana: string; duration: string; instructions: string; isAyurvedic: boolean }>
  >([]);
  const [savingRevision, setSavingRevision] = useState(false);

  const statusIcon = (status: string) => {
    switch (status) {
      case "not_working":
        return <ThumbsDown className="w-4 h-4 text-[#DC2626]" />;
      case "partial":
        return <Minus className="w-4 h-4 text-[#D97706]" />;
      case "side_effects":
        return <AlertTriangle className="w-4 h-4 text-[#DC2626]" />;
      default:
        return <CheckCircle className="w-4 h-4 text-[#059669]" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "not_working":
        return "Not Working";
      case "partial":
        return "Partially Working";
      case "side_effects":
        return "Side Effects";
      default:
        return "Working Well";
    }
  };

  const handleMarkReviewed = async (feedbackId: Id<"prescription_feedback">) => {
    setReviewing(feedbackId as string);
    try {
      await reviewFeedback({ feedbackId });
    } catch {
      // Error handled silently
    } finally {
      setReviewing(null);
    }
  };

  const handleStartRevision = (item: FeedbackItem) => {
    setShowRevision(item._id as string);
    setRevDisease(item.prescription?.disease || "");
    setRevMeds(
      (item.prescriptionItems || []).map((m) => ({
        medicineName: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        timing: m.timing || "",
        anupana: m.anupana || "",
        duration: m.duration,
        instructions: m.instructions || "",
        isAyurvedic: m.isAyurvedic || false,
      })),
    );
  };

  const handleSubmitRevision = async (item: FeedbackItem) => {
    if (!item.prescription) return;
    setSavingRevision(true);
    try {
      await revisePrescription({
        prescriptionNumber: item.prescriptionNumber,
        doctorId: doctorProfileId,
        disease: revDisease || undefined,
        notes: revNotes || undefined,
        sourceMethod: "structured",
        items: revMeds.map((m) => ({
          ...m,
          timing: m.timing || undefined,
          anupana: m.anupana || undefined,
          instructions: m.instructions || undefined,
          isAyurvedic: m.isAyurvedic || undefined,
        })),
      });
      // Also mark the feedback as reviewed
      await reviewFeedback({ feedbackId: item._id });
      setShowRevision(null);
    } catch {
      // Error handled silently
    } finally {
      setSavingRevision(false);
    }
  };

  if (feedbackItems.length === 0) {
    return (
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 text-center">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-[#059669]" />
        <p className="text-sm font-semibold text-[#059669]">All clear!</p>
        <p className="text-xs text-[#64748B] mt-1">No patient feedback needs review</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
        <p className="text-sm font-semibold text-[#0F172A]">
          {feedbackItems.length} Prescription{feedbackItems.length !== 1 ? "s" : ""} Need Review
        </p>
      </div>

      {feedbackItems.map((item) => {
        const isExpanded = expandedId === (item._id as string);
        const isRevisioning = showRevision === (item._id as string);

        return (
          <div key={item._id as string} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
            {/* Header */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : (item._id as string))}
              className="w-full p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {statusIcon(item.feedbackStatus)}
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {item.patientName || "Patient"} — {item.prescriptionNumber}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {statusLabel(item.feedbackStatus)} • {new Date(item.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-4 border-t border-[#F1F5F9] space-y-3">
                {/* Current Prescription */}
                {item.prescription && (
                  <div className="bg-[#F8FAFC] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#64748B] mb-2">
                      Current Rx (v{item.prescription.version}) — {item.prescription.disease || "No condition specified"}
                    </p>
                    {item.prescriptionItems?.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 text-sm">
                        <Pill className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                        <span className="text-[#0F172A] font-medium">{m.medicineName}</span>
                        <span className="text-[#64748B] text-xs">
                          {m.dosage} • {m.frequency} • {m.duration}
                        </span>
                        {m.isAyurvedic && <span className="text-[10px] bg-[#D1FAE5] text-[#059669] px-1.5 py-0.5 rounded">🌿</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Patient Notes */}
                {item.notes && (
                  <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#92400E] mb-1">Patient Notes:</p>
                    <p className="text-sm text-[#334155]">{item.notes}</p>
                  </div>
                )}

                {/* Revision Form */}
                {isRevisioning && (
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-[#2563EB]">✏️ Revise Prescription — New Version</p>

                    <Input
                      placeholder="Disease / condition"
                      value={revDisease}
                      onChange={(e) => setRevDisease(e.target.value)}
                      className="bg-white border-[#E2E8F0] rounded-xl text-sm"
                    />

                    {revMeds.map((med, idx) => (
                      <div key={idx} className="bg-white border border-[#E2E8F0] rounded-lg p-3 space-y-2">
                        <p className="text-xs font-medium text-[#64748B]">Medicine #{idx + 1}</p>
                        <Input
                          value={med.medicineName}
                          onChange={(e) => {
                            const updated = [...revMeds];
                            updated[idx].medicineName = e.target.value;
                            setRevMeds(updated);
                          }}
                          className="text-sm"
                          placeholder="Medicine name"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...revMeds];
                              updated[idx].dosage = e.target.value;
                              setRevMeds(updated);
                            }}
                            className="text-sm"
                            placeholder="Dosage"
                          />
                          <Input
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...revMeds];
                              updated[idx].frequency = e.target.value;
                              setRevMeds(updated);
                            }}
                            className="text-sm"
                            placeholder="Frequency"
                          />
                          <Input
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...revMeds];
                              updated[idx].duration = e.target.value;
                              setRevMeds(updated);
                            }}
                            className="text-sm"
                            placeholder="Duration"
                          />
                        </div>
                      </div>
                    ))}

                    <textarea
                      value={revNotes}
                      onChange={(e) => setRevNotes(e.target.value)}
                      placeholder="Revision notes (what changed and why)..."
                      rows={2}
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm resize-none"
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleSubmitRevision(item)}
                        disabled={savingRevision}
                        className="flex-1 bg-[#2563EB] text-white rounded-xl text-sm font-semibold py-2"
                      >
                        {savingRevision ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Save Revision
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowRevision(null)} className="rounded-xl text-sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => handleMarkReviewed(item._id)}
                    disabled={reviewing === (item._id as string)}
                    variant="outline"
                    className="rounded-xl text-xs font-semibold border-[#E2E8F0]"
                  >
                    {reviewing === (item._id as string) ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                    Mark Reviewed
                  </Button>
                  {!isRevisioning && (
                    <Button
                      type="button"
                      onClick={() => handleStartRevision(item)}
                      className="rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Revise Dosage
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
