import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();
    const enriched = await Promise.all(
      doctors.map(async (doc) => {
        const user = await ctx.db.get(doc.userId);
        return { ...doc, userName: user?.name, userEmail: user?.email };
      })
    );
    return enriched;
  },
});

export const get = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) return null;
    const user = await ctx.db.get(doctor.userId);
    return { ...doctor, userName: user?.name, userEmail: user?.email };
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!doctor) return null;
    const user = await ctx.db.get(doctor.userId);
    return { ...doctor, userName: user?.name, userEmail: user?.email };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    hospital: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doctorId = await ctx.db.insert("doctors", args);
    return doctorId;
  },
});

export const registerAsDoctor = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    hospital: v.optional(v.string()),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "doctor",
    });

    // Create doctor profile
    const doctorId = await ctx.db.insert("doctors", {
      userId,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
      hospital: args.hospital,
      phone: args.phone,
      bio: args.bio,
    });

    return { userId, doctorId };
  },
});
