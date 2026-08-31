export type Language = "en" | "hi" | "or";

export const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    or: "ଡ୍ୟାସବୋର୍ଡ",
  },
  "nav.patients": {
    en: "Patients",
    hi: "मरीज़",
    or: "ରୋଗୀ",
  },
  "nav.appointments": {
    en: "Appointments",
    hi: "अपॉइंटमेंट",
    or: "ଅପଏଣ୍ଟମେଣ୍ଟ",
  },
  "nav.medicalRecords": {
    en: "Medical Records",
    hi: "मेडिकल रिकॉर्ड",
    or: "ମେଡିକାଲ ରେକର୍ଡ",
  },
  "nav.prescriptions": {
    en: "Prescriptions",
    hi: "प्रिस्क्रिप्शन",
    or: "ପ୍ରେସକ୍ରିପସନ",
  },
  "nav.reports": {
    en: "Reports",
    hi: "रिपोर्ट",
    or: "ରିପୋର୍ଟ",
  },
  "nav.followups": {
    en: "Follow-ups",
    hi: "फॉलो-अप",
    or: "ଫଲୋ-ଅପ",
  },
  "nav.documents": {
    en: "Documents",
    hi: "दस्तावेज़",
    or: "ଡକୁମେଣ୍ଟ",
  },
  "nav.alerts": {
    en: "Alerts",
    hi: "अलर्ट",
    or: "ଚେତାବନୀ",
  },
  "nav.voiceAssistant": {
    en: "Voice Assistant",
    hi: "वॉइस असिस्टेंट",
    or: "ଭଏସ୍ ସହାୟକ",
  },
  "nav.profile": {
    en: "Profile",
    hi: "प्रोफाइल",
    or: "ପ୍ରୋଫାଇଲ",
  },
  "nav.logout": {
    en: "Logout",
    hi: "लॉगआउट",
    or: "ଲଗଆଉଟ",
  },
  "nav.adminPanel": {
    en: "Admin Panel",
    hi: "एडमिन पैनल",
    or: "ଆଡମିନ ପ୍ୟାନେଲ",
  },
  "nav.doctors": {
    en: "Doctors",
    hi: "डॉक्टर",
    or: "ଡାକ୍ତର",
  },
  "nav.users": {
    en: "Users",
    hi: "उपयोगकर्ता",
    or: "ଉପୟୋଗକର୍ତ୍ତା",
  },
  "nav.settings": {
    en: "Settings",
    hi: "सेटिंग्स",
    or: "ସେଟିଂସ୍",
  },

  // Landing page
  "landing.heroTitle": {
    en: "CareConnect",
    hi: "CareConnect",
    or: "CareConnect",
  },
  "landing.heroSubtitle": {
    en: "Patient Case-Taking Software",
    hi: "पेशेंट केस-टेकिंग सॉफ्टवेयर",
    or: "ପେସିଏଣ୍ଟ କେସ୍-ଟେକିଂ ସଫ୍ଟୱେୟାର",
  },
  "landing.heroDescription": {
    en: "A smart, structured, and Ayurvedic-aligned digital solution to capture and manage patient data for accurate diagnosis, treatment, and follow-up.",
    hi: "सटीक निदान, उपचार और फॉलो-अप के लिए रोगी डेटा को कैप्चर और प्रबंधित करने के लिए एक स्मार्ट, संरचित और आयुर्वेदिक-संरेखित डिजिटल समाधान।",
    or: "ସଠିକ୍ ରୋଗ ନିର୍ଣ୍ଣୟ, ଚିକିତ୍ସା ଏବଂ ଫଲୋ-ଅପ୍ ପାଇଁ ରୋଗୀ ତଥ୍ୟ ଅଧିଗ୍ରହଣ ଏବଂ ପରିଚାଳନା ପାଇଁ ଏକ ସ୍ମାର୍ଟ, ସଂଗଠିତ ଏବଂ ଆୟୁର୍ବେଦିକ-ସଂରେଖିତ ଡିଜିଟାଲ ସମାଧାନ।",
  },
  "landing.getStarted": {
    en: "Get Started",
    hi: "शुरू करें",
    or: "ଆରମ୍ଭ କରନ୍ତୁ",
  },
  "landing.doctorLogin": {
    en: "Doctor Login",
    hi: "डॉक्टर लॉगिन",
    or: "ଡାକ୍ତର ଲଗଇନ",
  },
  "landing.patientLogin": {
    en: "Patient Login",
    hi: "मरीज़ लॉगिन",
    or: "ରୋଗୀ ଲଗଇନ",
  },
  "landing.adminLogin": {
    en: "Admin Login",
    hi: "एडमिन लॉगिन",
    or: "ଆଡମିନ ଲଗଇନ",
  },
  "landing.featuresTitle": {
    en: "Key Features",
    hi: "मुख्य विशेषताएं",
    or: "ମୁଖ୍ୟ ବୈଶିଷ୍ଟ୍ୟ",
  },
  "landing.impactTitle": {
    en: "Impact & Benefits",
    hi: "प्रभाव और लाभ",
    or: "ପ୍ରଭାବ ଏବଂ ଲାଭ",
  },
  "landing.securityTitle": {
    en: "Security & Privacy",
    hi: "सुरक्षा और गोपनीयता",
    or: "ସୁରକ୍ଷା ଏବଂ ଗୋପନୀୟତା",
  },

  // Dashboard
  "dashboard.welcome": {
    en: "Welcome",
    hi: "स्वागत है",
    or: "ସ୍ୱାଗତ",
  },
  "dashboard.totalPatients": {
    en: "Total Patients",
    hi: "कुल मरीज़",
    or: "ମୋଟ ରୋଗୀ",
  },
  "dashboard.todayAppointments": {
    en: "Today's Appointments",
    hi: "आज की अपॉइंटमेंट",
    or: "ଆଜିର ଅପଏଣ୍ଟମେଣ୍ଟ",
  },
  "dashboard.pendingFollowups": {
    en: "Pending Follow-ups",
    hi: "लंबित फॉलो-अप",
    or: "ବିଚାରାଧୀନ ଫଲୋ-ଅପ",
  },
  "dashboard.scheduledAppointments": {
    en: "Scheduled",
    hi: "निर्धारित",
    or: "ନିର୍ଦ୍ଧାରିତ",
  },
  "dashboard.recentPatients": {
    en: "Recent Patients",
    hi: "हाल के मरीज़",
    or: "ସାମ୍ପ୍ରତିକ ରୋଗୀ",
  },
  "dashboard.upcomingAppointments": {
    en: "Upcoming Appointments",
    hi: "आगामी अपॉइंटमेंट",
    or: "ଆସନ୍ତା ଅପଏଣ୍ଟମେଣ୍ଟ",
  },
  "dashboard.recentActivity": {
    en: "Recent Activity",
    hi: "हाल की गतिविधि",
    or: "ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ",
  },
  "dashboard.noActivity": {
    en: "No recent activity",
    hi: "कोई हाल की गतिविधि नहीं",
    or: "କୌଣସି ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ ନାହିଁ",
  },

  // Patient Dashboard
  "patient.greeting": {
    en: "Hello",
    hi: "नमस्ते",
    or: "ନମସ୍କାର",
  },
  "patient.myHealth": {
    en: "My Health",
    hi: "मेरा स्वास्थ्य",
    or: "ମୋ ସ୍ୱାସ୍ଥ୍ୟ",
  },
  "patient.nextAppointment": {
    en: "Next Appointment",
    hi: "अगली अपॉइंटमेंट",
    or: "ପରବର୍ତ୍ତୀ ଅପଏଣ୍ଟମେଣ୍ଟ",
  },
  "patient.myPrescriptions": {
    en: "My Prescriptions",
    hi: "मेरी प्रिस्क्रिप्शन",
    or: "ମୋ ପ୍ରେସକ୍ରିପସନ",
  },
  "patient.myReports": {
    en: "My Reports",
    hi: "मेरी रिपोर्ट",
    or: "ମୋ ରିପୋର୍ଟ",
  },
  "patient.myFollowups": {
    en: "My Follow-ups",
    hi: "मेरे फॉलो-अप",
    or: "ମୋ ଫଲୋ-ଅପ",
  },
  "patient.doctorInstructions": {
    en: "Doctor Instructions",
    hi: "डॉक्टर निर्देश",
    or: "ଡାକ୍ତର ନିର୍ଦ୍ଦେଶ",
  },
  "patient.notifications": {
    en: "Notifications",
    hi: "सूचनाएं",
    or: "ବିଜ୍ଞପ୍ତି",
  },
  "patient.tapAndSpeak": {
    en: "Tap and Speak",
    hi: "टैप करें और बोलें",
    or: "ଟ୍ୟାପ୍ କରନ୍ତୁ ଏବଂ କୁହନ୍ତୁ",
  },
  "patient.uploadDocument": {
    en: "Upload Document",
    hi: "दस्तावेज़ अपलोड करें",
    or: "ଡକୁମେଣ୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ",
  },

  // Common
  "common.save": {
    en: "Save",
    hi: "सहेजें",
    or: "ସଞ୍ଚୟ କରନ୍ତୁ",
  },
  "common.cancel": {
    en: "Cancel",
    hi: "रद्द करें",
    or: "ବାତିଲ୍ କରନ୍ତୁ",
  },
  "common.delete": {
    en: "Delete",
    hi: "हटाएं",
    or: "ହଟାନ୍ତୁ",
  },
  "common.edit": {
    en: "Edit",
    hi: "संपादित करें",
    or: "ସମ୍ପାଦନା କରନ୍ତୁ",
  },
  "common.view": {
    en: "View",
    hi: "देखें",
    or: "ଦେଖନ୍ତୁ",
  },
  "common.search": {
    en: "Search",
    hi: "खोजें",
    or: "ସନ୍ଧାନ କରନ୍ତୁ",
  },
  "common.loading": {
    en: "Loading...",
    hi: "लोड हो रहा है...",
    or: "ଲୋଡ୍ ହେଉଛି...",
  },
  "common.error": {
    en: "Error",
    hi: "त्रुटि",
    or: "ତ୍ରୁଟି",
  },
  "common.retry": {
    en: "Retry",
    hi: "पुनः प्रयास करें",
    or: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ",
  },
  "common.noData": {
    en: "No data available",
    hi: "कोई डेटा उपलब्ध नहीं",
    or: "କୌଣସି ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ",
  },
  "common.addNew": {
    en: "Add New",
    hi: "नया जोड़ें",
    or: "ନୂତନ ଯୋଗ କରନ୍ତୁ",
  },
  "common.status": {
    en: "Status",
    hi: "स्थिति",
    or: "ସ୍ଥିତି",
  },
  "common.date": {
    en: "Date",
    hi: "तारीख",
    or: "ତାରିଖ",
  },
  "common.time": {
    en: "Time",
    hi: "समय",
    or: "ସମୟ",
  },
  "common.name": {
    en: "Name",
    hi: "नाम",
    or: "ନାମ",
  },
  "common.email": {
    en: "Email",
    hi: "ईमेल",
    or: "ଇମେଲ",
  },
  "common.phone": {
    en: "Phone",
    hi: "फ़ोन",
    or: "ଫୋନ୍",
  },
  "common.notes": {
    en: "Notes",
    hi: "नोट्स",
    or: "ନୋଟ୍ସ",
  },
  "common.close": {
    en: "Close",
    hi: "बंद करें",
    or: "ବନ୍ଦ କରନ୍ତୁ",
  },
  "common.confirm": {
    en: "Confirm",
    hi: "पुष्टि करें",
    or: "ନିଶ୍ଚିତ କରନ୍ତୁ",
  },
  "common.back": {
    en: "Back",
    hi: "वापस",
    or: "ପଛକୁ",
  },
  "common.next": {
    en: "Next",
    hi: "अगला",
    or: "ପରବର୍ତ୍ତୀ",
  },

  // Status labels
  "status.scheduled": {
    en: "Scheduled",
    hi: "निर्धारित",
    or: "ନିର୍ଦ୍ଧାରିତ",
  },
  "status.completed": {
    en: "Completed",
    hi: "पूर्ण",
    or: "ସମ୍ପୂର୍ଣ୍ଣ",
  },
  "status.cancelled": {
    en: "Cancelled",
    hi: "रद्द",
    or: "ବାତିଲ୍",
  },
  "status.missed": {
    en: "Missed",
    hi: "छूटा हुआ",
    or: "ଛାଡ଼ିଥିଲା",
  },
  "status.pending": {
    en: "Pending",
    hi: "लंबित",
    or: "ବିଚାରାଧୀନ",
  },
  "status.active": {
    en: "Active",
    hi: "सक्रिय",
    or: "ସକ୍ରିୟ",
  },

  // Notifications
  "notif.markAllRead": {
    en: "Mark all as read",
    hi: "सभी पठित चिन्हित करें",
    or: "ସମସ୍ତଙ୍କୁ ପଠିତ ଚିହ୍ନିତ କରନ୍ତୁ",
  },
  "notif.noNotifications": {
    en: "No new notifications",
    hi: "कोई नई सूचना नहीं",
    or: "କୌଣସି ନୂତନ ବିଜ୍ଞପ୍ତି ନାହିଁ",
  },

  // Voice
  "voice.listening": {
    en: "Listening...",
    hi: "सुन रहा है...",
    or: "ଶୁଣୁଛି...",
  },
  "voice.speaking": {
    en: "Speaking...",
    hi: "बोल रहा है...",
    or: "କହୁଛି...",
  },
  "voice.notSupported": {
    en: "Voice is not supported in this browser",
    hi: "इस ब्राउज़र में वॉइस सपोर्ट नहीं है",
    or: "ଏହି ବ୍ରାଉଜରେ ଭଏସ୍ ସପୋର୍ଟ ନାହିଁ",
  },
  "voice.error": {
    en: "Could not understand. Please try again.",
    hi: "समझ नहीं आया। कृपया पुनः प्रयास करें।",
    or: "ବୁଝିପାରିଲି ନାହିଁ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",
  },

  // Role selection
  "role.selectRole": {
    en: "Select your role",
    hi: "अपनी भूमिका चुनें",
    or: "ଆପଣଙ୍କ ଭୂମିକା ବାଛନ୍ତୁ",
  },
  "role.doctor": {
    en: "Doctor",
    hi: "डॉक्टर",
    or: "ଡାକ୍ତର",
  },
  "role.patient": {
    en: "Patient",
    hi: "मरीज़",
    or: "ରୋଗୀ",
  },
  "role.admin": {
    en: "Admin",
    hi: "एडमिन",
    or: "ଆଡମିନ",
  },

  // AI disclaimer
  "ai.disclaimer": {
    en: "AI-assisted — verify with healthcare professional.",
    hi: "AI-सहायता प्राप्त — स्वास्थ्य पेशेवर से सत्यापित करें।",
    or: "AI-ସହାୟିତ — ସ୍ୱାସ୍ଥ୍ୟ ପେଶାଦାରଙ୍କ ସହ ଯାଞ୍ଚ କରନ୍ତୁ।",
  },
  "ai.summaryDisclaimer": {
    en: "AI-generated summary — verify patient records.",
    hi: "AI-जनित सारांश — मरीज़ रिकॉर्ड सत्यापित करें।",
    or: "AI-ଜନିତ ସାରାଂଶ — ରୋଗୀ ରେକର୍ଡ ଯାଞ୍ଚ କରନ୍ତୁ।",
  },
  "ai.ocrDisclaimer": {
    en: "AI/OCR extracted — Doctor verification required.",
    hi: "AI/OCR निकाला गया — डॉक्टर सत्यापन आवश्यक।",
    or: "AI/OCR ଏକ୍ଷଟ୍ରାକ୍ଟ — ଡାକ୍ତର ଯାଞ୍ଚ ଆବଶ୍ୟକ।",
  },
  "ai.priorityDisclaimer": {
    en: "AI-assisted priority. Final decision with healthcare professional.",
    hi: "AI-सहायित प्राथमिकता। अंतिम निर्णय स्वास्थ्य पेशेवर के साथ।",
    or: "AI-ସହାୟିତ ପ୍ରାଥମିକତା। ଚୂଡ଼ାନ୍ତ ନିର୍ଣ୍ଣୟ ସ୍ୱାସ୍ଥ୍ୟ ପେଶାଦାରଙ୍କ ସହ।",
  },
};

export function t(key: string, lang: Language = "en"): string {
  return translations[key]?.[lang] || translations[key]?.["en"] || key;
}
