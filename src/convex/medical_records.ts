import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("medical_records")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .collect();

    const enriched = await Promise.all(
      records.map(async (record) => {
        const doctor = await ctx.db.get(record.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        return { ...record, doctorName: doctorUser?.name };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { recordId: v.id("medical_records") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) return null;
    const doctor = await ctx.db.get(record.doctorId);
    const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
    return { ...record, doctorName: doctorUser?.name };
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const recordId = await ctx.db.insert("medical_records", {
      ...args,
      createdAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("audit_logs", {
      userId,
      action: "create_medical_record",
      targetTable: "medical_records",
      targetId: recordId,
      createdAt: Date.now(),
    });

    return recordId;
  },
});
