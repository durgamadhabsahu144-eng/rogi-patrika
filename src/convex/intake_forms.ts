import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get intake form for a patient
export const get = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("intake_forms")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .first();
    return record || null;
  },
});

// Get all intake forms (for admin/doctors)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("intake_forms").collect();
    const enriched = await Promise.all(
      records.map(async (rec) => {
        const patient = await ctx.db.get(rec.patientId);
        const patientUser = patient ? await ctx.db.get(patient.userId) : null;
        return {
          ...rec,
          patientName: patientUser?.name || "Unknown",
        };
      })
    );
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Submit / Update intake form
export const submit = mutation({
  args: {
    patientId: v.id("patients"),
    formData: v.any(),
    submittedBy: v.union(v.literal("doctor"), v.literal("patient")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if form already exists for this patient
    const existing = await ctx.db
      .query("intake_forms")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .first();

    if (existing) {
      // Update existing form
      await ctx.db.patch(existing._id, {
        formData: args.formData,
        submittedBy: args.submittedBy,
        verified: false, // Reset verification on edit
        verifiedBy: undefined,
        verifiedAt: undefined,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new form
    return await ctx.db.insert("intake_forms", {
      patientId: args.patientId,
      submittedBy: args.submittedBy,
      formData: args.formData,
      verified: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Doctor verifies intake form
export const verify = mutation({
  args: {
    patientId: v.id("patients"),
    formData: v.any(),
    verifiedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("intake_forms")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        formData: args.formData,
        verified: true,
        verifiedBy: args.verifiedBy,
        verifiedAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create verified form
    return await ctx.db.insert("intake_forms", {
      patientId: args.patientId,
      submittedBy: "doctor",
      formData: args.formData,
      verified: true,
      verifiedBy: args.verifiedBy,
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});
// re-save
