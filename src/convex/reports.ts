import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .collect();

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const doctor = await ctx.db.get(report.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        const patient = await ctx.db.get(args.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        return { ...report, doctorName: doctorUser?.name, patientName: patientUser?.name };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listByDoctor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!doctor) return [];

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_doctorId", (q) => q.eq("doctorId", doctor._id))
      .collect();

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const patient = await ctx.db.get(report.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        const doctor = await ctx.db.get(report.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        return { ...report, patientName: patientUser?.name, doctorName: doctorUser?.name };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    title: v.string(),
    reportType: v.string(),
    fileUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reportId = await ctx.db.insert("reports", {
      ...args,
      createdAt: Date.now(),
    });

    // Notify patient
    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "New Report Available",
        message: `A new report "${args.title}" has been uploaded.`,
        type: "report",
        read: false,
        relatedId: reportId,
        createdAt: Date.now(),
      });
    }

    return reportId;
  },
});
