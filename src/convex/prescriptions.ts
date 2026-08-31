import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
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

    const enriched = await Promise.all(
      prescriptions.map(async (rx) => {
        const doctor = await ctx.db.get(rx.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        const patient = await ctx.db.get(rx.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        const items = await ctx.db
          .query("prescription_items")
          .withIndex("by_prescriptionId", (q) =>
            q.eq("prescriptionId", rx._id)
          )
          .collect();
        return {
          ...rx,
          doctorName: doctorUser?.name,
          patientName: patientUser?.name,
          items,
        };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.optional(v.id("appointments")),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        medicineName: v.string(),
        dosage: v.string(),
        frequency: v.string(),
        duration: v.string(),
        instructions: v.optional(v.string()),
        isAyurvedic: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prescriptionId = await ctx.db.insert("prescriptions", {
      patientId: args.patientId,
      doctorId: args.doctorId,
      appointmentId: args.appointmentId,
      notes: args.notes,
      status: "active",
      createdAt: Date.now(),
    });

    for (const item of args.items) {
      await ctx.db.insert("prescription_items", {
        prescriptionId,
        ...item,
      });
    }

    // Notify patient
    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "New Prescription",
        message: "A new prescription has been created for you.",
        type: "prescription",
        read: false,
        relatedId: prescriptionId,
        createdAt: Date.now(),
      });
    }

    // Audit log
    await ctx.db.insert("audit_logs", {
      userId,
      action: "create_prescription",
      targetTable: "prescriptions",
      targetId: prescriptionId,
      createdAt: Date.now(),
    });

    return prescriptionId;
  },
});
