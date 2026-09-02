import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Pill,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Check,
  XIcon,
  Clock,
  AlertTriangle,
  Leaf,
  ChevronRight,
  Loader2,
  Camera,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { DocumentUploadWithCamera } from "@/components/CameraCapture";
import IntakeForm from "@/components/IntakeForm";
import PrescriptionForm from "@/components/PrescriptionForm";

type View =
  | "dashboard"
  | "patients"
  | "appointments"
  | "prescriptions"
  | "records"
  | "reports"
  | "followups"
  | "documents"
  | "notifications";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doctorProfile = useQuery(api.doctors.getMyProfile);
  const stats = useQuery(api.stats.doctorStats);
  const notifications = useQuery(api.notifications.list);

  const markAllRead = useMutation(api.notifications.markAllAsRead);
  const seedDemo = useMutation(api.seed.seedDemoData);
  const [seeding, setSeeding] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    if (
      !seededRef.current &&
      stats !== undefined &&
      stats !== null &&
      (stats as { totalPatients?: number }).totalPatients === 0
    ) {
      seededRef.current = true;
      setSeeding(true);
      seedDemo()
        .then(() => {
          setSeeding(false);
        })
        .catch(() => {
          setSeeding(false);
        });
    }
  }, [stats, seedDemo]);

  const sidebarItems: {
    icon: typeof LayoutDashboard;
    label: string;
    key: View;
  }[] = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), key: "dashboard" },
    { icon: Users, label: t("nav.patients"), key: "patients" },
    { icon: Calendar, label: t("nav.appointments"), key: "appointments" },
    { icon: ClipboardList, label: t("nav.medicalRecords"), key: "records" },
    { icon: Pill, label: t("nav.prescriptions"), key: "prescriptions" },
    { icon: FileText, label: t("nav.reports"), key: "reports" },
    { icon: Clock, label: t("nav.followups"), key: "followups" },
    { icon: FileText, label: t("nav.documents"), key: "documents" },
    { icon: Bell, label: t("nav.alerts"), key: "notifications" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const unreadNotifs = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#E2E8F0] z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[#0F172A]">RogiPatrika</span>
          </div>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setView(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                view === item.key
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
              {item.key === "notifications" && unreadNotifs > 0 && (
                <span className="ml-auto bg-[#DC2626] text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#E2E8F0]">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold truncate text-[#0F172A]">
              {user?.name || "Doctor"}
            </p>
            <p className="text-xs text-[#64748B] truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-[#0F172A]" />
          </button>
          <h1 className="font-bold text-lg text-[#0F172A]">
            {sidebarItems.find((i) => i.key === view)?.label || "Dashboard"}
          </h1>
          {seeding && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#D97706] ml-4">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading demo data...
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {unreadNotifs > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs font-medium text-[#64748B] hover:text-[#2563EB] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {view === "dashboard" && (
            <DashboardView stats={stats} t={t} setView={setView} />
          )}
          {view === "patients" && <PatientsView />}
          {view === "appointments" && <AppointmentsView />}
          {view === "prescriptions" && <PrescriptionsView />}
          {view === "records" && <RecordsView doctorProfile={doctorProfile} />}
          {view === "reports" && <ReportsView />}
          {view === "followups" && <FollowupsView />}
          {view === "documents" && <DocumentsView />}
          {view === "notifications" && (
            <NotificationsView notifications={notifications || []} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Dashboard View ─── */
function DashboardView({
  stats,
  t,
  setView,
}: {
  stats: Record<string, unknown> | null | undefined;
  t: (key: string) => string;
  setView: (v: View) => void;
}) {
  if (stats === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        <span className="text-[#64748B]">{t("common.loading")}</span>
      </div>
    );
  }

  const totalPatients = (stats as { totalPatients?: number })?.totalPatients || 0;
  const todayAppointments = (stats as { todayAppointments?: number })?.todayAppointments || 0;
  const pendingFollowups = (stats as { pendingFollowups?: number })?.pendingFollowups || 0;
  const scheduledAppointments = (stats as { scheduledAppointments?: number })?.scheduledAppointments || 0;
  const upcomingAppointments = (stats as { upcomingAppointments?: Array<Record<string, unknown>> })?.upcomingAppointments || [];
  const recentPatients = (stats as { recentPatients?: Array<Record<string, unknown>> })?.recentPatients || [];

  const statCards = [
    { label: t("dashboard.totalPatients"), value: totalPatients, color: "bg-[#DBEAFE] text-[#2563EB]", icon: Users },
    { label: t("dashboard.todayAppointments"), value: todayAppointments, color: "bg-[#D1FAE5] text-[#059669]", icon: Calendar },
    { label: t("dashboard.pendingFollowups"), value: pendingFollowups, color: "bg-[#FEF3C7] text-[#D97706]", icon: Clock },
    { label: t("dashboard.scheduledAppointments"), value: scheduledAppointments, color: "bg-[#EDE9FE] text-[#7C3AED]", icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="health-stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{card.value}</p>
                <p className="text-xs font-medium text-[#64748B]">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="health-card-static">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">{t("dashboard.upcomingAppointments")}</h2>
            <button
              onClick={() => setView("appointments")}
              className="text-xs font-medium text-[#2563EB] flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {upcomingAppointments.length === 0 ? (
              <p className="p-4 text-sm text-[#64748B]">{t("common.noData")}</p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={String(apt._id)} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-[#0F172A]">{String(apt.patientName || "Patient")}</p>
                    <p className="text-xs text-[#64748B]">
                      {String(apt.date)} at {String(apt.time)}
                    </p>
                  </div>
                  <span className="health-badge bg-[#EFF6FF] text-[#2563EB]">
                    {String(apt.reason || "Consultation")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="health-card-static">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">{t("dashboard.recentPatients")}</h2>
            <button
              onClick={() => setView("patients")}
              className="text-xs font-medium text-[#2563EB] flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentPatients.length === 0 ? (
              <p className="p-4 text-sm text-[#64748B]">{t("common.noData")}</p>
            ) : (
              recentPatients.map((p) => (
                <div key={String(p.id)} className="p-4">
                  <p className="font-medium text-sm text-[#0F172A]">{String(p.name)}</p>
                  <p className="text-xs text-[#64748B]">{String(p.email || "")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Patients View ─── */
function PatientsView() {
  const { t } = useLanguage();
  const patients = useQuery(api.patients.list, {});
  const createPatient = useMutation(api.patients.create);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", gender: "", dateOfBirth: "",
    bloodGroup: "", allergies: "", existingConditions: "",
    currentMedications: "", notes: "",
  });
  const doctorProfile2 = useQuery(api.doctors.getMyProfile);

  if (patients === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        <span className="text-[#64748B]">{t("common.loading")}</span>
      </div>
    );
  }

  const filtered = search
    ? patients.filter(
        (p) =>
          p.userName?.toLowerCase().includes(search.toLowerCase()) ||
          p.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.toLowerCase().includes(search.toLowerCase())
      )
    : patients;

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({
        ...form,
        assignedDoctorId: doctorProfile2?._id as Id<"doctors"> | undefined,
      });
      setShowAdd(false);
      setForm({ name: "", email: "", phone: "", gender: "", dateOfBirth: "", bloodGroup: "", allergies: "", existingConditions: "", currentMedications: "", notes: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
          <Input
            placeholder="Search patients..."
            className="health-input pl-10 py-2 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("common.addNew")}
        </Button>
      </div>

      {showAdd && (
        <div className="health-card-static p-6">
          <h3 className="font-semibold text-lg mb-4 text-[#0F172A]">Add Patient</h3>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Name *</label>
                <Input className="health-input rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Email</label>
                <Input className="health-input rounded-xl" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Phone</label>
                <Input className="health-input rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Gender</label>
                <select className="health-input w-full py-2 px-3 rounded-xl" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Date of Birth</label>
                <Input className="health-input rounded-xl" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-[#334155] block mb-1">Blood Group</label>
                <Input className="health-input rounded-xl" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#334155] block mb-1">Allergies</label>
              <Input className="health-input rounded-xl" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#334155] block mb-1">Existing Conditions</label>
              <Input className="health-input rounded-xl" value={form.existingConditions} onChange={(e) => setForm({ ...form, existingConditions: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#334155] block mb-1">Current Medications</label>
              <Input className="health-input rounded-xl" value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-[#334155] block mb-1">Notes</label>
              <textarea className="health-input w-full p-3 rounded-xl" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("common.save")}
              </Button>
              <Button type="button" variant="outline" className="health-btn font-semibold rounded-xl" onClick={() => setShowAdd(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((patient) => (
          <div key={patient._id} className="health-card-static mb-3">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] rounded-xl transition-colors"
              onClick={() => setExpandedId(expandedId === patient._id ? null : patient._id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center font-semibold text-sm text-[#2563EB]">
                  {(patient.userName || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">{patient.userName || "Patient"}</p>
                  <p className="text-xs text-[#64748B]">
                    {patient.userEmail} • {patient.phone || "No phone"}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-[#94A3B8] transition-transform ${expandedId === patient._id ? "rotate-90" : ""}`} />
            </div>
            {expandedId === patient._id && (
              <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] space-y-3 rounded-b-xl">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {patient.gender && <div><span className="font-medium text-[#334155]">Gender:</span> <span className="text-[#0F172A]">{patient.gender}</span></div>}
                  {patient.dateOfBirth && <div><span className="font-medium text-[#334155]">DOB:</span> <span className="text-[#0F172A]">{patient.dateOfBirth}</span></div>}
                  {patient.bloodGroup && <div><span className="font-medium text-[#334155]">Blood:</span> <span className="text-[#0F172A]">{patient.bloodGroup}</span></div>}
                  {patient.emergencyContact && <div><span className="font-medium text-[#334155]">Emergency:</span> <span className="text-[#0F172A]">{patient.emergencyContact}</span></div>}
                </div>
                {patient.allergies && <div className="text-sm"><span className="font-medium text-[#334155]">Allergies:</span> <span className="text-[#0F172A]">{patient.allergies}</span></div>}
                {patient.existingConditions && <div className="text-sm"><span className="font-medium text-[#334155]">Conditions:</span> <span className="text-[#0F172A]">{patient.existingConditions}</span></div>}
                {patient.currentMedications && <div className="text-sm"><span className="font-medium text-[#334155]">Medications:</span> <span className="text-[#0F172A]">{patient.currentMedications}</span></div>}
                {patient.notes && <div className="text-sm"><span className="font-medium text-[#334155]">Notes:</span> <span className="text-[#0F172A]">{patient.notes}</span></div>}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#1E40AF] mb-1">AI Patient Summary</p>
                  <p className="text-xs text-[#334155]">
                    {patient.existingConditions
                      ? `Patient with ${patient.existingConditions}. ${patient.currentMedications ? `Currently on ${patient.currentMedications}. ` : ""}${patient.notes || ""}`
                      : "No medical conditions recorded."}
                  </p>
                  <p className="text-[10px] text-[#64748B] mt-2 italic">
                    AI-generated summary — verify patient records.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Appointments View ─── */
function AppointmentsView() {
  const { t } = useLanguage();
  const appointments = useQuery(api.appointments.list, {});
  const patients = useQuery(api.patients.list, {});
  const doctorProfile = useQuery(api.doctors.getMyProfile);
  const updateAppointment = useMutation(api.appointments.update);
  const createAppointment = useMutation(api.appointments.create);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ patientId: "", date: "", time: "", reason: "" });

  const filtered = statusFilter
    ? (appointments || []).filter((a) => a.status === statusFilter)
    : appointments || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.time || !doctorProfile?._id) return;
    try {
      await createAppointment({
        patientId: form.patientId as Id<"patients">,
        doctorId: doctorProfile._id as Id<"doctors">,
        date: form.date,
        time: form.time,
        reason: form.reason || undefined,
      });
      setShowAdd(false);
      setForm({ patientId: "", date: "", time: "", reason: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (aptId: string, status: string) => {
    await updateAppointment({
      appointmentId: aptId as Id<"appointments">,
      status: status as "scheduled" | "completed" | "cancelled" | "missed",
    });
  };

  const statusStyles: Record<string, string> = {
    scheduled: "bg-[#EFF6FF] text-[#2563EB]",
    completed: "bg-[#D1FAE5] text-[#059669]",
    cancelled: "bg-[#FEE2E2] text-[#DC2626]",
    missed: "bg-[#F1F5F9] text-[#64748B]",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {["", "scheduled", "completed", "cancelled", "missed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === s
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              {s ? t(`status.${s}`) : "All"}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl sm:ml-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {showAdd && (
        <div className="health-card-static p-6">
          <h3 className="font-semibold text-lg mb-4 text-[#0F172A]">Schedule Appointment</h3>
          {!doctorProfile?._id ? (
            <p className="text-sm text-[#64748B]">Loading your profile...</p>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Patient *</label>
                  <select className="health-input w-full py-2 px-3 rounded-xl" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                    <option value="">Select patient</option>
                    {patients?.map((p) => (
                      <option key={p._id} value={p._id}>{p.userName || "Unknown"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Date *</label>
                  <Input type="date" className="health-input rounded-xl" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Time *</label>
                  <Input type="time" className="health-input rounded-xl" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Reason</label>
                  <Input className="health-input rounded-xl" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl">{t("common.save")}</Button>
                <Button type="button" variant="outline" className="health-btn font-semibold rounded-xl" onClick={() => setShowAdd(false)}>{t("common.cancel")}</Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="health-card-static p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
            <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
          </div>
        ) : (
          filtered.map((apt) => (
            <div key={apt._id} className="health-card-static p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#0F172A]">{apt.patientName || "Patient"}</p>
                  <p className="text-xs text-[#64748B]">{apt.date} at {apt.time} — {apt.reason || "Consultation"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`health-badge ${statusStyles[apt.status] || ""}`}>{t(`status.${apt.status}`)}</span>
                {apt.status === "scheduled" && (
                  <div className="flex gap-1">
                    <button onClick={() => handleStatusChange(apt._id, "completed")} className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#D1FAE5] transition-colors" title="Complete">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                    </button>
                    <button onClick={() => handleStatusChange(apt._id, "cancelled")} className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#FEE2E2] transition-colors" title="Cancel">
                      <XIcon className="w-3.5 h-3.5 text-[#DC2626]" />
                    </button>
                    <button onClick={() => handleStatusChange(apt._id, "missed")} className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors" title="Missed">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Prescriptions View ─── */
function PrescriptionsView() {
  const { t } = useLanguage();
  const doctorProfile = useQuery(api.doctors.getMyProfile);
  const prescriptions = useQuery(api.prescriptions.list, {});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (prescriptions === undefined || doctorProfile === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        <span className="text-[#64748B]">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">{t("nav.prescriptions")}</h2>
          <p className="text-xs text-[#64748B]">Create and manage patient prescriptions</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold px-4 py-2 shadow-sm transition-colors"
        >
          {showForm ? <><X className="w-4 h-4 mr-1.5" /> Close</> : <><Plus className="w-4 h-4 mr-1.5" /> New Prescription</>}
        </Button>
      </div>

      {/* Prescription Form */}
      {showForm && doctorProfile && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <PrescriptionForm
            doctorProfileId={doctorProfile._id}
            onSuccess={() => {
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Pill className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
          <p className="text-xs text-[#64748B] mt-1">Create your first prescription using the button above</p>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx._id} className="health-card-static">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] rounded-xl transition-colors"
              onClick={() => setExpandedId(expandedId === rx._id ? null : rx._id)}
            >
              <div>
                <p className="font-medium text-sm text-[#0F172A]">{rx.patientName || "Patient"}</p>
                <p className="text-xs text-[#64748B]">
                  {rx.items?.length || 0} medicines • {new Date(rx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`health-badge ${rx.status === "active" ? "bg-[#D1FAE5] text-[#059669]" : rx.status === "completed" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-[#F1F5F9] text-[#64748B]"}`}>{rx.status}</span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </div>
            </div>
            {expandedId === rx._id && (
              <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] space-y-3 rounded-b-xl">
                {rx.doctorName && (
                  <p className="text-xs text-[#64748B]">Prescribed by <span className="font-medium text-[#334155]">{rx.doctorName}</span></p>
                )}
                {rx.items?.map((item) => (
                  <div key={item._id} className="bg-white border border-[#E2E8F0] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-[#0F172A]">
                        {item.medicineName}
                      </p>
                      {item.isAyurvedic && <span className="text-xs bg-[#D1FAE5] text-[#059669] px-2 py-0.5 rounded-md font-medium">🌿 Ayurvedic</span>}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      💊 {item.dosage} • 🕐 {item.frequency} • 📅 {item.duration}
                    </p>
                    {item.instructions && <p className="text-xs mt-1.5 text-[#334155] bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg px-2.5 py-1.5">📋 {item.instructions}</p>}
                  </div>
                ))}
                {rx.notes && (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-3">
                    <p className="text-xs font-medium text-[#334155] mb-1">Additional Notes</p>
                    <p className="text-xs text-[#64748B]">{rx.notes}</p>
                  </div>
                )}
                <p className="text-xs text-[#94A3B8]">Created: {new Date(rx.createdAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Records View ─── */
function RecordsView({ doctorProfile }: { doctorProfile: Record<string, unknown> | null | undefined }) {
  const patients = useQuery(api.patients.list, {});
  const [selectedId, setSelectedId] = useState<string | "">("");
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const records = useQuery(
    api.medical_records.list,
    selectedId ? { patientId: selectedId as Id<"patients"> } : "skip"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (patients === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        <span className="text-[#64748B]">Loading patients...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-[#334155] block mb-1">Select Patient</label>
          <select
            className="health-input w-full py-2 px-3 rounded-xl"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setExpandedId(null);
            }}
          >
            <option value="">All patients</option>
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.userName || "Patient"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {records === undefined && selectedId && (
        <div className="flex items-center gap-3 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
          <span className="text-[#64748B]">Loading records...</span>
        </div>
      )}

      {!selectedId && (
        <div className="health-card-static p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A] mb-1">Medical Records</p>
          <p className="text-sm text-[#64748B]">Select a patient from the dropdown above to view their medical records.</p>
        </div>
      )}

      {selectedId && !showIntakeForm && records && records.length === 0 && (
        <div className="health-card-static p-12 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">No medical records</p>
          <p className="text-sm text-[#64748B]">No records found for this patient yet. Start by filling out an intake assessment above.</p>
        </div>
      )}

      {selectedId && (
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setShowIntakeForm(!showIntakeForm)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-[#7C3AED] text-white"
          >
            {showIntakeForm ? "← Back to Records" : "🔍 Open Intake Assessment"}
          </button>
        </div>
      )}

      {selectedId && showIntakeForm && (
        <IntakeForm
          patientId={selectedId}
          isDoctorReview={true}
          onComplete={() => setShowIntakeForm(false)}
        />
      )}

      {selectedId && !showIntakeForm && records && records.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B] font-medium">
            {records.length} Record{records.length !== 1 ? "s" : ""} Found
          </p>
          {records.map((rec) => (
            <div
              key={rec._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === rec._id ? null : rec._id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  rec.type === "consultation"
                    ? "bg-blue-100"
                    : rec.type === "follow-up"
                      ? "bg-amber-100"
                      : rec.type === "lab-review"
                        ? "bg-emerald-100"
                        : "bg-red-100"
                }`}>
                  <ClipboardList className={`w-5 h-5 ${
                    rec.type === "consultation"
                      ? "text-blue-600"
                      : rec.type === "follow-up"
                        ? "text-amber-600"
                        : rec.type === "lab-review"
                          ? "text-emerald-600"
                          : "text-red-600"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A] truncate">
                    {rec.title}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1).replace("-", " ")} · {new Date(rec.createdAt).toLocaleDateString()}
                    {rec.doctorName ? ` · Dr. ${rec.doctorName}` : ""}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                  rec.type === "consultation"
                    ? "bg-blue-100 text-blue-700"
                    : rec.type === "follow-up"
                      ? "bg-amber-100 text-amber-700"
                      : rec.type === "lab-review"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                }`}>
                  {rec.type.replace("-", " ")}
                </span>
              </button>

              {expandedId === rec._id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  {rec.symptoms && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Symptoms</p>
                      <p className="text-sm text-[#0F172A]">{rec.symptoms}</p>
                    </div>
                  )}
                  {rec.diagnosis && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Diagnosis</p>
                      <p className="text-sm text-[#0F172A] font-medium">{rec.diagnosis}</p>
                    </div>
                  )}
                  {rec.assessment && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Assessment</p>
                      <p className="text-sm text-[#0F172A]">{rec.assessment}</p>
                    </div>
                  )}
                  {rec.ayurvedaPrakriti && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-[10px] font-bold text-purple-700 uppercase">Prakriti</p>
                        <p className="text-sm text-purple-900">{rec.ayurvedaPrakriti}</p>
                      </div>
                      {rec.ayurvedaVikriti && (
                        <div className="bg-orange-50 rounded-lg p-2">
                          <p className="text-[10px] font-bold text-orange-700 uppercase">Vikriti</p>
                          <p className="text-sm text-orange-900">{rec.ayurvedaVikriti}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {rec.lifestyleNotes && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Lifestyle</p>
                      <p className="text-sm text-[#0F172A]">{rec.lifestyleNotes}</p>
                    </div>
                  )}
                  {rec.dietNotes && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Diet</p>
                      <p className="text-sm text-[#0F172A]">{rec.dietNotes}</p>
                    </div>
                  )}
                  {rec.treatmentPlan && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Treatment Plan</p>
                      <p className="text-sm text-[#0F172A] font-medium">{rec.treatmentPlan}</p>
                    </div>
                  )}
                  {rec.herbMedicineSuggestions && (
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Herb Suggestions</p>
                      <p className="text-sm text-[#0F172A]">{rec.herbMedicineSuggestions}</p>
                    </div>
                  )}
                  {rec.aiGeneratedSummary && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">🤖 AI Summary</p>
                      <p className="text-xs text-blue-900">{rec.aiGeneratedSummary}</p>
                      <p className="text-[10px] text-blue-500 mt-1 italic">AI-generated — verify with healthcare professional.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Reports View ─── */
function ReportsView() {
  const patients = useQuery(api.patients.list, {});
  const [selectedId, setSelectedId] = useState<string | "">("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const doctorProfile = useQuery(api.doctors.getMyProfile);
  const allReports = useQuery(api.reports.listByDoctor, {});
  const reportsByPatient = useQuery(
    api.reports.list,
    selectedId ? { patientId: selectedId as Id<"patients"> } : "skip"
  );
  const createReport = useMutation(api.reports.create);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ patientId: "", title: "", reportType: "blood_test", notes: "" });

  const reportTypes = [
    { value: "blood_test", label: "Blood Test" },
    { value: "diabetes_panel", label: "Diabetes Panel" },
    { value: "thyroid_panel", label: "Thyroid Panel" },
    { value: "lipid_profile", label: "Lipid Profile" },
    { value: "liver_function", label: "Liver Function" },
    { value: "kidney_function", label: "Kidney Function" },
    { value: "urine_test", label: "Urine Test" },
    { value: "ecg", label: "ECG" },
    { value: "x_ray", label: "X-Ray" },
    { value: "mri", label: "MRI" },
    { value: "ayurvedic_assessment", label: "Ayurvedic Assessment" },
    { value: "other", label: "Other" },
  ];

  const typeColors: Record<string, { bg: string; text: string }> = {
    blood_test: { bg: "bg-red-100", text: "text-red-600" },
    diabetes_panel: { bg: "bg-orange-100", text: "text-orange-600" },
    thyroid_panel: { bg: "bg-purple-100", text: "text-purple-600" },
    lipid_profile: { bg: "bg-amber-100", text: "text-amber-600" },
    liver_function: { bg: "bg-emerald-100", text: "text-emerald-600" },
    kidney_function: { bg: "bg-blue-100", text: "text-blue-600" },
    urine_test: { bg: "bg-yellow-100", text: "text-yellow-600" },
    ecg: { bg: "bg-rose-100", text: "text-rose-600" },
    x_ray: { bg: "bg-slate-100", text: "text-slate-600" },
    mri: { bg: "bg-indigo-100", text: "text-indigo-600" },
    ayurvedic_assessment: { bg: "bg-green-100", text: "text-green-600" },
    other: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  const displayReports = selectedId ? (reportsByPatient || []) : (allReports || []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !doctorProfile?._id) return;
    setLoading(true);
    try {
      await createReport({
        patientId: form.patientId as Id<"patients">,
        doctorId: doctorProfile._id as Id<"doctors">,
        title: form.title,
        reportType: form.reportType,
        notes: form.notes || undefined,
      });
      setShowAdd(false);
      setForm({ patientId: "", title: "", reportType: "blood_test", notes: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-sm font-medium text-[#334155] block mb-1">Filter by Patient</label>
          <select
            className="health-input w-full py-2 px-3 rounded-xl"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setExpandedId(null);
            }}
          >
            <option value="">All Patients</option>
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.userName || "Patient"}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Report
        </Button>
      </div>

      {showAdd && (
        <div className="health-card-static p-6">
          <h3 className="font-semibold text-lg mb-4 text-[#0F172A]">Add Medical Report</h3>
          {!doctorProfile?._id ? (
            <p className="text-sm text-[#64748B]">Loading your profile...</p>
          ) : (
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Patient *</label>
                  <select
                    className="health-input w-full py-2 px-3 rounded-xl"
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    required
                  >
                    <option value="">Select patient</option>
                    {patients?.map((p) => (
                      <option key={p._id} value={p._id}>{p.userName || "Unknown"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Report Title *</label>
                  <Input className="health-input rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete Blood Count" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Report Type</label>
                  <select
                    className="health-input w-full py-2 px-3 rounded-xl"
                    value={form.reportType}
                    onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                  >
                    {reportTypes.map((rt) => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#334155] block mb-1">Notes / Findings</label>
                  <Input className="health-input rounded-xl" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Key findings or observations" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Report
                </Button>
                <Button type="button" variant="outline" className="health-btn font-semibold rounded-xl" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {displayReports.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A] mb-1">No Reports Found</p>
          <p className="text-sm text-[#64748B]">
            {selectedId ? "No reports for this patient yet." : "Add a medical report to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#64748B] font-medium">
            {displayReports.length} Report{displayReports.length !== 1 ? "s" : ""} Found
          </p>
          {displayReports.map((report) => {
            const colors = typeColors[report.reportType] || typeColors.other;
            return (
              <div key={report._id} className="health-card-static overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === report._id ? null : report._id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-[#F8FAFC] rounded-xl transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                    <FileText className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F172A] truncate">{report.title}</p>
                    <p className="text-xs text-[#64748B]">
                      {report.patientName || "Patient"} · {report.reportType.replace(/_/g, " ")} · {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${colors.bg} ${colors.text}`}>
                    {report.reportType.replace(/_/g, " ")}
                  </span>
                  <ChevronRight className={`w-5 h-5 text-[#94A3B8] transition-transform ${expandedId === report._id ? "rotate-90" : ""}`} />
                </button>

                {expandedId === report._id && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    {report.patientName && (
                      <div>
                        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Patient</p>
                        <p className="text-sm text-[#0F172A] font-medium">{report.patientName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Report Type</p>
                      <p className="text-sm text-[#0F172A]">{report.reportType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Date</p>
                      <p className="text-sm text-[#0F172A]">{new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    {report.notes && (
                      <div>
                        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide mb-0.5">Notes / Findings</p>
                        <p className="text-sm text-[#0F172A]">{report.notes}</p>
                      </div>
                    )}
                    {report.aiGeneratedSummary && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">AI Summary</p>
                        <p className="text-xs text-blue-900">{report.aiGeneratedSummary}</p>
                        <p className="text-[10px] text-blue-500 mt-1 italic">AI-generated — verify with healthcare professional.</p>
                      </div>
                    )}
                    {report.doctorName && (
                      <p className="text-[11px] text-[#64748B]">Ordered by: Dr. {report.doctorName}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Follow-ups View ─── */
function FollowupsView() {
  const { t } = useLanguage();
  const followups = useQuery(api.followups.list, {});

  if (followups === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        <span className="text-[#64748B]">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {followups.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
        </div>
      ) : (
        followups.map((fu) => (
          <div key={fu._id} className="health-card-static p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#D97706]" />
              </div>
              <div>
                <p className="font-medium text-sm text-[#0F172A]">{fu.patientName || "Patient"}</p>
                <p className="text-xs text-[#64748B]">{fu.date} — {fu.notes || "Follow-up"}</p>
              </div>
            </div>
            <span className={`health-badge ${fu.status === "pending" ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#D1FAE5] text-[#059669]"}`}>{fu.status}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Documents View ─── */
function DocumentsView() {
  const { t } = useLanguage();
  const patients = useQuery(api.patients.list, {});
  const [selectedPatientId, setSelectedPatientId] = useState<string | "">("");
  const [showUpload, setShowUpload] = useState(false);
  const [capturedDocs, setCapturedDocs] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const docs = JSON.parse(localStorage.getItem("captured-docs") || "[]");
    setCapturedDocs(docs);
  }, []);

  const refreshDocs = () => {
    const docs = JSON.parse(localStorage.getItem("captured-docs") || "[]");
    setCapturedDocs(docs);
  };

  const selectedPatientDocs = selectedPatientId
    ? capturedDocs.filter((d) => d.patientId === selectedPatientId)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-sm font-medium text-[#334155] block mb-1">Select Patient</label>
          <select
            className="health-input w-full py-2 px-3 rounded-xl"
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setShowUpload(false);
            }}
          >
            <option value="">All patients</option>
            {patients?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.userName || "Patient"}
              </option>
            ))}
          </select>
        </div>
        {selectedPatientId && (
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Capture Document
          </Button>
        )}
      </div>

      {showUpload && selectedPatientId && (
        <div className="health-card-static p-6">
          <h3 className="font-semibold text-lg mb-4 text-[#0F172A]">Upload / Capture Document</h3>
          <DocumentUploadWithCamera
            patientId={selectedPatientId}
            onUploaded={() => {
              setShowUpload(false);
              refreshDocs();
            }}
          />
        </div>
      )}

      {selectedPatientId ? (
        selectedPatientDocs.length === 0 ? (
          <div className="health-card-static p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
            <p className="font-semibold text-[#0F172A] mb-1">No documents yet</p>
            <p className="text-sm text-[#64748B] mb-4">
              Capture or upload handwritten prescriptions and reports for this patient.
            </p>
            <Button
              onClick={() => setShowUpload(true)}
              className="health-btn bg-[#2563EB] text-white font-semibold rounded-xl"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-[#64748B]">
              {selectedPatientDocs.length} document(s)
            </h3>
            {selectedPatientDocs.map((doc) => (
              <div key={String(doc._id)} className="health-card-static p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#FEF3C7] rounded-lg flex items-center justify-center shrink-0">
                    {String(doc.fileType).includes("pdf") ? "📄" : "🖼️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#0F172A]">{String(doc.fileName)}</p>
                    {!!doc.description ? (
                      <p className="text-xs text-[#64748B]">
                        {String(doc.description)}
                      </p>
                    ) : null}
                    <p className="text-[10px] text-[#94A3B8] mt-1">
                      {new Date(Number(doc.createdAt)).toLocaleString()}
                    </p>
                    {!doc.ocrVerified ? (
                      <div className="mt-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-[#D97706]">Pending OCR Review</p>
                        <p className="text-[10px] text-[#64748B] italic">
                          AI/OCR extracted — Doctor verification required.
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {!!doc.fileUrl && String(doc.fileUrl).startsWith("data:image") ? (
                    <div className="w-20 h-20 border border-[#E2E8F0] rounded-lg overflow-hidden shrink-0">
                      <img
                        src={String(doc.fileUrl)}
                        alt={String(doc.fileName)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="health-card-static p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A] mb-1">Documents</p>
          <p className="text-sm text-[#64748B]">
            Select a patient above to view and upload documents and handwritten prescriptions.
          </p>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mt-6 max-w-md mx-auto text-left">
            <p className="text-xs font-semibold text-[#0F172A] mb-1">📸 Camera Capture Feature</p>
            <p className="text-xs text-[#64748B]">
              Use your device camera to capture handwritten prescriptions and medical reports.
              The image is stored for doctor review and OCR processing.
            </p>
            <p className="text-[10px] text-[#94A3B8] mt-2 italic">
              AI/OCR extracted information — Doctor verification required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Notifications View ─── */
function NotificationsView({ notifications }: { notifications: Record<string, unknown>[] }) {
  const markAsRead = useMutation(api.notifications.markAsRead);

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">No notifications</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={String(n._id)}
            className={`health-card-static p-4 cursor-pointer transition-colors ${!n.read ? "bg-[#EFF6FF] border-[#BFDBFE]" : ""}`}
            onClick={() => !n.read && markAsRead({ notificationId: n._id as Id<"notifications"> })}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 mt-2 shrink-0 rounded-full ${!n.read ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}`} />
              <div>
                <p className="font-medium text-sm text-[#0F172A]">{String(n.title)}</p>
                <p className="text-xs text-[#64748B]">{String(n.message)}</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">{new Date(Number(n.createdAt)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
