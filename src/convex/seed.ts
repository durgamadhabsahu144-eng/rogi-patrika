import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 3) {
      return "Data already seeded";
    }

    const now = Date.now();

    // Create demo doctor users
    const doctor1UserId = await ctx.db.insert("users", {
      name: "Dr. Priya Sharma",
      email: "doctor@example.com",
      role: "doctor",
    });

    const doctor1ProfileId = await ctx.db.insert("doctors", {
      userId: doctor1UserId,
      specialization: "Ayurvedic Medicine & Panchakarma",
      licenseNumber: "AYU-2024-001",
      hospital: "CareSync Health Center",
      phone: "+91-9876543210",
      bio: "Experienced Ayurvedic practitioner specializing in Prakriti assessment and Panchakarma therapies.",
    });

    const doctor2UserId = await ctx.db.insert("users", {
      name: "Dr. Amit Verma",
      email: "doctor2@example.com",
      role: "doctor",
    });

    await ctx.db.insert("doctors", {
      userId: doctor2UserId,
      specialization: "Kayachikitsa (Internal Medicine)",
      licenseNumber: "AYU-2024-002",
      hospital: "CareSync Health Center",
      phone: "+91-9876543220",
      bio: "Specialist in chronic disease management through Ayurvedic principles.",
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
      assignedDoctorId: doctor1ProfileId,
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
      assignedDoctorId: doctor1ProfileId,
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
      assignedDoctorId: doctor1ProfileId,
      qrCode: `PATIENT-${patient3UserId}`,
    });

    // Additional patients
    const patient4UserId = await ctx.db.insert("users", {
      name: "Lakshmi Nair",
      email: "lakshmi@example.com",
      role: "patient",
      preferredLanguage: "hi",
    });

    await ctx.db.insert("patients", {
      userId: patient4UserId,
      phone: "+91-9876543217",
      dateOfBirth: "1995-03-10",
      gender: "Female",
      address: "Berhampur, Odisha",
      emergencyContact: "Krishna Nair",
      emergencyPhone: "+91-9876543218",
      bloodGroup: "AB+",
      allergies: "Peanuts",
      existingConditions: "Migraine, PCOD",
      currentMedications: "Shatavari 500mg, Brahmi 250mg",
      medicalHistory: "Migraine since 2018, Diagnosed PCOD 2021",
      preferredLanguage: "hi",
      assignedDoctorId: doctor1ProfileId,
      qrCode: `PATIENT-${patient4UserId}`,
    });

    const patient5UserId = await ctx.db.insert("users", {
      name: "Rajesh Mohanty",
      email: "rajesh@example.com",
      role: "patient",
      preferredLanguage: "or",
    });

    await ctx.db.insert("patients", {
      userId: patient5UserId,
      phone: "+91-9876543219",
      dateOfBirth: "1970-07-25",
      gender: "Male",
      address: "Sambalpur, Odisha",
      emergencyContact: "Sarojini Mohanty",
      emergencyPhone: "+91-9876543221",
      bloodGroup: "B-",
      allergies: "Dust, Pollen",
      existingConditions: "Asthma, Obesity",
      currentMedications: "Trikatu 300mg, Pippali 200mg",
      medicalHistory: "Asthma since childhood, Weight gain (2022)",
      preferredLanguage: "or",
      assignedDoctorId: doctor1ProfileId,
      qrCode: `PATIENT-${patient5UserId}`,
    });

    // Create demo admin user
    await ctx.db.insert("users", {
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
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const apt1 = await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: today,
      time: "10:00",
      reason: "Follow-up for anxiety treatment",
      status: "scheduled",
      createdAt: now - 86400000 * 2,
    });

    const apt2 = await ctx.db.insert("appointments", {
      patientId: patient2Id,
      doctorId: doctor1ProfileId,
      date: tomorrow,
      time: "11:30",
      reason: "Diabetes management review",
      status: "scheduled",
      createdAt: now - 86400000,
    });

    const apt3 = await ctx.db.insert("appointments", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      date: nextWeek,
      time: "09:00",
      reason: "Blood pressure check",
      status: "scheduled",
      createdAt: now,
    });

    // Today's appointment for another patient
    await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: today,
      time: "14:00",
      reason: "Prakriti assessment",
      status: "scheduled",
      createdAt: now - 86400000,
    });

    // Completed appointments
    await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0],
      time: "14:00",
      reason: "Initial consultation",
      status: "completed",
      createdAt: now - 86400000 * 10,
    });

    await ctx.db.insert("appointments", {
      patientId: patient2Id,
      doctorId: doctor1ProfileId,
      date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      time: "16:00",
      reason: "Herbal medicine adjustment",
      status: "completed",
      createdAt: now - 86400000 * 5,
    });

    await ctx.db.insert("appointments", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      date: yesterday,
      time: "10:30",
      reason: "Hypertension follow-up",
      status: "completed",
      createdAt: now - 86400000 * 2,
    });

    // Cancelled appointment
    await ctx.db.insert("appointments", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0],
      time: "11:00",
      reason: "Lab results review",
      status: "cancelled",
      createdAt: now - 86400000 * 15,
    });

    // Create medical records
    const record1 = await ctx.db.insert("medical_records", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
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
      doctorId: doctor1ProfileId,
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

    await ctx.db.insert("medical_records", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      type: "consultation",
      title: "Hypertension Assessment",
      symptoms: "Headache, occasional dizziness, stress",
      diagnosis: "Rakta Gata Vata (Hypertension)",
      assessment: "Pitta-Vata imbalance with elevated Rakta Dhatu",
      ayurvedaPrakriti: "Pitta",
      ayurvedaVikriti: "Pitta-Vata",
      lifestyleNotes: "Sedentary job, high stress, irregular sleep",
      dietNotes: "High salt intake, prefers fried foods",
      treatmentPlan: "Sariva, Saptamrita Lauha, lifestyle modification",
      createdAt: now - 86400000 * 5,
    });

    // Create prescriptions
    const rx1 = await ctx.db.insert("prescriptions", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
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
      doctorId: doctor1ProfileId,
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

    const rx3 = await ctx.db.insert("prescriptions", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      notes: "Long-term management for hypertension",
      status: "active",
      createdAt: now - 86400000 * 4,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx3,
      medicineName: "Sariva",
      dosage: "300mg",
      frequency: "Twice daily",
      duration: "60 days",
      instructions: "Take with warm water",
      isAyurvedic: true,
    });

    await ctx.db.insert("prescription_items", {
      prescriptionId: rx3,
      medicineName: "Saptamrita Lauha",
      dosage: "250mg",
      frequency: "Twice daily",
      duration: "60 days",
      instructions: "Take after meals with honey",
      isAyurvedic: true,
    });

    // Create reports
    await ctx.db.insert("reports", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      title: "Blood Work - Complete Panel",
      reportType: "blood_test",
      notes: "All values within normal range. Vitamin D slightly low.",
      createdAt: now - 86400000 * 5,
    });

    await ctx.db.insert("reports", {
      patientId: patient2Id,
      doctorId: doctor1ProfileId,
      title: "HbA1c Test",
      reportType: "diabetes_panel",
      notes: "HbA1c at 7.2%. Improving from previous 7.8%.",
      createdAt: now - 86400000 * 2,
    });

    await ctx.db.insert("reports", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      title: "Lipid Profile",
      reportType: "blood_test",
      notes: "LDL slightly elevated. Recommend dietary changes.",
      createdAt: now - 86400000 * 4,
    });

    await ctx.db.insert("reports", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      title: "Thyroid Function Test",
      reportType: "blood_test",
      notes: "TSH within normal limits. No concerns.",
      createdAt: now - 86400000 * 10,
    });

    // Create follow-ups
    await ctx.db.insert("followups", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: nextWeek,
      notes: "Review anxiety medication effectiveness",
      status: "pending",
      reminderSent: false,
      createdAt: now - 86400000,
    });

    await ctx.db.insert("followups", {
      patientId: patient2Id,
      doctorId: doctor1ProfileId,
      date: tomorrow,
      notes: "Check blood sugar levels after medication adjustment",
      status: "pending",
      reminderSent: false,
      createdAt: now,
    });

    await ctx.db.insert("followups", {
      patientId: patient3Id,
      doctorId: doctor1ProfileId,
      date: nextWeek,
      notes: "BP monitoring and medication review",
      status: "pending",
      reminderSent: false,
      createdAt: now,
    });

    await ctx.db.insert("followups", {
      patientId: patient1Id,
      doctorId: doctor1ProfileId,
      date: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0],
      notes: "Initial treatment review",
      status: "completed",
      createdAt: now - 86400000 * 14,
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
      title: "Follow-up Reminder",
      message:
        "You have a follow-up appointment scheduled for next week. Please prepare your BP readings.",
      type: "followup",
      read: false,
      createdAt: now - 86400000,
    });

    await ctx.db.insert("notifications", {
      userId: patient1UserId,
      title: "Welcome to CareSync Pro",
      message:
        "Welcome! Your account has been created. Dr. Priya Sharma will be your primary physician.",
      type: "system",
      read: false,
      createdAt: now - 86400000 * 2,
    });

    await ctx.db.insert("notifications", {
      userId: doctor1UserId,
      title: "New Patient Assigned",
      message: "Rahul Kumar has been assigned to your care.",
      type: "system",
      read: false,
      createdAt: now - 86400000 * 3,
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
      verifiedBy: doctor1ProfileId,
      verifiedAt: now - 86400000,
      verifiedNotes: "Verified against lab report. Diabetes management needed.",
      createdAt: now - 86400000 * 3,
    });

    await ctx.db.insert("documents", {
      patientId: patient3Id,
      uploadedBy: patient1UserId,
      fileName: "bp_reading_log.jpg",
      fileType: "image/jpeg",
      description: "Patient's BP reading log from home monitor",
      ocrExtractedText:
        "BP Readings: 145/92, 140/88, 138/85, 142/90 (over 4 days)",
      ocrVerified: true,
      verifiedBy: doctor1ProfileId,
      verifiedAt: now - 86400000 * 2,
      verifiedNotes: "Readings show borderline hypertension. Continue current medication.",
      createdAt: now - 86400000 * 2,
    });

    // Create audit logs
    await ctx.db.insert("audit_logs", {
      userId: doctor1UserId,
      action: "create_prescription",
      targetTable: "prescriptions",
      targetId: String(rx1),
      details: "Created prescription for Rahul Kumar",
      createdAt: now - 86400000 * 6,
    });

    await ctx.db.insert("audit_logs", {
      userId: doctor1UserId,
      action: "verify_document",
      targetTable: "documents",
      details: "Verified blood test report for Anita Devi",
      createdAt: now - 86400000,
    });

    return "Demo data seeded successfully! 2 doctors, 5 patients, 8 appointments, 3 prescriptions, 4 reports, 4 follow-ups, 5 notifications, 3 documents created.";
  },
});
