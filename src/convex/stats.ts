import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const doctorStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const today = new Date().toISOString().split("T")[0];

    let appointments;
    let patients;
    let followups;

    if (doctor) {
      // Get data assigned to this doctor
      appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctorId", (q) => q.eq("doctorId", doctor._id))
        .collect();

      patients = await ctx.db
        .query("patients")
        .withIndex("by_assignedDoctor", (q) =>
          q.eq("assignedDoctorId", doctor._id)
        )
        .collect();

      followups = await ctx.db
        .query("followups")
        .withIndex("by_doctorId", (q) => q.eq("doctorId", doctor._id))
        .collect();
    } else {
      // No doctor profile yet — show ALL data so the dashboard isn't empty
      appointments = await ctx.db.query("appointments").collect();
      patients = await ctx.db.query("patients").collect();
      followups = await ctx.db.query("followups").collect();
    }

    const todayAppointments = appointments.filter(
      (a) => a.date === today && a.status === "scheduled"
    );

    const pendingFollowups = followups.filter((f) => f.status === "pending");

    const scheduledAppointments = appointments.filter(
      (a) => a.status === "scheduled"
    );

    // Recent patients (based on most recent appointment)
    const patientIdsWithAppts = [
      ...new Set(appointments.map((a) => a.patientId)),
    ];
    const recentPatientIds = patientIdsWithAppts.slice(0, 5);

    const enrichedRecentPatients = await Promise.all(
      recentPatientIds.map(async (pid) => {
        const patient = await ctx.db.get(pid);
        const user = patient ? await ctx.db.get(patient.userId) : null;
        return {
          id: pid,
          name: user?.name || "Unknown",
          email: user?.email,
        };
      })
    );

    // Upcoming appointments (next 7 days)
    const weekFromNow = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0];
    const upcomingAppointments = appointments
      .filter(
        (a) =>
          a.status === "scheduled" && a.date >= today && a.date <= weekFromNow
      )
      .sort(
        (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
      )
      .slice(0, 5);

    const enrichedUpcoming = await Promise.all(
      upcomingAppointments.map(async (apt) => {
        const patient = await ctx.db.get(apt.patientId);
        const user = patient ? await ctx.db.get(patient.userId) : null;
        return {
          ...apt,
          patientName: user?.name || "Unknown",
        };
      })
    );

    return {
      totalPatients: patients.length,
      todayAppointments: todayAppointments.length,
      pendingFollowups: pendingFollowups.length,
      totalAppointments: appointments.length,
      scheduledAppointments: scheduledAppointments.length,
      recentPatients: enrichedRecentPatients,
      upcomingAppointments: enrichedUpcoming,
    };
  },
});

export const patientStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!patient) return null;

    const today = new Date().toISOString().split("T")[0];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .collect();

    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .collect();

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .collect();

    const followups = await ctx.db
      .query("followups")
      .withIndex("by_patientId", (q) => q.eq("patientId", patient._id))
      .collect();

    const nextAppointment = appointments
      .filter((a) => a.status === "scheduled" && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    const activePrescription = prescriptions.find(
      (p) => p.status === "active"
    );

    const nextFollowup = followups
      .filter((f) => f.status === "pending" && f.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    return {
      totalAppointments: appointments.length,
      totalPrescriptions: prescriptions.length,
      totalReports: reports.length,
      nextAppointment,
      activePrescription,
      nextFollowup,
    };
  },
});
