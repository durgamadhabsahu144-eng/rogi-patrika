import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Generate prescription number: RX-YYYY-NNNNNN ───
function generateRxNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0");
  return `RX-${year}-${rand}`;
}

// ─── Calculate feedback eligible after (ms) based on frequency ───
function feedbackDelay(frequency: string): number {
  const f = frequency.toLowerCase();
  if (f.includes("once") || f.includes("1 time")) return 2 * 86400000; // 2 days
  if (f.includes("twice") || f.includes("2 time")) return 1 * 86400000; // 1 day
  if (f.includes("thrice") || f.includes("3 time")) return 1 * 86400000;
  return 2 * 86400000; // default 2 days
}

// ─── List prescriptions ───
export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
    includeSuperseded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let prescriptions;
    if (args.patientId) {
      prescriptions = await ctx.db
        .query("prescriptions")
        .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId!))
        .collect();
    } else if (args.doctorId) {
      prescriptions = await ctx.db
        .query("prescriptions")
        .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId!))
        .collect();
    } else {
      prescriptions = await ctx.db.query("prescriptions").collect();
    }

    // Filter out superseded unless requested
    if (!args.includeSuperseded) {
      prescriptions = prescriptions.filter((rx) => rx.status !== "superseded");
    }

    const enriched = await Promise.all(
      prescriptions.map(async (rx) => {
        const doctor = await ctx.db.get(rx.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        const patient = await ctx.db.get(rx.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        const items = await ctx.db
          .query("prescription_items")
          .withIndex("by_prescriptionId", (q) =>
            q.eq("prescriptionId", rx._id),
          )
          .collect();

        // Get feedback for this prescription number
        const feedback = await ctx.db
          .query("prescription_feedback")
          .withIndex("by_prescriptionNumber", (q) =>
            q.eq("prescriptionNumber", rx.prescriptionNumber),
          )
          .collect();

        return {
          ...rx,
          doctorName: doctorUser?.name,
          patientName: patientUser?.name,
          items,
          feedback,
          feedbackCount: feedback.length,
          unreviewedFeedback: feedback.filter((f) => !f.reviewedByDoctor)
            .length,
        };
      }),
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ─── List version history for a prescription number ───
export const getVersionHistory = query({
  args: { prescriptionNumber: v.string() },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("prescriptions")
      .withIndex("by_prescriptionNumber", (q) =>
        q.eq("prescriptionNumber", args.prescriptionNumber),
      )
      .collect();

    const enriched = await Promise.all(
      versions.map(async (rx) => {
        const items = await ctx.db
          .query("prescription_items")
          .withIndex("by_prescriptionId", (q) =>
            q.eq("prescriptionId", rx._id),
          )
          .collect();
        return { ...rx, items };
      }),
    );

    return enriched.sort((a, b) => a.version - b.version);
  },
});

// ─── Create prescription ───
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.optional(v.id("appointments")),
    disease: v.optional(v.string()),
    notes: v.optional(v.string()),
    sourceMethod: v.union(
      v.literal("structured"),
      v.literal("voice"),
      v.literal("upload"),
    ),
    items: v.array(
      v.object({
        medicineName: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        timing: v.optional(v.string()),
        anupana: v.optional(v.string()),
        duration: v.string(),
        instructions: v.optional(v.string()),
        isAyurvedic: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const rxNumber = generateRxNumber();
    const now = Date.now();

    // Calculate feedback eligible date based on first item frequency
    const firstFreq = args.items[0]?.frequency || "twice daily";
    const feedbackDelayMs = feedbackDelay(firstFreq);

    const prescriptionId = await ctx.db.insert("prescriptions", {
      patientId: args.patientId,
      doctorId: args.doctorId,
      appointmentId: args.appointmentId,
      prescriptionNumber: rxNumber,
      version: 1,
      disease: args.disease,
      notes: args.notes,
      sourceMethod: args.sourceMethod,
      status: "active",
      feedbackEligibleAfter: now + feedbackDelayMs,
      createdAt: now,
    });

    for (const item of args.items) {
      await ctx.db.insert("prescription_items", {
        prescriptionId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        timing: item.timing,
        anupana: item.anupana,
        duration: item.duration,
        instructions: item.instructions,
        isAyurvedic: item.isAyurvedic,
      });
    }

    // Notify patient
    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "New Prescription",
        message: `Prescription ${rxNumber} created for you. ${
          args.disease ? `Regarding: ${args.disease}.` : ""
        }`,
        type: "prescription",
        read: false,
        relatedId: rxNumber,
        createdAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("audit_logs", {
      userId,
      action: "create_prescription",
      targetTable: "prescriptions",
      targetId: prescriptionId,
      details: `Created ${rxNumber} v1 with ${args.items.length} items`,
      createdAt: now,
    });

    return { id: prescriptionId, prescriptionNumber: rxNumber };
  },
});

// ─── Revise prescription (creates new version, marks old as superseded) ───
export const revise = mutation({
  args: {
    prescriptionNumber: v.string(),
    doctorId: v.id("doctors"),
    disease: v.optional(v.string()),
    notes: v.optional(v.string()),
    sourceMethod: v.union(
      v.literal("structured"),
      v.literal("voice"),
      v.literal("upload"),
    ),
    items: v.array(
      v.object({
        medicineName: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        timing: v.optional(v.string()),
        anupana: v.optional(v.string()),
        duration: v.string(),
        instructions: v.optional(v.string()),
        isAyurvedic: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find all existing versions
    const existing = await ctx.db
      .query("prescriptions")
      .withIndex("by_prescriptionNumber", (q) =>
        q.eq("prescriptionNumber", args.prescriptionNumber),
      )
      .collect();

    if (existing.length === 0) throw new Error("Prescription not found");

    const latest = existing.reduce((a, b) =>
      a.version > b.version ? a : b,
    );
    const newVersion = latest.version + 1;
    const now = Date.now();

    // Mark previous active as superseded
    for (const rx of existing) {
      if (rx.status === "active") {
        await ctx.db.patch(rx._id, { status: "superseded" });
      }
    }

    const firstFreq = args.items[0]?.frequency || "twice daily";
    const feedbackDelayMs = feedbackDelay(firstFreq);

    const prescriptionId = await ctx.db.insert("prescriptions", {
      patientId: latest.patientId,
      doctorId: args.doctorId,
      appointmentId: latest.appointmentId,
      prescriptionNumber: args.prescriptionNumber,
      version: newVersion,
      disease: args.disease ?? latest.disease,
      notes: args.notes,
      sourceMethod: args.sourceMethod,
      status: "active",
      feedbackEligibleAfter: now + feedbackDelayMs,
      createdAt: now,
    });

    for (const item of args.items) {
      await ctx.db.insert("prescription_items", {
        prescriptionId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        timing: item.timing,
        anupana: item.anupana,
        duration: item.duration,
        instructions: item.instructions,
        isAyurvedic: item.isAyurvedic,
      });
    }

    // Notify patient
    const patient = await ctx.db.get(latest.patientId);
    if (patient) {
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "Prescription Updated",
        message: `Prescription ${args.prescriptionNumber} has been revised to version ${newVersion}.`,
        type: "prescription",
        read: false,
        relatedId: args.prescriptionNumber,
        createdAt: now,
      });
    }

    await ctx.db.insert("audit_logs", {
      userId,
      action: "revise_prescription",
      targetTable: "prescriptions",
      targetId: prescriptionId,
      details: `Revised ${args.prescriptionNumber} from v${latest.version} to v${newVersion}`,
      createdAt: now,
    });

    return { id: prescriptionId, version: newVersion };
  },
});

// ─── Submit patient feedback ───
export const submitFeedback = mutation({
  args: {
    prescriptionNumber: v.string(),
    patientId: v.id("patients"),
    feedbackStatus: v.union(
      v.literal("working"),
      v.literal("not_working"),
      v.literal("partial"),
      v.literal("side_effects"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const feedbackId = await ctx.db.insert("prescription_feedback", {
      prescriptionNumber: args.prescriptionNumber,
      patientId: args.patientId,
      feedbackStatus: args.feedbackStatus,
      notes: args.notes,
      reviewedByDoctor: false,
      submittedAt: Date.now(),
    });

    // Notify doctor about negative feedback
    if (args.feedbackStatus !== "working") {
      const rx = await ctx.db
        .query("prescriptions")
        .withIndex("by_prescriptionNumber", (q) =>
          q.eq("prescriptionNumber", args.prescriptionNumber),
        )
        .first();

      if (rx) {
        const doctor = await ctx.db.get(rx.doctorId);
        if (doctor) {
          const statusLabel =
            args.feedbackStatus === "not_working"
              ? "not working"
              : args.feedbackStatus === "partial"
                ? "partially working"
                : "causing side effects";
          await ctx.db.insert("notifications", {
            userId: doctor.userId,
            title: "Patient Feedback Needs Review",
            message: `Patient reported prescription ${args.prescriptionNumber} is ${statusLabel}. Please review.`,
            type: "feedback",
            read: false,
            relatedId: args.prescriptionNumber,
            createdAt: Date.now(),
          });
        }
      }
    }

    return feedbackId;
  },
});

// ─── Doctor marks feedback as reviewed ───
export const reviewFeedback = mutation({
  args: {
    feedbackId: v.id("prescription_feedback"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.feedbackId, { reviewedByDoctor: true });
    return args.feedbackId;
  },
});

// ─── List unreviewed feedback (for doctor dashboard) ───
export const listUnreviewedFeedback = query({
  args: {
    doctorId: v.optional(v.id("doctors")),
  },
  handler: async (ctx, args) => {
    // Get all feedback that hasn't been reviewed
    const allFeedback = await ctx.db
      .query("prescription_feedback")
      .collect();

    const unreviewed = allFeedback.filter((f) => !f.reviewedByDoctor);

    const enriched = await Promise.all(
      unreviewed.map(async (fb) => {
        const patient = await ctx.db.get(fb.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;

        // Get the active prescription for this number
        const prescriptions = await ctx.db
          .query("prescriptions")
          .withIndex("by_prescriptionNumber", (q) =>
            q.eq("prescriptionNumber", fb.prescriptionNumber),
          )
          .collect();
        const activeRx = prescriptions.find((r) => r.status === "active");
        const items = activeRx
          ? await ctx.db
              .query("prescription_items")
              .withIndex("by_prescriptionId", (q) =>
                q.eq("prescriptionId", activeRx._id),
              )
              .collect()
          : [];

        return {
          ...fb,
          patientName: patientUser?.name,
          prescription: activeRx,
          prescriptionItems: items,
        };
      }),
    );

    return enriched.sort((a, b) => b.submittedAt - a.submittedAt);
  },
});

// ─── Cancel/discontinue prescription ───
export const discontinue = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.prescriptionId, { status: "discontinued" });
    return args.prescriptionId;
  },
});
