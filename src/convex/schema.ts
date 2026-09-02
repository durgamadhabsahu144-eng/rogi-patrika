import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.DOCTOR),
  v.literal(ROLES.PATIENT),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      preferredLanguage: v.optional(v.string()),
    }).index("email", ["email"]),

    // Doctor profiles
    doctors: defineTable({
      userId: v.id("users"),
      specialization: v.optional(v.string()),
      licenseNumber: v.optional(v.string()),
      hospital: v.optional(v.string()),
      phone: v.optional(v.string()),
      bio: v.optional(v.string()),
    }).index("by_userId", ["userId"]),

    // Patient profiles
    patients: defineTable({
      userId: v.id("users"),
      phone: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      gender: v.optional(v.string()),
      address: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      emergencyPhone: v.optional(v.string()),
      bloodGroup: v.optional(v.string()),
      allergies: v.optional(v.string()),
      existingConditions: v.optional(v.string()),
      currentMedications: v.optional(v.string()),
      medicalHistory: v.optional(v.string()),
      notes: v.optional(v.string()),
      preferredLanguage: v.optional(v.string()),
      assignedDoctorId: v.optional(v.id("doctors")),
      qrCode: v.optional(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_assignedDoctor", ["assignedDoctorId"]),

    // Appointments
    appointments: defineTable({
      patientId: v.id("patients"),
      doctorId: v.id("doctors"),
      date: v.string(),
      time: v.string(),
      reason: v.optional(v.string()),
      status: v.union(
        v.literal("scheduled"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("missed"),
      ),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_doctorId", ["doctorId"])
      .index("by_status", ["status"])
      .index("by_date", ["date"]),

    // Medical records / consultations
    medical_records: defineTable({
      patientId: v.id("patients"),
      doctorId: v.id("doctors"),
      appointmentId: v.optional(v.id("appointments")),
      type: v.string(),
      title: v.string(),
      content: v.optional(v.string()),
      symptoms: v.optional(v.string()),
      diagnosis: v.optional(v.string()),
      assessment: v.optional(v.string()),
      ayurvedaPrakriti: v.optional(v.string()),
      ayurvedaVikriti: v.optional(v.string()),
      lifestyleNotes: v.optional(v.string()),
      dietNotes: v.optional(v.string()),
      treatmentPlan: v.optional(v.string()),
      herbMedicineSuggestions: v.optional(v.string()),
      aiGeneratedSummary: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_doctorId", ["doctorId"]),

    // Prescriptions (enhanced with versioning, disease, source)
    prescriptions: defineTable({
      patientId: v.id("patients"),
      doctorId: v.id("doctors"),
      appointmentId: v.optional(v.id("appointments")),
      prescriptionNumber: v.string(), // e.g. "RX-2026-000456"
      version: v.number(), // 1, 2, 3...
      disease: v.optional(v.string()), // condition/disease
      notes: v.optional(v.string()),
      sourceMethod: v.union(
        v.literal("structured"),
        v.literal("voice"),
        v.literal("upload"),
      ),
      status: v.union(
        v.literal("active"),
        v.literal("superseded"),
        v.literal("discontinued"),
      ),
      feedbackEligibleAfter: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_doctorId", ["doctorId"])
      .index("by_prescriptionNumber", ["prescriptionNumber"])
      .index("by_status", ["status"]),

    // Prescription items (enhanced with timing/anupana)
    prescription_items: defineTable({
      prescriptionId: v.id("prescriptions"),
      medicineName: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      timing: v.optional(v.string()), // before/after food, morning/evening
      anupana: v.optional(v.string()), // honey, warm water, etc.
      duration: v.string(),
      instructions: v.optional(v.string()),
      isAyurvedic: v.optional(v.boolean()),
    }).index("by_prescriptionId", ["prescriptionId"]),

    // Reports / lab results
    reports: defineTable({
      patientId: v.id("patients"),
      doctorId: v.id("doctors"),
      title: v.string(),
      reportType: v.string(),
      fileUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
      aiGeneratedSummary: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_doctorId", ["doctorId"]),

    // Uploaded documents (handwritten prescriptions, etc.)
    documents: defineTable({
      patientId: v.id("patients"),
      uploadedBy: v.id("users"),
      fileName: v.string(),
      fileType: v.string(),
      fileUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      ocrExtractedText: v.optional(v.string()),
      ocrVerified: v.boolean(),
      verifiedBy: v.optional(v.id("doctors")),
      verifiedAt: v.optional(v.number()),
      verifiedNotes: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_patientId", ["patientId"]),

    // Follow-ups
    followups: defineTable({
      patientId: v.id("patients"),
      doctorId: v.id("doctors"),
      date: v.string(),
      notes: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
      reminderSent: v.optional(v.boolean()),
      createdAt: v.number(),
    })
      .index("by_patientId", ["patientId"])
      .index("by_doctorId", ["doctorId"])
      .index("by_date", ["date"]),

    // SIH PS 26047 — Ayurvedic Intake Forms
    intake_forms: defineTable({
      patientId: v.id("patients"),
      submittedBy: v.union(v.literal("doctor"), v.literal("patient")),
      formData: v.any(),
      verified: v.boolean(),
      verifiedBy: v.optional(v.string()),
      verifiedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_patientId", ["patientId"]),

    // Prescription Feedback (patient feedback on medications)
    prescription_feedback: defineTable({
      prescriptionNumber: v.string(),
      patientId: v.id("patients"),
      feedbackStatus: v.union(
        v.literal("working"),
        v.literal("not_working"),
        v.literal("partial"),
        v.literal("side_effects"),
      ),
      notes: v.optional(v.string()),
      reviewedByDoctor: v.boolean(),
      submittedAt: v.number(),
    })
      .index("by_prescriptionNumber", ["prescriptionNumber"])
      .index("by_patientId", ["patientId"])
      .index("by_reviewed", ["reviewedByDoctor"]),

    // Notifications
    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.string(),
      read: v.boolean(),
      relatedId: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_userId", ["userId"])
      .index("by_userId_read", ["userId", "read"]),

    // Audit logs
    audit_logs: defineTable({
      userId: v.id("users"),
      action: v.string(),
      targetTable: v.optional(v.string()),
      targetId: v.optional(v.string()),
      details: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
