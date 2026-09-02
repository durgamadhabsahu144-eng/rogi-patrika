import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if data already exists for this user
    if (user.role === "doctor") {
      const existing = await ctx.db
        .query("doctors")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (existing) {
        // Check if patients already exist for this doctor
        const patients = await ctx.db
          .query("patients")
          .withIndex("by_assignedDoctor", (q) =>
            q.eq("assignedDoctorId", existing._id)
          )
          .collect();
        if (patients.length > 0) {
          return "Demo data already seeded! Check your Patients and Appointments.";
        }
      }
    }

    if (user.role === "patient") {
      const existing = await ctx.db
        .query("patients")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      if (existing) {
        const notifs = await ctx.db
          .query("notifications")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();
        if (notifs.length > 1) {
          return "Demo data already seeded! Check your dashboard.";
        }
      }
    }

    const now = Date.now();

    // ─── DOCTOR ROLE: Create patients + all related data ───
    if (user.role === "doctor") {
      // Ensure doctor profile exists
      let doctorProfile = await ctx.db
        .query("doctors")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (!doctorProfile) {
        const profileId = await ctx.db.insert("doctors", {
          userId,
          specialization: "General Medicine",
          hospital: "RogiPatrika Hospital",
        });
        doctorProfile = await ctx.db.get(profileId);
      }

      if (!doctorProfile) return "Failed to create doctor profile";

      // Create demo patients
      const patient1UserId = await ctx.db.insert("users", {
        name: "Rahul Kumar",
        email: "rahul@example.com",
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
        assignedDoctorId: doctorProfile._id,
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
        assignedDoctorId: doctorProfile._id,
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
        assignedDoctorId: doctorProfile._id,
        qrCode: `PATIENT-${patient3UserId}`,
      });

      // Dates
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      // Appointments
      const apt1 = await ctx.db.insert("appointments", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        date: today,
        time: "10:00",
        reason: "Follow-up for anxiety treatment",
        status: "scheduled",
        createdAt: now - 86400000 * 2,
      });

      const apt2 = await ctx.db.insert("appointments", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        date: tomorrow,
        time: "11:30",
        reason: "Diabetes management review",
        status: "scheduled",
        createdAt: now - 86400000,
      });

      await ctx.db.insert("appointments", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        date: nextWeek,
        time: "09:00",
        reason: "Blood pressure check",
        status: "scheduled",
        createdAt: now,
      });

      await ctx.db.insert("appointments", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        date: today,
        time: "14:00",
        reason: "Prakriti assessment",
        status: "scheduled",
        createdAt: now - 86400000,
      });

      await ctx.db.insert("appointments", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        date: lastWeek,
        time: "14:00",
        reason: "Initial consultation",
        status: "completed",
        createdAt: now - 86400000 * 10,
      });

      await ctx.db.insert("appointments", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        date: threeDaysAgo,
        time: "16:00",
        reason: "Herbal medicine adjustment",
        status: "completed",
        createdAt: now - 86400000 * 5,
      });

      await ctx.db.insert("appointments", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        date: yesterday,
        time: "10:30",
        reason: "Hypertension follow-up",
        status: "completed",
        createdAt: now - 86400000 * 2,
      });

      await ctx.db.insert("appointments", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        date: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0],
        time: "11:00",
        reason: "Lab results review",
        status: "cancelled",
        createdAt: now - 86400000 * 15,
      });

      // Medical Records
      await ctx.db.insert("medical_records", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        appointmentId: apt1,
        type: "consultation",
        title: "Initial Anxiety Assessment",
        symptoms: "Restlessness, mild insomnia, difficulty concentrating",
        diagnosis: "Generalized anxiety - Vata imbalance",
        assessment: "Vata predominant Prakriti with current Vikriti showing elevated Vata",
        ayurvedaPrakriti: "Vata-Pitta",
        ayurvedaVikriti: "Elevated Vata",
        lifestyleNotes: "Irregular sleep schedule, high screen time",
        dietNotes: "Irregular eating patterns, high caffeine intake",
        treatmentPlan: "Ashwagandha, Brahmi, regular sleep schedule, meditation",
        createdAt: now - 86400000 * 7,
      });

      await ctx.db.insert("medical_records", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        appointmentId: apt2,
        type: "consultation",
        title: "Diabetes Management Review",
        symptoms: "Frequent urination, fatigue, mild joint stiffness",
        diagnosis: "Prameha (Diabetes) - Kapha-Vata type",
        ayurvedaPrakriti: "Kapha",
        ayurvedaVikriti: "Kapha-Vata",
        lifestyleNotes: "Moderate physical activity, evening walks",
        dietNotes: "Low sugar diet, prefers wheat-based meals",
        treatmentPlan: "Continue Guggul, add Triphala, daily walks",
        createdAt: now - 86400000 * 3,
      });

      await ctx.db.insert("medical_records", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        type: "consultation",
        title: "Hypertension Assessment",
        symptoms: "Headache, occasional dizziness, stress",
        diagnosis: "Rakta Gata Vata (Hypertension)",
        ayurvedaPrakriti: "Pitta",
        ayurvedaVikriti: "Pitta-Vata",
        lifestyleNotes: "Sedentary job, high stress",
        treatmentPlan: "Sariva, Saptamrita Lauha, lifestyle modification",
        createdAt: now - 86400000 * 5,
      });

      // ── Additional Medical Records ──

      // Rahul - Follow-up for anxiety
      await ctx.db.insert("medical_records", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        type: "follow-up",
        title: "Anxiety Follow-Up — Week 4",
        symptoms: "Improved sleep, reduced restlessness, mild daytime drowsiness",
        diagnosis: "Vata imbalance — responding to treatment",
        assessment: "Significant improvement in sleep quality. Vata reducing. Pitta slightly elevated due to summer season.",
        ayurvedaPrakriti: "Vata-Pitta",
        ayurvedaVikriti: "Mildly elevated Vata (improved)",
        lifestyleNotes: "Started meditation 15 min daily. Screen time reduced to 4 hrs.",
        dietNotes: "Regular meals, reduced caffeine to 1 cup/day. Warm milk at bedtime.",
        treatmentPlan: "Continue Ashwagandha 500mg twice daily. Add Brahmi ghrita 5ml at bedtime.",
        herbMedicineSuggestions: "Ashwagandha Churna, Brahmi Ghrita, Saraswatarishta",
        aiGeneratedSummary: "Patient shows marked improvement in anxiety symptoms after 4 weeks. Sleep quality improved. Recommend continuing current regimen with minor dietary adjustments.",
        createdAt: now - 86400000 * 1,
      });

      // Rahul - Lab review
      await ctx.db.insert("medical_records", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        type: "lab-review",
        title: "Thyroid & Cortisol Panel Review",
        symptoms: "None — routine check",
        diagnosis: "Normal thyroid function. Cortisol slightly elevated (stress-related)",
        assessment: "TSH: 2.8 mIU/L (normal). Free T4: 1.1 ng/dL (normal). Morning cortisol: 18 µg/dL (high-normal, consistent with stress.",
        treatmentPlan: "No medication change. Continue Ashwagandha for cortisol management. Re-test in 3 months.",
        aiGeneratedSummary: "Lab results within normal range. Mild cortisol elevation correlating with patient's stress and anxiety. Current Ashwagandha regimen may be helping normalize levels.",
        createdAt: now - 86400000 * 10,
      });

      // Anita - Diabetes follow-up
      await ctx.db.insert("medical_records", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        type: "follow-up",
        title: "Diabetes Management — 3 Month Review",
        symptoms: "Reduced fatigue, better energy, occasional joint pain",
        diagnosis: "Prameha (Diabetes) — improving with management",
        assessment: "HbA1c dropped from 7.8% to 7.2%. Fasting glucose: 138 mg/dL. Post-prandial: 182 mg/dL. Good progress but target not yet met.",
        ayurvedaPrakriti: "Kapha",
        ayurvedaVikriti: "Kapha reduced, mild Vata emerging",
        lifestyleNotes: "Walking 30 min daily. Joined yoga class 2x/week.",
        dietNotes: "Following low-glycemic diet. Avoiding white rice. Eating millets 4x/week.",
        treatmentPlan: "Continue Guggul 500mg twice daily. Add Guduchi Satva 500mg. Continue walking.",
        herbMedicineSuggestions: "Guggulu, Guduchi Satva, Triphala Churna, Vijaysar (Madhunashini)",
        aiGeneratedSummary: "Patient's diabetes markers showing improvement. HbA1c reduced by 0.6% in 3 months. Lifestyle modifications showing results. Continue current plan with herbal additions.",
        createdAt: now - 86400000 * 2,
      });

      // Anita - Lab review
      await ctx.db.insert("medical_records", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        type: "lab-review",
        title: "Comprehensive Metabolic Panel",
        symptoms: "None — routine lab work",
        diagnosis: "Diabetes Type 2 — moderately controlled",
        assessment: "Fasting Blood Sugar: 138 mg/dL (high). Post Meal: 182 mg/dL (high). HbA1c: 7.2% (improved from 7.8%). Creatinine: 0.9 mg/dL (normal). Lipid panel: Total cholesterol 210 (borderline high).",
        treatmentPlan: "Add Vijaysar churna for lipid management. Re-check lipids in 2 months. Continue diabetes management.",
        aiGeneratedSummary: "Lab work shows improving diabetes control. Cholesterol borderline — recommend dietary modification and herbal support.",
        createdAt: now - 86400000 * 8,
      });

      // Suresh - Hypertension follow-up
      await ctx.db.insert("medical_records", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        type: "follow-up",
        title: "Hypertension Follow-Up — BP Monitoring",
        symptoms: "Occasional morning headache, manageable stress",
        diagnosis: "Rakta Gata Vata — BP slightly improved",
        assessment: "BP readings this week: 142/92, 138/88, 145/90, 136/86, 140/89. Average: 140/89 mmHg. Improved from initial 152/96. Target: below 130/80.",
        ayurvedaPrakriti: "Pitta",
        ayurvedaVikriti: "Pitta-Vata (improving)",
        lifestyleNotes: "Started morning walks 20 min. Reduced work hours slightly.",
        dietNotes: "Low salt diet. Garlic in cooking. Drumstick soup 3x/week. No alcohol.",
        treatmentPlan: "Continue Saptamrita Lauha. Add Arjuna Ksheerapaka. Continue BP monitoring at home.",
        herbMedicineSuggestions: "Saptamrita Lauha, Arjuna, Sariva, Jatamansi, Brahmi",
        aiGeneratedSummary: "BP trending downward with lifestyle changes and herbal support. Patient adherent to treatment. Continue current plan, target below 130/80.",
        createdAt: now - 86400000 * 1,
      });

      // Suresh - Stress assessment
      await ctx.db.insert("medical_records", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        type: "consultation",
        title: "Stress & Mental Health Assessment",
        symptoms: "Work-related stress, mild irritability, difficulty unwinding at night",
        diagnosis: "Pitta-Vata aggravation due to occupational stress",
        assessment: "Pitta aggravation causing irritability and hypertension. Vata contributing to sleep issues. Need stress management alongside BP treatment.",
        ayurvedaPrakriti: "Pitta",
        ayurvedaVikriti: "Pitta elevated, Vata mildly elevated",
        lifestyleNotes: "High-pressure IT job. Screen time 10+ hrs. No exercise routine yet.",
        dietNotes: "Skipping breakfast often. Heavy dinners. High tea intake (4-5 cups).",
        treatmentPlan: "Shirodhara recommended (1 session/week for 4 weeks). Reduce caffeine. Add Brahmi + Jatamansi at bedtime. Guided Pranayama.",
        herbMedicineSuggestions: "Brahmi, Jatamansi, Shankhpushpi, Sarpagandha, Brahmi Vati",
        aiGeneratedSummary: "Occupational stress contributing to both hypertension and sleep issues. Recommending Shirodhara therapy alongside herbal nervines. Reduce caffeine intake.",
        createdAt: now - 86400000 * 4,
      });

      // Rahul - Allergy episode
      await ctx.db.insert("medical_records", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        type: "emergency",
        title: "Seasonal Allergy Episode",
        symptoms: "Sneezing, runny nose, itchy eyes, mild wheezing",
        diagnosis: "Vata-Kapha seasonal allergy (秋季过敏)",
        assessment: "Pollen season triggered allergic rhinitis. Mild lower respiratory involvement. No fever.",
        treatmentPlan: "Haridra (Turmeric) 500mg 3x daily. Nasal irrigation with saline. Triphala eye wash. Avoid cold foods.",
        herbMedicineSuggestions: "Haridra, Triphala, Pippali, Sitopaladi Churna, Lavanga",
        aiGeneratedSummary: "Seasonal allergic rhinitis with mild wheezing. Responding to turmeric and traditional Ayurvedic nasal care. No antibiotics needed.",
        createdAt: now - 86400000 * 12,
      });

      // Prescriptions
      const rx1 = await ctx.db.insert("prescriptions", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
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

      const rx2 = await ctx.db.insert("prescriptions", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
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

      // Reports
      await ctx.db.insert("reports", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        title: "Blood Work - Complete Panel",
        reportType: "blood_test",
        notes: "All values within normal range. Vitamin D slightly low.",
        createdAt: now - 86400000 * 5,
      });

      await ctx.db.insert("reports", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        title: "HbA1c Test",
        reportType: "diabetes_panel",
        notes: "HbA1c at 7.2%. Improving from previous 7.8%.",
        createdAt: now - 86400000 * 2,
      });

      await ctx.db.insert("reports", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        title: "Lipid Profile",
        reportType: "blood_test",
        notes: "LDL slightly elevated. Recommend dietary changes.",
        createdAt: now - 86400000 * 4,
      });

      // Follow-ups
      await ctx.db.insert("followups", {
        patientId: patient1Id,
        doctorId: doctorProfile._id,
        date: nextWeek,
        notes: "Review anxiety medication effectiveness",
        status: "pending",
        reminderSent: false,
        createdAt: now - 86400000,
      });

      await ctx.db.insert("followups", {
        patientId: patient2Id,
        doctorId: doctorProfile._id,
        date: tomorrow,
        notes: "Check blood sugar levels after medication adjustment",
        status: "pending",
        reminderSent: false,
        createdAt: now,
      });

      await ctx.db.insert("followups", {
        patientId: patient3Id,
        doctorId: doctorProfile._id,
        date: nextWeek,
        notes: "BP monitoring and medication review",
        status: "pending",
        reminderSent: false,
        createdAt: now,
      });

      // Notifications for patients
      await ctx.db.insert("notifications", {
        userId: patient1UserId,
        title: "Appointment Reminder",
        message: `You have an appointment today at 10:00 AM with ${user.name}.`,
        type: "appointment",
        read: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: patient2UserId,
        title: "Prescription Ready",
        message: "Your new prescription is ready. Please review the medicines.",
        type: "prescription",
        read: false,
        createdAt: now - 3600000,
      });

      // Documents
      await ctx.db.insert("documents", {
        patientId: patient1Id,
        uploadedBy: patient1UserId,
        fileName: "old_prescription_scan.jpg",
        fileType: "image/jpeg",
        description: "Old handwritten prescription from local Vaidya",
        ocrExtractedText: "Ashwagandha - 500mg, 2 times, Brahmi - 250mg, 2 times, For 15 days",
        ocrVerified: false,
        createdAt: now - 86400000 * 4,
      });

      await ctx.db.insert("documents", {
        patientId: patient2Id,
        uploadedBy: patient2UserId,
        fileName: "blood_test_report.pdf",
        fileType: "application/pdf",
        description: "Blood sugar test report from PathLab",
        ocrExtractedText: "Fasting Blood Sugar: 142 mg/dL, Post Meal: 198 mg/dL, HbA1c: 7.2%",
        ocrVerified: true,
        verifiedBy: doctorProfile._id,
        verifiedAt: now - 86400000,
        verifiedNotes: "Verified against lab report. Diabetes management needed.",
        createdAt: now - 86400000 * 3,
      });

      // Notification for doctor
      await ctx.db.insert("notifications", {
        userId,
        title: "Demo Data Loaded",
        message: "3 demo patients with appointments, prescriptions, and reports have been created.",
        type: "system",
        read: false,
        createdAt: now,
      });

      return "Demo data seeded! You have 3 patients with 8 appointments, prescriptions, reports, and follow-ups.";
    }

    // ─── PATIENT ROLE: Create basic data for the patient ───
    if (user.role === "patient") {
      // Ensure patient profile exists
      let patientProfile = await ctx.db
        .query("patients")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (!patientProfile) {
        const profileId = await ctx.db.insert("patients", {
          userId,
          qrCode: `PATIENT-${userId}`,
          preferredLanguage: "en",
        });
        patientProfile = await ctx.db.get(profileId);
      }

      if (!patientProfile) return "Failed to create patient profile";

      // Create a demo doctor
      const doctorUserId = await ctx.db.insert("users", {
        name: "Dr. Priya Sharma",
        email: "dr.priya@example.com",
        role: "doctor",
      });

      const doctorProfileId = await ctx.db.insert("doctors", {
        userId: doctorUserId,
        specialization: "Ayurvedic Medicine",
        hospital: "RogiPatrika Hospital",
        phone: "+91-9876543210",
      });

      // Update patient to be assigned to this doctor
      await ctx.db.patch(patientProfile._id, {
        assignedDoctorId: doctorProfileId,
        phone: "+91-9876543000",
        dateOfBirth: "1992-06-20",
        gender: "Male",
        bloodGroup: "O+",
        allergies: "None known",
        existingConditions: "Mild seasonal allergies",
        currentMedications: "Vitamin D supplement",
        notes: "Demo patient account",
      });

      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      // Appointments
      await ctx.db.insert("appointments", {
        patientId: patientProfile._id,
        doctorId: doctorProfileId,
        date: tomorrow,
        time: "10:00",
        reason: "General health check-up",
        status: "scheduled",
        createdAt: now - 86400000,
      });

      await ctx.db.insert("appointments", {
        patientId: patientProfile._id,
        doctorId: doctorProfileId,
        date: nextWeek,
        time: "14:00",
        reason: "Follow-up consultation",
        status: "scheduled",
        createdAt: now,
      });

      // Prescription
      const rx = await ctx.db.insert("prescriptions", {
        patientId: patientProfile._id,
        doctorId: doctorProfileId,
        notes: "Take for 7 days",
        status: "active",
        createdAt: now - 86400000 * 2,
      });

      await ctx.db.insert("prescription_items", {
        prescriptionId: rx,
        medicineName: "Ashwagandha Churna",
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Take with warm milk",
        isAyurvedic: true,
      });

      await ctx.db.insert("prescription_items", {
        prescriptionId: rx,
        medicineName: "Triphala Churna",
        dosage: "1 tsp",
        frequency: "Once daily",
        duration: "7 days",
        instructions: "Take at bedtime",
        isAyurvedic: true,
      });

      // Report
      await ctx.db.insert("reports", {
        patientId: patientProfile._id,
        doctorId: doctorProfileId,
        title: "General Blood Test",
        reportType: "blood_test",
        notes: "All values normal. Vitamin D: 18 ng/mL (low).",
        createdAt: now - 86400000 * 5,
      });

      // Follow-up
      await ctx.db.insert("followups", {
        patientId: patientProfile._id,
        doctorId: doctorProfileId,
        date: nextWeek,
        notes: "Review medication and vitamin D levels",
        status: "pending",
        reminderSent: false,
        createdAt: now,
      });

      // Notifications
      await ctx.db.insert("notifications", {
        userId,
        title: "Welcome to RogiPatrika",
        message: "Your health dashboard is ready. View appointments, prescriptions, and reports.",
        type: "system",
        read: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId,
        title: "Upcoming Appointment",
        message: `You have an appointment tomorrow at 10:00 AM with Dr. Priya Sharma.`,
        type: "appointment",
        read: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId,
        title: "New Prescription",
        message: "Dr. Priya Sharma has prescribed Ashwagandha Churna and Triphala Churna.",
        type: "prescription",
        read: false,
        createdAt: now - 86400000,
      });

      return "Demo data seeded! Check your appointments, prescriptions, and reports.";
    }

    // ─── ADMIN ROLE: Create everything ───
    // Create doctor users
    const doctor1UserId = await ctx.db.insert("users", {
      name: "Dr. Priya Sharma",
      email: "doctor@example.com",
      role: "doctor",
    });

    const doctor1ProfileId = await ctx.db.insert("doctors", {
      userId: doctor1UserId,
      specialization: "Ayurvedic Medicine & Panchakarma",
      licenseNumber: "AYU-2024-001",
      hospital: "RogiPatrika Health Center",
      phone: "+91-9876543210",
      bio: "Experienced Ayurvedic practitioner.",
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
      hospital: "RogiPatrika Health Center",
      phone: "+91-9876543220",
    });

    // Patients
    const p1u = await ctx.db.insert("users", { name: "Rahul Kumar", email: "rahul@example.com", role: "patient", preferredLanguage: "en" });
    const p1 = await ctx.db.insert("patients", { userId: p1u, phone: "+91-9876543211", dateOfBirth: "1990-05-15", gender: "Male", bloodGroup: "B+", allergies: "None", existingConditions: "Mild anxiety", currentMedications: "Ashwagandha 500mg", assignedDoctorId: doctor1ProfileId, qrCode: `PATIENT-${p1u}`, preferredLanguage: "en" });

    const p2u = await ctx.db.insert("users", { name: "Anita Devi", email: "anita@example.com", role: "patient", preferredLanguage: "hi" });
    const p2 = await ctx.db.insert("patients", { userId: p2u, phone: "+91-9876543213", dateOfBirth: "1985-08-22", gender: "Female", bloodGroup: "A+", allergies: "Dairy", existingConditions: "Diabetes Type 2", currentMedications: "Metformin, Guggul", assignedDoctorId: doctor1ProfileId, qrCode: `PATIENT-${p2u}`, preferredLanguage: "hi" });

    const p3u = await ctx.db.insert("users", { name: "Suresh Patel", email: "suresh@example.com", role: "patient", preferredLanguage: "or" });
    const p3 = await ctx.db.insert("patients", { userId: p3u, phone: "+91-9876543215", dateOfBirth: "1978-12-01", gender: "Male", bloodGroup: "O+", allergies: "Shellfish", existingConditions: "Hypertension", currentMedications: "Brahmi, Jatamansi", assignedDoctorId: doctor1ProfileId, qrCode: `PATIENT-${p3u}`, preferredLanguage: "or" });

    // Dates
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Appointments
    await ctx.db.insert("appointments", { patientId: p1, doctorId: doctor1ProfileId, date: today, time: "10:00", reason: "Follow-up", status: "scheduled", createdAt: now });
    await ctx.db.insert("appointments", { patientId: p2, doctorId: doctor1ProfileId, date: tomorrow, time: "11:30", reason: "Diabetes review", status: "scheduled", createdAt: now });
    await ctx.db.insert("appointments", { patientId: p3, doctorId: doctor1ProfileId, date: nextWeek, time: "09:00", reason: "BP check", status: "scheduled", createdAt: now });
    await ctx.db.insert("appointments", { patientId: p1, doctorId: doctor1ProfileId, date: yesterday, time: "14:00", reason: "Consultation", status: "completed", createdAt: now });

    // Prescriptions — Rahul Kumar (Anxiety & Thyroid)
    const rx1 = await ctx.db.insert("prescriptions", { patientId: p1, doctorId: doctor1ProfileId, notes: "Continue current regimen. Review thyroid levels after 30 days. Avoid caffeine after 6 PM. Practice pranayama daily.", status: "active", createdAt: now });
    await ctx.db.insert("prescription_items", { prescriptionId: rx1, medicineName: "Ashwagandha Churna", dosage: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "With warm milk before bedtime", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx1, medicineName: "Brahmi Vati", dosage: "250mg", frequency: "Once daily", duration: "30 days", instructions: "After breakfast for mental clarity", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx1, medicineName: "Levothyroxine", dosage: "50mcg", frequency: "Once daily", duration: "30 days", instructions: "Empty stomach, 30 minutes before breakfast" });

    // Prescriptions — Anita Devi (Diabetes & Cholesterol)
    const rx2 = await ctx.db.insert("prescriptions", { patientId: p2, doctorId: doctor1ProfileId, notes: "Strict sugar control. Walk 30 minutes daily. Avoid fried and sweet foods. HbA1c re-check in 3 months.", status: "active", createdAt: now - 86400000 * 5 });
    await ctx.db.insert("prescription_items", { prescriptionId: rx2, medicineName: "Guggulu Churna", dosage: "1gm", frequency: "Twice daily", duration: "60 days", instructions: "With warm water after meals", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx2, medicineName: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "60 days", instructions: "With meals to reduce stomach upset" });
    await ctx.db.insert("prescription_items", { prescriptionId: rx2, medicineName: "Triphala Churna", dosage: "3gm", frequency: "Once daily", duration: "60 days", instructions: "Before bedtime with warm water for digestion", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx2, medicineName: "Amla Juice", dosage: "15ml", frequency: "Once daily", duration: "30 days", instructions: "Morning empty stomach for immunity", isAyurvedic: true });

    // Prescriptions — Suresh Patel (Hypertension & Sleep)
    const rx3 = await ctx.db.insert("prescriptions", { patientId: p3, doctorId: doctor1ProfileId, notes: "Monitor BP twice daily. Reduce salt intake. Practice Shirodhara therapy weekly. Follow-up in 2 weeks.", status: "active", createdAt: now - 86400000 * 2 });
    await ctx.db.insert("prescription_items", { prescriptionId: rx3, medicineName: "Brahmi Syrup", dosage: "15ml", frequency: "Twice daily", duration: "21 days", instructions: "After meals for stress relief and BP control", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx3, medicineName: "Jatamansi Churna", dosage: "250mg", frequency: "Once daily", duration: "21 days", instructions: "Before bedtime for better sleep", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx3, medicineName: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Morning, same time every day" });

    // Prescriptions — Rahul Kumar (Completed — earlier visit)
    const rx4 = await ctx.db.insert("prescriptions", { patientId: p1, doctorId: doctor1ProfileId, notes: "Initial 14-day course for seasonal allergy. Completed successfully.", status: "completed", createdAt: now - 86400000 * 21 });
    await ctx.db.insert("prescription_items", { prescriptionId: rx4, medicineName: "Haridra Churna", dosage: "1gm", frequency: "Twice daily", duration: "14 days", instructions: "With honey for seasonal allergies", isAyurvedic: true });
    await ctx.db.insert("prescription_items", { prescriptionId: rx4, medicineName: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "7 days", instructions: "At bedtime for sneezing and runny nose" });

    // Reports
    await ctx.db.insert("reports", { patientId: p1, doctorId: doctor1ProfileId, title: "Complete Blood Count (CBC)", reportType: "blood_test", notes: "Hemoglobin: 13.2 g/dL (normal), WBC: 7,800/uL (normal), Platelets: 2,40,000/uL (normal). All values within healthy range.", createdAt: now - 86400000 * 7 });
    await ctx.db.insert("reports", { patientId: p1, doctorId: doctor1ProfileId, title: "Thyroid Profile (TSH, T3, T4)", reportType: "thyroid_panel", notes: "TSH: 3.2 uIU/mL (borderline high), Free T3: 2.8 pg/mL (normal), Free T4: 1.1 ng/dL (normal). Recommend dietary iodine review.", createdAt: now - 86400000 * 3 });
    await ctx.db.insert("reports", { patientId: p1, doctorId: doctor1ProfileId, title: "Vitamin D & B12 Panel", reportType: "blood_test", notes: "Vitamin D: 18 ng/mL (deficient — below 20), Vitamin B12: 380 pg/mL (low-normal). Ashwagandha and Brahmi supplementation recommended.", createdAt: now - 86400000 * 1 });
    await ctx.db.insert("reports", { patientId: p2, doctorId: doctor1ProfileId, title: "HbA1c Diabetes Panel", reportType: "diabetes_panel", notes: "HbA1c: 7.2% (improved from 7.8% three months ago). Fasting Blood Sugar: 138 mg/dL. Post-prandial: 198 mg/dL. Good progress with Guggulu + Triphala regimen.", createdAt: now - 86400000 * 2 });
    await ctx.db.insert("reports", { patientId: p2, doctorId: doctor1ProfileId, title: "Lipid Profile", reportType: "lipid_profile", notes: "Total Cholesterol: 232 mg/dL (borderline high), LDL: 148 mg/dL (high), HDL: 42 mg/dL (low), Triglycerides: 178 mg/dL. Dietary modification and Triphala recommended.", createdAt: now - 86400000 * 5 });
    await ctx.db.insert("reports", { patientId: p2, doctorId: doctor1ProfileId, title: "Liver Function Test (LFT)", reportType: "liver_function", notes: "SGOT: 38 U/L (normal), SGPT: 42 U/L (slightly elevated), ALP: 95 U/L (normal). Mild hepatic stress — reduce spicy food.", createdAt: now - 86400000 * 1 });
    await ctx.db.insert("reports", { patientId: p3, doctorId: doctor1ProfileId, title: "Blood Pressure Monitoring Report", reportType: "other", notes: "Average BP over 7 days: 142/89 mmHg. Morning readings: 148/92. Evening: 136/86. Slightly elevated — continue Brahmi and Jatamansi. Monitor daily.", createdAt: now - 86400000 * 3 });
    await ctx.db.insert("reports", { patientId: p3, doctorId: doctor1ProfileId, title: "Renal Function Panel", reportType: "kidney_function", notes: "Creatinine: 1.1 mg/dL (normal), BUN: 18 mg/dL (normal), eGFR: 88 mL/min (normal). Kidney function adequate for age.", createdAt: now - 86400000 * 6 });
    await ctx.db.insert("reports", { patientId: p3, doctorId: doctor1ProfileId, title: "ECG — Resting", reportType: "ecg", notes: "Normal sinus rhythm, rate 72 bpm. No ST-segment changes. No axis deviation. Within normal limits.", createdAt: now - 86400000 * 4 });
    await ctx.db.insert("reports", { patientId: p3, doctorId: doctor2UserId ? doctor1ProfileId : doctor1ProfileId, title: "Ayurvedic Prakriti Assessment", reportType: "ayurvedic_assessment", notes: "Prakriti: Vata-Kapha (mixed). Vikriti: Vata predominant (dryness, restlessness, irregular sleep). Dosha imbalance linked to elevated BP and anxiety. Shirodhara therapy recommended.", createdAt: now - 86400000 * 2 });

    // Follow-ups
    await ctx.db.insert("followups", { patientId: p1, doctorId: doctor1ProfileId, date: nextWeek, notes: "Medication review", status: "pending", reminderSent: false, createdAt: now });

    return "Admin demo data seeded! 2 doctors, 3 patients, appointments, prescriptions, reports.";
  },
});
