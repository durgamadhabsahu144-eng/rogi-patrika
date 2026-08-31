import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
  },
  handler: async (ctx, args) => {
    let followups;
    if (args.patientId) {
      followups = await ctx.db
        .query("followups")
        .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId!))
        .collect();
    } else if (args.doctorId) {
      followups = await ctx.db
        .query("followups")
        .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId!))
        .collect();
    } else {
      followups = await ctx.db.query("followups").collect();
    }

    const enriched = await Promise.all(
      followups.map(async (fu) => {
        const doctor = await ctx.db.get(fu.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        const patient = await ctx.db.get(fu.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        return {
          ...fu,
          doctorName: doctorUser?.name,
          patientName: patientUser?.name,
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
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const fuId = await ctx.db.insert("followups", {
      ...args,
      status: "pending",
      reminderSent: false,
      createdAt: Date.now(),
    });

    // Notify patient
    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "New Follow-up Scheduled",
        message: `A follow-up appointment has been scheduled for ${args.date}.`,
        type: "followup",
        read: false,
        relatedId: fuId,
        createdAt: Date.now(),
      });
    }

    return fuId;
  },
});

export const update = mutation({
  args: {
    followupId: v.id("followups"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    notes: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { followupId, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    await ctx.db.patch(followupId, cleanUpdates);
    return followupId;
  },
});
