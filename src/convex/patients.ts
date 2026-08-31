import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    doctorId: v.optional(v.id("doctors")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let patients;
    if (args.doctorId) {
      patients = await ctx.db
        .query("patients")
        .withIndex("by_assignedDoctor", (q) =>
          q.eq("assignedDoctorId", args.doctorId!)
        )
        .collect();
    } else {
      patients = await ctx.db.query("patients").collect();
    }

    // Enrich with user data
    const enriched = await Promise.all(
      patients.map(async (patient) => {
        const user = await ctx.db.get(patient.userId);
        return { ...patient, userName: user?.name, userEmail: user?.email };
      })
    );

    if (args.search) {
      const s = args.search.toLowerCase();
      return enriched.filter(
        (p) =>
          p.userName?.toLowerCase().includes(s) ||
          p.userEmail?.toLowerCase().includes(s) ||
          p.phone?.toLowerCase().includes(s)
      );
    }

    return enriched;
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) return null;
    const user = await ctx.db.get(patient.userId);
    return { ...patient, userName: user?.name, userEmail: user?.email };
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!patient) return null;
    const user = await ctx.db.get(patient.userId);
    return { ...patient, userName: user?.name, userEmail: user?.email };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    // Create a user account for the patient
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "patient",
      preferredLanguage: args.preferredLanguage,
    });

    const patientId = await ctx.db.insert("patients", {
      userId,
      phone: args.phone,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      address: args.address,
      emergencyContact: args.emergencyContact,
      emergencyPhone: args.emergencyPhone,
      bloodGroup: args.bloodGroup,
      allergies: args.allergies,
      existingConditions: args.existingConditions,
      currentMedications: args.currentMedications,
      medicalHistory: args.medicalHistory,
      notes: args.notes,
      preferredLanguage: args.preferredLanguage,
      assignedDoctorId: args.assignedDoctorId,
      qrCode: `PATIENT-${userId}`,
    });

    return patientId;
  },
});

export const update = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { patientId, ...updates } = args;
    const patient = await ctx.db.get(patientId);
    if (!patient) throw new Error("Patient not found");

    // Update user name if provided
    if (updates.name) {
      await ctx.db.patch(patient.userId, { name: updates.name });
    }

    await ctx.db.patch(patientId, updates);
    return patientId;
  },
});
