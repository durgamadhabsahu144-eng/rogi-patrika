import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { roleValidator } from "./schema";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      return null;
    }
    return user;
  },
});

/**
 * Set the current user's role. Called after role selection on the auth page.
 */
export const setMyRole = mutation({
  args: { role: roleValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(userId, { role: args.role });

    // Auto-provision profiles on first role selection
    if (args.role === "doctor") {
      const existing = await ctx.db
        .query("doctors")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (!existing) {
        await ctx.db.insert("doctors", {
          userId,
          specialization: "General Medicine",
          hospital: "CareSync Pro Hospital",
        });
      }
    } else if (args.role === "patient") {
      const existing = await ctx.db
        .query("patients")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (!existing) {
        const patientId = await ctx.db.insert("patients", {
          userId,
          qrCode: `PATIENT-${userId}`,
        });
        // Create notification
        await ctx.db.insert("notifications", {
          userId,
          title: "Welcome to CareSync Pro",
          message: "Your patient account has been created. View your health information from the dashboard.",
          type: "system",
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};
