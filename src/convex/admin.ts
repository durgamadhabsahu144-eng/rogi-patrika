import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/**
 * Get all doctors for admin dashboard
 */
export const getAllDoctors = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

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

/**
 * Get all patients for admin dashboard
 */
export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const patients = await ctx.db.query("patients").collect();
    const enriched = await Promise.all(
      patients.map(async (patient) => {
        const user = await ctx.db.get(patient.userId);
        return { ...patient, userName: user?.name, userEmail: user?.email };
      })
    );
    return enriched;
  },
});

/**
 * Get system statistics for admin
 */
export const getSystemStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doctors = await ctx.db.query("doctors").collect();
    const patients = await ctx.db.query("patients").collect();
    const appointments = await ctx.db.query("appointments").collect();
    const prescriptions = await ctx.db.query("prescriptions").collect();

    return {
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      totalPrescriptions: prescriptions.length,
    };
  },
});

/**
 * Get all notifications for admin (any user's notifications)
 */
export const getAllNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // For admin, get all notifications
    const notifications = await ctx.db.query("notifications").order("desc").take(50);
    return notifications;
  },
});
