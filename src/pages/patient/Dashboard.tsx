import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Pill,
  FileText,
  Clock,
  Bell,
  LogOut,
  Leaf,
  Mic,
  ChevronLeft,
  MicOff,
  Camera,
  Upload,
  X,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { DocumentUploadWithCamera } from "@/components/CameraCapture";

const languages = [
  { code: "en" as const, label: "English" },
  { code: "hi" as const, label: "हिन्दी" },
  { code: "or" as const, label: "ଓଡ଼ିଆ" },
];

type View =
  | "home"
  | "appointments"
  | "prescriptions"
  | "reports"
  | "followups"
  | "voice"
  | "notifications"
  | "documents";

export default function PatientDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [view, setView] = useState<View>("home");

  const appointments = useQuery(api.appointments.list, {});
  const prescriptions = useQuery(api.prescriptions.list, {});
  const notifications = useQuery(api.notifications.list);
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground bg-background sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-green border-2 border-foreground flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-black text-sm">CareSync Pro</span>
          </div>
          <div className="flex items-center gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 text-xs font-bold border-2 border-foreground ${
                  language === lang.code ? "bg-neo-yellow" : ""
                }`}
              >
                {lang.label}
              </button>
            ))}
            <button onClick={handleSignOut} className="p-2 border-2 border-foreground hover:bg-muted">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === "home" && (
          <HomeView
            userName={user?.name || "Patient"}
            t={t}
            language={language}
            setView={setView}
            unreadCount={unreadCount}
          />
        )}
        {view === "appointments" && (
          <AppointmentsView appointments={appointments || []} t={t} setView={setView} />
        )}
        {view === "prescriptions" && (
          <PrescriptionsView prescriptions={prescriptions || []} t={t} setView={setView} />
        )}
        {view === "reports" && <ReportsView t={t} setView={setView} />}
        {view === "followups" && <FollowupsView t={t} setView={setView} />}
        {view === "voice" && <VoiceView t={t} setView={setView} />}
        {view === "documents" && (
          <DocumentsView t={t} setView={setView} language={language} />
        )}
        {view === "notifications" && (
          <NotificationsView
            notifications={notifications || []}
            t={t}
            setView={setView}
          />
        )}
      </main>
    </div>
  );
}

/* ─── Home View ─── */
function HomeView({
  userName,
  t,
  language,
  setView,
  unreadCount,
}: {
  userName: string;
  t: (key: string) => string;
  language: string;
  setView: (v: View) => void;
  unreadCount: number;
}) {
  const menuItems = [
    { icon: Calendar, label: t("patient.nextAppointment"), view: "appointments" as View, color: "bg-neo-blue" },
    { icon: Pill, label: t("patient.myPrescriptions"), view: "prescriptions" as View, color: "bg-neo-green" },
    { icon: FileText, label: t("patient.myReports"), view: "reports" as View, color: "bg-neo-yellow" },
    { icon: Clock, label: t("patient.myFollowups"), view: "followups" as View, color: "bg-neo-orange" },
    { icon: Camera, label: language === "hi" ? "मेरे दस्तावेज़" : language === "or" ? "ମୋର ଦସ୍ତାବିଜ୍" : "My Documents", view: "documents" as View, color: "bg-neo-green/80" },
    { icon: Bell, label: t("patient.notifications"), view: "notifications" as View, color: "bg-muted", count: unreadCount },
  ];

  return (
    <div className="space-y-6">
      <div className="neo-card bg-neo-green p-6">
        <h1 className="text-2xl font-black">{t("patient.greeting")}, {userName} 👋</h1>
        <p className="text-sm mt-1 opacity-80">{t("patient.myHealth")}</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className="w-full neo-card p-5 flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0A0A0A] transition-all text-left"
          >
            <div className={`w-12 h-12 ${item.color} border-2 border-foreground flex items-center justify-center shrink-0`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-base flex-1">{item.label}</span>
            {item.count && item.count > 0 ? (
              <span className="bg-neo-red text-background text-xs font-bold px-2 py-0.5 border-2 border-foreground">{item.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      <button
        onClick={() => setView("voice")}
        className="w-full neo-card bg-neo-yellow p-8 flex flex-col items-center gap-3 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0A0A0A] transition-all"
      >
        <Mic className="w-12 h-12" />
        <span className="font-black text-xl">{t("patient.tapAndSpeak")}</span>
        <span className="text-xs opacity-70">
          {language === "hi" ? "अपने सवाल बोलें" : language === "or" ? "ଆପଣଙ୍କ ପ୍ରଶ୍ନ କୁହନ୍ତୁ" : "Ask your questions in your language"}
        </span>
      </button>
    </div>
  );
}

/* ─── Appointments View ─── */
function AppointmentsView({
  appointments,
  t,
  setView,
}: {
  appointments: Array<Record<string, unknown>>;
  t: (key: string) => string;
  setView: (v: View) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments
    .filter((a) => a.status === "scheduled" && (a.date as string) >= today)
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
  const past = appointments.filter((a) => a.status !== "scheduled");

  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.appointments")}</h1>

      {upcoming.length === 0 ? (
        <div className="neo-card p-8 text-center">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">No upcoming appointments</p>
        </div>
      ) : (
        upcoming.map((apt) => (
          <div key={String(apt._id)} className="neo-card p-4 bg-neo-yellow/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neo-blue border-2 border-foreground flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">{String(apt.doctorName || "Doctor")}</p>
                <p className="text-xs text-muted-foreground">{String(apt.date)} at {String(apt.time)}</p>
                {apt.reason ? <p className="text-xs mt-1">{String(apt.reason)}</p> : null}
              </div>
            </div>
          </div>
        ))
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-bold text-sm mt-4">Past Appointments</h2>
          {past.map((apt) => (
            <div key={String(apt._id)} className="neo-card p-4 opacity-70">
              <p className="font-bold text-sm">{String(apt.doctorName || "Doctor")}</p>
              <p className="text-xs text-muted-foreground">{String(apt.date)} — {String(apt.status)}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ─── Prescriptions View ─── */
function PrescriptionsView({
  prescriptions,
  t,
  setView,
}: {
  prescriptions: Array<Record<string, unknown>>;
  t: (key: string) => string;
  setView: (v: View) => void;
}) {
  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.prescriptions")}</h1>

      {prescriptions.length === 0 ? (
        <div className="neo-card p-8 text-center">
          <Pill className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">No prescriptions</p>
        </div>
      ) : (
        prescriptions.map((rx) => {
          const items = (rx.items || []) as Array<Record<string, unknown>>;
          return (
            <div key={String(rx._id)} className="neo-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm">By {String(rx.doctorName || "Doctor")}</p>
                <span className={`neo-badge px-2 py-1 text-xs ${rx.status === "active" ? "bg-neo-green" : "bg-muted"}`}>
                  {String(rx.status)}
                </span>
              </div>
              {items.map((item) => (
                <div key={String(item._id)} className="bg-secondary p-3 mb-2 border-2 border-foreground">
                  <p className="font-bold text-sm">{String(item.medicineName)}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(item.dosage)} • {String(item.frequency)} • {String(item.duration)}
                  </p>
                  {item.instructions ? (
                    <p className="text-xs mt-1">📋 {String(item.instructions)}</p>
                  ) : null}
                </div>
              ))}
              {rx.notes ? <p className="text-xs text-muted-foreground mt-2">{String(rx.notes)}</p> : null}
            </div>
          );
        })
      )}
    </div>
  );
}

/* ─── Reports View ─── */
function ReportsView({ t, setView }: { t: (key: string) => string; setView: (v: View) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.reports")}</h1>
      <div className="neo-card p-8 text-center">
        <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-bold">No reports yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your doctor will upload reports here</p>
      </div>
    </div>
  );
}

/* ─── Followups View ─── */
function FollowupsView({ t, setView }: { t: (key: string) => string; setView: (v: View) => void }) {
  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.followups")}</h1>
      <div className="neo-card p-8 text-center">
        <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-bold">No follow-ups scheduled</p>
        <p className="text-xs text-muted-foreground mt-1">Your doctor will schedule follow-ups here</p>
      </div>
    </div>
  );
}

/* ─── Documents View ─── */
function DocumentsView({ t, setView, language }: { t: (key: string) => string; setView: (v: View) => void; language: string }) {
  const [showUpload, setShowUpload] = useState(false);
  const patientProfile = useQuery(api.patients.getMyProfile);
  const [capturedDocs, setCapturedDocs] = useState<Array<Record<string, unknown>>>([]);

  const refreshDocs = () => {
    const docs = JSON.parse(localStorage.getItem("captured-docs") || "[]");
    setCapturedDocs(docs);
  };

  // Load docs on mount
  useState(() => {
    refreshDocs();
  });

  const patientDocs = patientProfile
    ? capturedDocs.filter((d) => d.patientId === patientProfile._id)
    : [];

  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{language === "hi" ? "मेरे दस्तावेज़" : language === "or" ? "ମୋର ଦସ୍ତାବିଜ୍" : "My Documents"}</h1>

      {/* Upload Section */}
      <div className="space-y-3">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-full neo-card p-5 flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0A0A0A] transition-all text-left"
        >
          <div className="w-12 h-12 bg-neo-green border-2 border-foreground flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-base block">
              {language === "hi" ? "दस्तावेज़ अपलोड करें" : language === "or" ? "ଦସ୍ତାବିଜ୍ ଅପଲୋଡ୍ କରନ୍ତୁ" : "Upload Prescription or Report"}
            </span>
            <span className="text-xs text-muted-foreground">
              {language === "hi" ? "पुराने नुस्खे या रिपोर्ट की तस्वीर लें" : language === "or" ? "ପୁରୁଣା ପ୍ରେସ୍କ୍ରିପ୍ସନ ବା ରିପୋର୍ଟର ଫୋଟୋ ନିଅନ୍ତୁ" : "Capture old prescriptions or medical reports with your camera"}
            </span>
          </div>
        </button>

        {showUpload && patientProfile && (
          <div className="neo-card p-6">
            <h3 className="font-black text-lg mb-4">
              {language === "hi" ? "कैमरा या फ़ाइल अपलोड" : language === "or" ? "କ୍ୟାମେରା ବା ଫାଇଲ୍ ଅପଲୋଡ୍" : "Camera or File Upload"}
            </h3>
            <DocumentUploadWithCamera
              patientId={patientProfile._id}
              onUploaded={() => {
                setShowUpload(false);
                refreshDocs();
              }}
            />
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {patientDocs.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-bold text-sm">
            {language === "hi" ? `आपके ${patientDocs.length} दस्तावेज़` : language === "or" ? `ଆପଣଙ୍କ ${patientDocs.length} ଦସ୍ତାବିଜ୍` : `Your ${patientDocs.length} Document(s)`}
          </h3>
          {patientDocs.map((doc) => (
            <div key={String(doc._id)} className="neo-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-neo-yellow border-2 border-foreground flex items-center justify-center shrink-0">
                  {String(doc.fileType).includes("pdf") ? "📄" : "🖼️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{String(doc.fileName)}</p>
                  {!!doc.description ? (
                    <p className="text-xs text-muted-foreground">
                      {String(doc.description)}
                    </p>
                  ) : null}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(Number(doc.createdAt)).toLocaleString()}
                  </p>
                </div>
                {!!doc.fileUrl && String(doc.fileUrl).startsWith("data:image") ? (
                  <div className="w-20 h-20 border-2 border-foreground overflow-hidden shrink-0">
                    <img
                      src={String(doc.fileUrl)}
                      alt={String(doc.fileName)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div className="neo-border-sm p-2 mt-3 bg-neo-orange/20">
                <p className="text-[10px] text-muted-foreground italic">
                  {language === "hi" ? "AI/OCR निकाली गई जानकारी — डॉक्टर सत्यापन आवश्यक।" : language === "or" ? "AI/OCR ଟିପ୍ପଣୀ ସୂଚନା — ଡାକ୍ତର ସତ୍ୟାପନ ଆବଶ୍ୟକ।" : "AI/OCR extracted information — Doctor verification required."}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="neo-card p-8 text-center">
          <Camera className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">
            {language === "hi" ? "कोई दस्तावेज़ नहीं" : language === "or" ? "କୌଣସି ଦସ୍ତାବିଜ୍ ନାହିଁ" : "No documents yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "hi" ? "अपने पुराने नुस्खे या रिपोर्ट की तस्वीर लें" : language === "or" ? "ଆପଣଙ୍କ ପୁରୁଣା ପ୍ରେସ୍କ୍ରିପ୍ସନ ବା ରିପୋର୍ଟର ଫୋଟୋ ନିଅନ୍ତୁ" : "Capture or upload your old prescriptions and reports"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Voice View ─── */
function VoiceView({ t, setView }: { t: (key: string) => string; setView: (v: View) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  interface SpeechRecognitionType {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
  }

  const handleStartListening = () => {
    const SpeechRecognitionConstructor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setError(t("voice.notSupported"));
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      processVoiceCommand(text);
    };

    recognition.onerror = () => {
      setError(t("voice.error"));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    setError(null);
    setResponse("");
    recognition.start();
  };

  const processVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("appointment") || lower.includes("अपॉइंटमेंट")) {
      setResponse("Please check the Appointments section for your next appointment details.");
    } else if (lower.includes("prescription") || lower.includes("medicine") || lower.includes("दवा")) {
      setResponse("Please check the Prescriptions section for your current medications.");
    } else if (lower.includes("report") || lower.includes("रिपोर्ट")) {
      setResponse("Please check the Reports section for your medical reports.");
    } else if (lower.includes("follow") || lower.includes("फॉलो-अप")) {
      setResponse("Please check the Follow-ups section for your upcoming follow-up visits.");
    } else {
      setResponse(`I heard: "${text}". Please try asking about appointments, prescriptions, reports, or follow-ups.`);
    }
  };

  const handleSpeak = () => {
    if (response && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.voiceAssistant")}</h1>

      <div className="flex justify-center py-8">
        <button
          onClick={handleStartListening}
          disabled={isListening}
          className={`w-32 h-32 rounded-full border-4 border-foreground flex items-center justify-center transition-all ${
            isListening
              ? "bg-neo-red animate-pulse shadow-[6px_6px_0px_#0A0A0A]"
              : "bg-neo-yellow hover:shadow-[6px_6px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px]"
          }`}
        >
          {isListening ? <MicOff className="w-16 h-16" /> : <Mic className="w-16 h-16" />}
        </button>
      </div>

      {isListening && <div className="text-center"><p className="font-bold text-lg animate-pulse">{t("voice.listening")}</p></div>}
      {error && <div className="neo-card bg-neo-red/20 p-4 text-center"><p className="text-sm font-medium">{error}</p></div>}
      {transcript && (
        <div className="neo-card p-4">
          <p className="text-xs font-bold text-muted-foreground mb-1">You said:</p>
          <p className="text-sm font-medium">{transcript}</p>
        </div>
      )}
      {response && (
        <div className="neo-card bg-neo-green/20 p-4">
          <p className="text-xs font-bold text-muted-foreground mb-1">CareSync Pro says:</p>
          <p className="text-sm font-medium">{response}</p>
          <button onClick={handleSpeak} className="mt-2 text-xs font-bold flex items-center gap-1">🔊 Speak aloud</button>
          <p className="text-[10px] text-muted-foreground mt-2 italic">{t("ai.disclaimer")}</p>
        </div>
      )}
      <div className="neo-card p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Try saying: "When is my next appointment?" or "What are my prescriptions?"
        </p>
      </div>
    </div>
  );
}

/* ─── Notifications View ─── */
function NotificationsView({
  notifications,
  t,
  setView,
}: {
  notifications: Array<Record<string, unknown>>;
  t: (key: string) => string;
  setView: (v: View) => void;
}) {
  const markAsRead = useMutation(api.notifications.markAsRead);

  return (
    <div className="space-y-4">
      <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm font-bold">
        <ChevronLeft className="w-4 h-4" /> {t("common.back")}
      </button>
      <h1 className="text-xl font-black">{t("nav.notifications")}</h1>

      {notifications.length === 0 ? (
        <div className="neo-card p-8 text-center">
          <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("notif.noNotifications")}</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={String(n._id)}
            className={`neo-card p-4 cursor-pointer ${!n.read ? "bg-neo-yellow/20" : ""}`}
            onClick={() => !n.read && markAsRead({ notificationId: n._id as Id<"notifications"> })}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 mt-2 shrink-0 ${!n.read ? "bg-neo-red" : "bg-muted"}`} />
              <div>
                <p className="font-bold text-sm">{String(n.title)}</p>
                <p className="text-xs text-muted-foreground">{String(n.message)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(Number(n.createdAt)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
