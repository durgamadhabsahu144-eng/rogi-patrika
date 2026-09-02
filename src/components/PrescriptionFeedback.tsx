import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus, AlertTriangle, CheckCircle, Loader2, MessageCircle } from "lucide-react";

interface PrescriptionFeedbackProps {
  prescriptionNumber: string;
  patientId: Id<"patients">;
  eligibleAfter?: number;
  alreadyFeedback?: boolean;
}

const feedbackOptions = [
  { key: "working" as const, label: "Working well", icon: ThumbsUp, color: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0] hover:border-[#059669]" },
  { key: "partial" as const, label: "Partially working", icon: Minus, color: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] hover:border-[#D97706]" },
  { key: "not_working" as const, label: "Not working", icon: ThumbsDown, color: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] hover:border-[#DC2626]" },
  { key: "side_effects" as const, label: "Side effects", icon: AlertTriangle, color: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] hover:border-[#DC2626]" },
];

export default function PrescriptionFeedback({
  prescriptionNumber,
  patientId,
  eligibleAfter,
  alreadyFeedback = false,
}: PrescriptionFeedbackProps) {
  const submitFeedback = useMutation(api.prescriptions.submitFeedback);

  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(alreadyFeedback);
  const [saving, setSaving] = useState(false);

  // Check if feedback is eligible
  const now = Date.now();
  const isEligible = !eligibleAfter || now >= eligibleAfter || alreadyFeedback;

  if (submitted || alreadyFeedback) {
    return (
      <div className="bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl p-3 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-[#059669]" />
        <p className="text-xs font-medium text-[#059669]">Thank you! Your feedback has been submitted.</p>
      </div>
    );
  }

  if (!isEligible) {
    const daysLeft = Math.ceil((eligibleAfter! - now) / 86400000);
    return (
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-[#94A3B8]" />
        <p className="text-xs text-[#64748B]">
          Feedback will be available after ~{daysLeft} day{daysLeft !== 1 ? "s" : ""} of taking this medicine.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await submitFeedback({
        prescriptionNumber,
        patientId,
        feedbackStatus: selected as "working" | "not_working" | "partial" | "side_effects",
        notes: notes || undefined,
      });
      setSubmitted(true);
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-[#92400E]">How is this medicine working?</p>

      <div className="grid grid-cols-2 gap-2">
        {feedbackOptions.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${color} ${
              selected === key ? "ring-2 ring-current shadow-sm" : ""
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {selected && selected !== "working" && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Please describe the issue (optional but helpful)..."
          rows={2}
          className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-none resize-none"
        />
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || saving}
        className="w-full bg-[#2563EB] text-white rounded-xl text-sm font-semibold py-2 hover:bg-[#1D4ED8]"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Submit Feedback
      </Button>
    </div>
  );
}
