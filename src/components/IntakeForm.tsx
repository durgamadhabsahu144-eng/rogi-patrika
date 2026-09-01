import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "./_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

/* ──────────────────────────────────────────────
   SIH PS 26047 — Ayurvedic Intake Assessment
   Ashtavidha Pariksha + Dashavidha Pariksha
   + Prakriti-Vikriti Scoring + Dinacharya
   ────────────────────────────────────────────── */

// Ashtavidha Pariksha (8-fold examination)
const ashtavidhaFields = [
  { key: "prakriti", label: "Prakriti (Constitution)", options: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"] },
  { key: "vikriti", label: "Vikriti (Current Imbalance)", options: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"] },
  { key: "sara", label: "Sara (Structural Excellence)", options: ["Excellent", "Good", "Average", "Poor"] },
  { key: "samhanana", label: "Samhanana (Compactness)", options: ["Compact", "Moderate", "Loose"] },
  { key: "pramana", label: "Pramana (Body Measure)", options: ["Small (Laghu)", "Medium (Madhyama)", "Large (Brihat)"] },
  { key: "satmya", label: "Satmya (Adaptability)", options: ["High (Sama)", "Moderate (Sadharana)", "Low (Apatavya)"] },
  { key: "sattva", label: "Sattva (Mental Strength)", options: ["Strong (Pravara)", "Moderate (Madhyama)", "Weak (Avara)"] },
  { key: "viharas", label: "Viharas (Activity Tolerance)", options: ["High", "Moderate", "Low"] },
  { key: "aharaShakti", label: "Ahara Shakti (Digestive Capacity)", options: ["Strong (Pravara)", "Moderate (Madhyama)", "Weak (Avara)"] },
];

// Dashavidha Pariksha (10-fold examination)
const dashavidhaFields = [
  { key: "prakriti2", label: "Prakriti (Constitution Type)", options: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"] },
  { key: "vikriti2", label: "Vikriti (Current Imbalance)", options: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"] },
  { key: "doshavicara", label: "Doshavicara (Dosha State)", options: ["Sama (Balanced)", "Vriddhi (Increased)", "Kshaya (Decreased)"] },
  { key: "dhatu", label: "Dhatu (Tissue) Status", options: ["Rasa (Plasma)", "Rakta (Blood)", "Mamsa (Muscle)", "Meda (Fat)", "Asthi (Bone)", "Majja (Marrow)", "Shukra (Reproductive)", "Oja (Vital)"] },
  { key: "agni", label: "Agni (Digestive Fire)", options: ["Sama (Balanced)", "Vishama (Irregular)", "Tikshna (Sharp)", "Manda (Sluggish)", "Vyakta (Prominent)"] },
  { key: "jihva", label: "Jihva (Tongue)", options: ["Normal", "Coated White", "Coated Yellow", "Coated Brown", "Cracked", "Scalloped", "Dry"] },
  { key: "mala", label: "Mala (Waste)", options: ["Normal", "Constipation", "Diarrhea", "Hard Stool", "Loose Stool", "Incomplete Evacuation"] },
  { key: "mutra", label: "Mutra (Urine)", options: ["Normal", "Frequent", "Scanty", "Dark", "Burning", "Cloudy"] },
  { key: "nadi", label: "Nadi (Pulse)", options: ["Vata (Thin, Rope-like)", "Pitta (Bounding, Thready)", "Kapha (Slow, Heavy, Soft)", "Tridoshic"] },
  { key: "abhyavakarana", label: "Abhyavakarana (Mental Response)", options: ["Normal", "Anxious", "Irritable", "Lethargic", "Confused"] },
];

// Dinacharya fields (daily routine / lifestyle)
const dinacharyaFields = [
  { key: "wakeTime", label: "Usual Wake Time", type: "time" },
  { key: "sleepTime", label: "Usual Sleep Time", type: "time" },
  { key: "sleepQuality", label: "Sleep Quality", options: ["Good", "Moderate", "Poor", "Insomnia"] },
  { key: "exerciseType", label: "Exercise Type", options: ["Walking", "Yoga", "Gym", "Sports", "None"] },
  { key: "exerciseFrequency", label: "Exercise Frequency", options: ["Daily", "3-4 times/week", "1-2 times/week", "Rarely", "Never"] },
  { key: "waterIntake", label: "Daily Water Intake", options: ["< 1 litre", "1-2 litres", "2-3 litres", "> 3 litres"] },
  { key: "smoking", label: "Smoking", options: ["Non-smoker", "Occasional", "Regular", "Ex-smoker"] },
  { key: "alcohol", label: "Alcohol", options: ["Non-drinker", "Occasional", "Regular"] },
  { key: "stressLevel", label: "Stress Level", options: ["Low", "Moderate", "High", "Very High"] },
  { key: "bowelMovement", label: "Bowel Movement", options: ["Regular (1-2x/day)", "Once daily", "Irregular", "Constipated"] },
];

// Vata/Pitta/Kapha scoring for Prakriti assessment
const doshaScoreFields = [
  { key: "vataScore", label: "Vata Score", dosha: "Vata" },
  { key: "pittaScore", label: "Pitta Score", dosha: "Pitta" },
  { key: "kaphaScore", label: "Kapha Score", dosha: "Kapha" },
];

interface IntakeFormProps {
  patientId: string;
  onComplete?: () => void;
  existingData?: Record<string, string>;
  isReadOnly?: boolean;
  isDoctorReview?: boolean;
}

export default function IntakeForm({
  patientId,
  onComplete,
  existingData,
  isReadOnly = false,
  isDoctorReview = false,
}: IntakeFormProps) {
  const [activeTab, setActiveTab] = useState<"ashtavidha" | "dashavidha" | "prakriti" | "dinacharya" | "lifestyle">("ashtavidha");
  const [formData, setFormData] = useState<Record<string, string>>(existingData || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const submitIntake = useMutation(api.intake_forms.submit);
  const verifyIntake = useMutation(api.intake_forms.verify);

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await submitIntake({
        patientId: patientId as any,
        formData,
        submittedBy: isDoctorReview ? "doctor" : "patient",
      });
      setSaved(true);
      onComplete?.();
    } catch (err) {
      console.error("Failed to save intake form:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setSaving(true);
    try {
      await verifyIntake({
        patientId: patientId as any,
        formData,
        verifiedBy: "doctor",
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to verify intake form:", err);
    } finally {
      setSaving(false);
    }
  };

  // Determine dominant dosha from scores
  const vataScore = parseInt(formData.vataScore || "0", 10);
  const pittaScore = parseInt(formData.pittaScore || "0", 10);
  const kaphaScore = parseInt(formData.kaphaScore || "0", 10);
  const dominantDosha =
    vataScore >= pittaScore && vataScore >= kaphaScore ? "Vata"
    : pittaScore >= vataScore && pittaScore >= kaphaScore ? "Pitta"
    : "Kapha";

  const tabs = [
    { key: "ashtavidha" as const, label: "Ashtavidha Pariksha", icon: "🔍" },
    { key: "dashavidha" as const, label: "Dashavidha Pariksha", icon: "📋" },
    { key: "prakriti" as const, label: "Prakriti-Vikriti Score", icon: "⚖️" },
    { key: "dinacharya" as const, label: "Dinacharya (Daily Routine)", icon: "🕐" },
    { key: "lifestyle" as const, label: "Lifestyle & Diet", icon: "🥗" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ayurvedic Intake Assessment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SIH PS 26047 — Patient Case-Taking Software · Ministry of AYUSH
          </p>
        </div>
        {saved && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Ashtavidha Pariksha */}
      {activeTab === "ashtavidha" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔍</span>
            <h3 className="font-bold text-slate-900">Ashtavidha Pariksha (8-Fold Examination)</h3>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            Eight-fold clinical examination covering constitution, structural excellence, compactness, body measure, adaptability, mental strength, activity tolerance, and digestive capacity.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ashtavidhaFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{field.label}</label>
                <select
                  className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                  value={formData[field.key] || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashavidha Pariksha */}
      {activeTab === "dashavidha" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h3 className="font-bold text-slate-900">Dashavidha Pariksha (10-Fold Examination)</h3>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            Ten-fold diagnostic examination including dosha state, tissue analysis, digestive fire, tongue, waste, urine, pulse, and mental response.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {dashavidhaFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{field.label}</label>
                <select
                  className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                  value={formData[field.key] || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prakriti-Vikriti Score */}
      {activeTab === "prakriti" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚖️</span>
            <h3 className="font-bold text-slate-900">Prakriti-Vikriti Dosha Assessment</h3>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            Score each dosha on a scale of 0-100 based on constitutional assessment. The dominant dosha determines the patient's constitution type.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {doshaScoreFields.map((field) => (
              <div key={field.key} className={`p-4 rounded-xl border-2 ${
                dominantDosha === field.dosha
                  ? field.dosha === "Vata"
                    ? "border-blue-500 bg-blue-50"
                    : field.dosha === "Pitta"
                      ? "border-orange-500 bg-orange-50"
                      : "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}>
                <label className="text-sm font-bold text-slate-700 block mb-1">{field.label}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-blue-600"
                  value={formData[field.key] || "0"}
                  onChange={(e) => setField(field.key, e.target.value)}
                  disabled={isReadOnly}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">0</span>
                  <span className={`text-sm font-bold ${
                    dominantDosha === field.dosha
                      ? field.dosha === "Vata"
                        ? "text-blue-600"
                        : field.dosha === "Pitta"
                          ? "text-orange-600"
                          : "text-emerald-600"
                      : "text-slate-400"
                  }`}>
                    {formData[field.key] || "0"}
                  </span>
                  <span className="text-xs text-slate-500">100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dominant Dosha Result */}
          <div className={`p-4 rounded-xl border-2 text-center ${
            dominantDosha === "Vata"
              ? "border-blue-400 bg-blue-50"
              : dominantDosha === "Pitta"
                ? "border-orange-400 bg-orange-50"
                : "border-emerald-400 bg-emerald-50"
          }`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dominant Dosha</p>
            <p className={`text-2xl font-bold ${
              dominantDosha === "Vata"
                ? "text-blue-600"
                : dominantDosha === "Pitta"
                  ? "text-orange-600"
                  : "text-emerald-600"
            }`}>
              {dominantDosha}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Vata: {vataScore} · Pitta: {pittaScore} · Kapha: {kaphaScore}
            </p>
          </div>

          {/* Vikriti comparison */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Vikriti (Current Imbalance) — Compared to Prakriti</label>
            <textarea
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] disabled:bg-slate-50"
              placeholder="Describe how current symptoms differ from the constitutional baseline..."
              value={formData.vikritiNotes || ""}
              onChange={(e) => setField("vikritiNotes", e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>
      )}

      {/* Dinacharya */}
      {activeTab === "dinacharya" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🕐</span>
            <h3 className="font-bold text-slate-900">Dinacharya (Daily Routine)</h3>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            Daily routine assessment — sleep, exercise, water intake, stress, and bowel habits. This helps understand lifestyle-related dosha imbalances.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {dinacharyaFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{field.label}</label>
                {field.type === "time" ? (
                  <input
                    type="time"
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    value={formData[field.key] || ""}
                    onChange={(e) => setField(field.key, e.target.value)}
                    disabled={isReadOnly}
                  />
                ) : (
                  <select
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    value={formData[field.key] || ""}
                    onChange={(e) => setField(field.key, e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle & Diet */}
      {activeTab === "lifestyle" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🥗</span>
            <h3 className="font-bold text-slate-900">Lifestyle & Diet Notes</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dietary Preferences</label>
              <select
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                value={formData.dietType || ""}
                onChange={(e) => setField("dietType", e.target.value)}
                disabled={isReadOnly}
              >
                <option value="">Select...</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Meals Per Day</label>
              <input
                type="number"
                min="1"
                max="6"
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                value={formData.mealsPerDay || ""}
                onChange={(e) => setField("mealsPerDay", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Food Allergies / Intolerances</label>
              <textarea
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] disabled:bg-slate-50"
                placeholder="e.g., Dairy, Gluten, Nuts..."
                value={formData.foodAllergies || ""}
                onChange={(e) => setField("foodAllergies", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Lifestyle Notes</label>
              <textarea
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] disabled:bg-slate-50"
                placeholder="Any other lifestyle or dietary information..."
                value={formData.lifestyleNotes || ""}
                onChange={(e) => setField("lifestyleNotes", e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {!isReadOnly && (
          <Button
            onClick={handleSave}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Assessment"
            )}
          </Button>
        )}
        {isDoctorReview && !isReadOnly && (
          <Button
            onClick={handleVerify}
            className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            disabled={saving}
          >
            {saving ? "Verifying..." : "✓ Verify & Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
