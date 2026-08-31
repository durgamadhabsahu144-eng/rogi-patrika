import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_patientId", (q) => q.eq("patientId", args.patientId))
      .collect();

    const enriched = await Promise.all(
      documents.map(async (doc) => {
        const uploader = await ctx.db.get(doc.uploadedBy);
        return { ...doc, uploaderName: uploader?.name };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    fileName: v.string(),
    fileType: v.string(),
    fileUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    ocrExtractedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const docId = await ctx.db.insert("documents", {
      ...args,
      uploadedBy: userId,
      ocrVerified: false,
      createdAt: Date.now(),
    });

    return docId;
  },
});

export const verifyOcr = mutation({
  args: {
    documentId: v.id("documents"),
    verifiedNotes: v.optional(v.string()),
    ocrExtractedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find the doctor profile for this user
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    await ctx.db.patch(args.documentId, {
      ocrVerified: true,
      verifiedBy: doctor?._id,
      verifiedAt: Date.now(),
      verifiedNotes: args.verifiedNotes,
      ...(args.ocrExtractedText !== undefined && {
        ocrExtractedText: args.ocrExtractedText,
      }),
    });

    return args.documentId;
  },
});
