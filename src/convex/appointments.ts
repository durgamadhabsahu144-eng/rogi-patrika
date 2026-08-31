import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    doctorId: v.optional(v.id("doctors")),
    patientId: v.optional(v.id("patients")),
    status: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let appointments;

    if (args.doctorId) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId!))
        .collect();
    } else if (args.patientId) {
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId!))
        .collect();
    } else {
      appointments = await ctx.db.query("appointments").collect();
    }

    // Enrich with patient and doctor names
    const enriched = await Promise.all(
      appointments.map(async (apt) => {
        const patient = await ctx.db.get(apt.patientId);
        const doctor = await ctx.db.get(apt.doctorId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
        return {
          ...apt,
          patientName: patientUser?.name,
          doctorName: doctorUser?.name,
        };
      })
    );

    // Filter by status if specified
    if (args.status) {
      return enriched.filter((a) => a.status === args.status);
    }

    // Sort by date descending
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const apt = await ctx.db.get(args.appointmentId);
    if (!apt) return null;
    const patient = await ctx.db.get(apt.patientId);
    const doctor = await ctx.db.get(apt.doctorId);
    const patientUser = patient ? await ctx.db.get(patient.userId) : null;
    const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
    return {
      ...apt,
      patientName: patientUser?.name,
      doctorName: doctorUser?.name,
    };
  },
});

export const getTodayCount = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctorId", (q) => q.eq("doctorId", args.doctorId))
      .collect();
    return appointments.filter(
      (a) => a.date === today && a.status === "scheduled"
    ).length;
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    date: v.string(),
    time: v.string(),
    reason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const aptId = await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      createdAt: Date.now(),
    });

    // Create notification for patient
    const patient = await ctx.db.get(args.patientId);
    if (patient) {
      const doctor = await ctx.db.get(args.doctorId);
      const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;
      await ctx.db.insert("notifications", {
        userId: patient.userId,
        title: "New Appointment",
        message: `Your appointment has been scheduled for ${args.date} at ${args.time} with Dr. ${doctorUser?.name || "Doctor"}`,
        type: "appointment",
        read: false,
        relatedId: aptId,
        createdAt: Date.now(),
      });
    }

    // Audit log
    await ctx.db.insert("audit_logs", {
      userId,
      action: "create_appointment",
      targetTable: "appointments",
      targetId: aptId,
      createdAt: Date.now(),
    });

    return aptId;
  },
});

export const update = mutation({
  args: {
    appointmentId: v.id("appointments"),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("missed")
      )
    ),
    notes: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { appointmentId, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(appointmentId, cleanUpdates);

    // Audit log
    await ctx.db.insert("audit_logs", {
      userId,
      action: "update_appointment",
      targetTable: "appointments",
      targetId: appointmentId,
      details: JSON.stringify(cleanUpdates),
      createdAt: Date.now(),
    });

    return appointmentId;
  },
});

export const remove = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.appointmentId);
    return args.appointmentId;
  },
});
