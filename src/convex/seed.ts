import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 3) {
      return "Data already seeded";
    }

    const now = Date.now();

    // Create demo doctor user
    const doctorUserId = await ctx.db.insert("users", {
      name: "Dr. Priya Sharma",
      email: "doctor@example.com",
      role: "doctor",
    });

    const doctorProfileId = await ctx.db.insert("doctors", {
      userId: doctorUserId,
      specialization: "Ayurvedic Medicine & Panchakarma",
      licenseNumber: "AYU-2024-001",
      hospital: "CareConnect Health Center",
      phone: "+91-9876543210",
      bio: "Experienced Ayurvedic practitioner specializing in Prakriti assessment and Panchakarma therapies.",
    });

    // Create demo patient users
    const patient1UserId = await ctx.db.insert("users", {
      name: "Rahul Kumar",
      email: "patient@example.com",
      role: "patient",
      preferredLanguage: "en",
    });

    const patient1Id = await ctx.db.insert("patients", {
      userId: patient1UserId,
      phone: "+91-9876543211",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      address: "Village Rampur, District Cuttack, Odisha",
      emergencyContact: "Sunita Kumar",
      emergencyPhone: "+91-9876543212",
      bloodGroup: "B+",
      allergies: "None known",
      existingConditions: "Mild anxiety, Seasonal allergies",
      currentMedications: "Ashwagandha 500mg daily",
      medicalHistory: "Common cold (2024), Mild gastritis (2023)",
      notes: "Regular patient, responds well to herbal remedies",
      preferredLanguage: "en",
      assignedDoctorId: doctorProfileId,
      qrCode: `PATIENT-${patient1UserId}`,
    });

    const patient2UserId = await ctx.db.insert("users", {
      name: "Anita Devi",
      email: "anita@example.com",
      role: "patient",
      preferredLanguage: "hi",
    });

    const patient2Id = await ctx.db.insert("patients", {
      userId: patient2UserId,
      phone: "+91-9876543213",
      dateOfBirth: "1985-08-22",
      gender: "Female",
      address: "Bhubaneswar, Odisha",
      emergencyContact: "Ramesh Devi",
      emergencyPhone: "+91-9876543214",
      bloodGroup: "A+",
      allergies: "Dairy products",
      existingConditions: "Diabetes Type 2, Joint pain",
      currentMedications: "Metformin 500mg, Guggul 250mg",
      medicalHistory: "Diabetes diagnosed 2020, Knee pain (chronic)",
      preferredLanguage: "hi",
      assignedDoctorId: doctorProfileId,
      qrCode: `PATIENT-${patient2UserId}`,
    });

    const patient3UserId = await ctx.db.insert("users", {
      name: "Suresh Patel",
      email: "suresh@example.com",
      role: "patient",
      preferredLanguage: "or",
    });

    const patient3Id = await ctx.db.insert("patients", {
      userId: patient3UserId,
      phone: "+91-9876543215",
      dateOfBirth: "1978-12-01",
      gender: "Male",
      address: "Puri, Odisha",
      emergencyContact: "Meena Patel",
      emergencyPhone: "+91-9876543216",
      bloodGroup: "O+",
      allergies: "Shellfish",
      existingConditions: "Hypertension, Insomnia",
      currentMedications: "Brahmi 300mg, Jatamansi 200mg",
      medicalHistory: "Hypertension diagnosed 2019",
      preferredLanguage: "or",
      assignedDoctorId: doctorProfileId,
      qrCode: `PATIENT-${patient3UserId}`,
    });

    // Create demo admin user
    const adminUserId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    });

    // Create appointments
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0];

    const apt1 = await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      date: today,
      time: "10:00",
      reason: "Follow-up for anxiety treatment",
      status: "scheduled",
      createdAt: now - 86400000 * 2,
    });

    const apt2 = await ctx.db.insert("appointments", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      date: tomorrow,
      time: "11:30",
      reason: "Diabetes management review",
      status: "scheduled",
      createdAt: now - 86400000,
    });

    const apt3 = await ctx.db.insert("appointments", {
      patientId: patient3Id,
      doctorId: doctorProfileId,
      date: nextWeek,
      time: "09:00",
      reason: "Blood pressure check",
      status: "scheduled",
      createdAt: now,
    });

    await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0],
      time: "14:00",
      reason: "Initial consultation",
      status: "completed",
      createdAt: now - 86400000 * 10,
    });

    await ctx.db.insert("appointments", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      time: "16:00",
      reason: "Herbal medicine adjustment",
      status: "completed",
      createdAt: now - 86400000 * 5,
    });

    // Create medical records
    const record1 = await ctx.db.insert("medical_records", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      appointmentId: apt1,
      type: "consultation",
      title: "Initial Anxiety Assessment",
      symptoms: "Restlessness, mild insomnia, difficulty concentrating",
      diagnosis: "Generalized anxiety - Vata imbalance",
      assessment:
        "Vata predominant Prakriti with current Vikriti showing elevated Vata in Manovaha Srotas",
      ayurvedaPrakriti: "Vata-Pitta",
      ayurvedaVikriti: "Elevated Vata",
      lifestyleNotes:
        "Irregular sleep schedule, high screen time, skip meals frequently",
      dietNotes:
        "Irregular eating patterns, high caffeine intake, prefers spicy food",
      treatmentPlan:
        "Ashwagandha, Brahmi, regular sleep schedule, meditation",
      herbMedicineSuggestions: "Ashwagandha churna, Brahmi vati, Jatamansi",
      createdAt: now - 86400000 * 7,
    });

    await ctx.db.insert("medical_records", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      appointmentId: apt2,
      type: "consultation",
      title: "Diabetes Management Review",
      symptoms: "Frequent urination, fatigue, mild joint stiffness",
      diagnosis: "Prameha (Diabetes) - Kapha-Vata type",
      assessment: "Kapha-Vata Vikriti, Ama present",
      ayurvedaPrakriti: "Kapha",
      ayurvedaVikriti: "Kapha-Vata",
      lifestyleNotes: "Moderate physical activity, evening walks",
      dietNotes:
        "Low sugar diet, prefers wheat-based meals, drinks warm water",
      treatmentPlan:
        "Continue Guggul, add Triphala, daily walks, reduce sugar intake",
      createdAt: now - 86400000 * 3,
    });

    // Create prescriptions
    const rx1 = await ctx.db.insert("prescriptions", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      appointmentId: apt1,
      notes: "Continue for 30 days, then review",
      status: "active",
      createdAt: now - 86400000 * 6,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx1,
      medicineName: "Ashwagandha Churna",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "30 days",
      instructions: "Take with warm milk before bed",
      isAyurvedic: true,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx1,
      medicineName: "Brahmi Vati",
      dosage: "250mg",
      frequency: "Twice daily",
      duration: "30 days",
      instructions: "Take after meals",
      isAyurvedic: true,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx1,
      medicineName: "Jatamansi Powder",
      dosage: "200mg",
      frequency: "Once daily",
      duration: "30 days",
      instructions: "Take at bedtime with warm water",
      isAyurvedic: true,
    });

    const rx2 = await ctx.db.insert("prescriptions", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      appointmentId: apt2,
      notes: "Monitor blood sugar, review in 2 weeks",
      status: "active",
      createdAt: now - 86400000 * 3,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx2,
      medicineName: "Guggulu",
      dosage: "250mg",
      frequency: "Twice daily",
      duration: "14 days",
      instructions: "Take before meals",
      isAyurvedic: true,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx2,
      medicineName: "Triphala Churna",
      dosage: "1 tsp",
      frequency: "Once daily",
      duration: "14 days",
      instructions: "Take with warm water at bedtime",
      isAyurvedic: true,
    });

    // Create reports
    await ctx.db.insert("reports", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      title: "Blood Work - Complete Panel",
      reportType: "blood_test",
      notes: "All values within normal range. Vitamin D slightly low.",
      createdAt: now - 86400000 * 5,
    });

    await ctx.db.insert("reports", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      title: "HbA1c Test",
      reportType: "diabetes_panel",
      notes: "HbA1c at 7.2%. Improving from previous 7.8%.",
      createdAt: now - 86400000 * 2,
    });

    // Create follow-ups
    await ctx.db.insert("followups", {
      patientId: patient1Id,
      doctorId: doctorProfileId,
      date: nextWeek,
      notes: "Review anxiety medication effectiveness",
      status: "pending",
      reminderSent: false,
      createdAt: now - 86400000,
    });

    await ctx.db.insert("followups", {
      patientId: patient2Id,
      doctorId: doctorProfileId,
      date: tomorrow,
      notes: "Check blood sugar levels after medication adjustment",
      status: "pending",
      reminderSent: false,
      createdAt: now,
    });

    // Create notifications
    await ctx.db.insert("notifications", {
      userId: patient1UserId,
      title: "Appointment Reminder",
      message: `You have an appointment today at 10:00 AM with Dr. Priya Sharma.`,
      type: "appointment",
      read: false,
      createdAt: now,
    });

    await ctx.db.insert("notifications", {
      userId: patient2UserId,
      title: "Prescription Ready",
      message:
        "Your new prescription is ready. Please review the medicines and dosage.",
      type: "prescription",
      read: false,
      createdAt: now - 3600000,
    });

    await ctx.db.insert("notifications", {
      userId: patient3UserId,
      title: "Welcome to CareConnect",
      message:
        "Welcome! Your account has been created. Your doctor can now manage your care.",
      type: "system",
      read: false,
      createdAt: now - 86400000,
    });

    // Create documents (handwritten prescriptions)
    await ctx.db.insert("documents", {
      patientId: patient1Id,
      uploadedBy: patient1UserId,
      fileName: "old_prescription_scan.jpg",
      fileType: "image/jpeg",
      description: "Old handwritten prescription from local Vaidya",
      ocrExtractedText:
        "Ashwagandha - 500mg, 2 times, Brahmi - 250mg, 2 times, For 15 days",
      ocrVerified: false,
      createdAt: now - 86400000 * 4,
    });

    await ctx.db.insert("documents", {
      patientId: patient2Id,
      uploadedBy: patient2UserId,
      fileName: "blood_test_report.pdf",
      fileType: "application/pdf",
      description: "Blood sugar test report from PathLab",
      ocrExtractedText:
        "Fasting Blood Sugar: 142 mg/dL, Post Meal: 198 mg/dL, HbA1c: 7.2%",
      ocrVerified: true,
      verifiedBy: doctorProfileId,
      verifiedAt: now - 86400000,
      verifiedNotes: "Verified against lab report. Diabetes management needed.",
      createdAt: now - 86400000 * 3,
    });

    return "Demo data seeded successfully";
  },
});
