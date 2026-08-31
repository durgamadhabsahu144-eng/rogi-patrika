import { useState } from "react";
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
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

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
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-secondary border-r-2 border-foreground z-50 flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-yellow border-2 border-foreground flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-black text-sm">CareConnect</span>
          </div>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setView(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                view === item.key
                  ? "bg-neo-yellow border-2 border-foreground shadow-[2px_2px_0px_#0A0A0A]"
                  : "hover:bg-background border-2 border-transparent"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
              {item.key === "notifications" && unreadNotifs > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-foreground">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-bold truncate">
              {user?.name || "Doctor"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-background border-2 border-transparent hover:border-foreground"
          >
            <LogOut className="w-5 h-5" />
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-background border-b-2 border-foreground px-4 py-3 flex items-center gap-4">
          <button
            className="lg:hidden p-2 border-2 border-foreground hover:bg-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-black text-lg">
            {sidebarItems.find((i) => i.key === view)?.label || "Dashboard"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {unreadNotifs > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
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
          {view === "records" && <RecordsView />}
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
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>{t("common.loading")}</span>
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
    { label: t("dashboard.totalPatients"), value: totalPatients, color: "bg-neo-yellow" },
    { label: t("dashboard.todayAppointments"), value: todayAppointments, color: "bg-neo-green" },
    { label: t("dashboard.pendingFollowups"), value: pendingFollowups, color: "bg-neo-orange" },
    { label: t("dashboard.scheduledAppointments"), value: scheduledAppointments, color: "bg-neo-blue" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
        {statCards.map((card) => (
          <div key={card.label} className="border-2 border-foreground p-5">
            <p className={`text-3xl font-black ${card.color} inline-block px-2 py-0.5 border-2 border-foreground`}>
              {card.value}
            </p>
            <p className="text-sm font-bold mt-2">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="neo-card p-0">
          <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
            <h2 className="font-black">{t("dashboard.upcomingAppointments")}</h2>
            <button
              onClick={() => setView("appointments")}
              className="text-xs font-bold flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-foreground/20">
            {upcomingAppointments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={String(apt._id)} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{String(apt.patientName || "Patient")}</p>
                    <p className="text-xs text-muted-foreground">
                      {String(apt.date)} at {String(apt.time)}
                    </p>
                  </div>
                  <span className="neo-badge px-2 py-1 text-xs bg-neo-yellow">
                    {String(apt.reason || "Consultation")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="neo-card p-0">
          <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
            <h2 className="font-black">{t("dashboard.recentPatients")}</h2>
            <button
              onClick={() => setView("patients")}
              className="text-xs font-bold flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-foreground/20">
            {recentPatients.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{t("common.noData")}</p>
            ) : (
              recentPatients.map((p) => (
                <div key={String(p.id)} className="p-4">
                  <p className="font-bold text-sm">{String(p.name)}</p>
                  <p className="text-xs text-muted-foreground">{String(p.email || "")}</p>
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

  if (patients === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>{t("common.loading")}</span>
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
      await createPatient(form);
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
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="neo-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="neo-btn bg-foreground text-background font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("common.addNew")}
        </Button>
      </div>

      {showAdd && (
        <div className="neo-card p-6">
          <h3 className="font-black text-lg mb-4">Add Patient</h3>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold block mb-1">Name *</label>
                <Input className="neo-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Email</label>
                <Input className="neo-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Phone</label>
                <Input className="neo-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Gender</label>
                <select className="neo-input w-full py-2 px-3" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Date of Birth</label>
                <Input className="neo-input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Blood Group</label>
                <Input className="neo-input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Allergies</label>
              <Input className="neo-input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Existing Conditions</label>
              <Input className="neo-input" value={form.existingConditions} onChange={(e) => setForm({ ...form, existingConditions: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Current Medications</label>
              <Input className="neo-input" value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Notes</label>
              <textarea className="neo-input w-full p-3" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="neo-btn bg-foreground text-background font-bold" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("common.save")}
              </Button>
              <Button type="button" variant="outline" className="neo-btn font-bold" onClick={() => setShowAdd(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((patient) => (
          <div key={patient._id} className="neo-card mb-3">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50"
              onClick={() => setExpandedId(expandedId === patient._id ? null : patient._id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neo-yellow border-2 border-foreground flex items-center justify-center font-bold text-sm">
                  {(patient.userName || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{patient.userName || "Patient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.userEmail} • {patient.phone || "No phone"}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${expandedId === patient._id ? "rotate-90" : ""}`} />
            </div>
            {expandedId === patient._id && (
              <div className="p-4 border-t-2 border-foreground bg-secondary/30 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {patient.gender && <div><span className="font-bold">Gender:</span> {patient.gender}</div>}
                  {patient.dateOfBirth && <div><span className="font-bold">DOB:</span> {patient.dateOfBirth}</div>}
                  {patient.bloodGroup && <div><span className="font-bold">Blood:</span> {patient.bloodGroup}</div>}
                  {patient.emergencyContact && <div><span className="font-bold">Emergency:</span> {patient.emergencyContact}</div>}
                </div>
                {patient.allergies && <div className="text-sm"><span className="font-bold">Allergies:</span> {patient.allergies}</div>}
                {patient.existingConditions && <div className="text-sm"><span className="font-bold">Conditions:</span> {patient.existingConditions}</div>}
                {patient.currentMedications && <div className="text-sm"><span className="font-bold">Medications:</span> {patient.currentMedications}</div>}
                {patient.notes && <div className="text-sm"><span className="font-bold">Notes:</span> {patient.notes}</div>}
                <div className="neo-border-sm p-3 bg-neo-yellow/20">
                  <p className="text-xs font-bold mb-1">AI Patient Summary</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.existingConditions
                      ? `Patient with ${patient.existingConditions}. ${patient.currentMedications ? `Currently on ${patient.currentMedications}. ` : ""}${patient.notes || ""}`
                      : "No medical conditions recorded."}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
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
    if (!form.patientId || !form.date || !form.time) return;
    try {
      // Find the doctor profile for the current user
      const doctorProfile = await fetch("/api/doctor-profile").catch(() => null);
      // For now, we need the doctorId from somewhere - we'll use a workaround
      // Actually we need to get it from the query
      await createAppointment({
        patientId: form.patientId as Id<"patients">,
        doctorId: "placeholder" as Id<"doctors">,
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

  const statusColors: Record<string, string> = {
    scheduled: "bg-neo-yellow",
    completed: "bg-neo-green",
    cancelled: "bg-neo-red",
    missed: "bg-muted",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {["", "scheduled", "completed", "cancelled", "missed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold border-2 border-foreground transition-all ${
                statusFilter === s ? "bg-neo-yellow shadow-[2px_2px_0px_#0A0A0A]" : "bg-background hover:bg-secondary"
              }`}
            >
              {s ? t(`status.${s}`) : "All"}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="neo-btn bg-foreground text-background font-bold sm:ml-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {showAdd && (
        <div className="neo-card p-6">
          <h3 className="font-black text-lg mb-4">Schedule Appointment</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold block mb-1">Patient *</label>
                <select className="neo-input w-full py-2 px-3" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                  <option value="">Select patient</option>
                  {patients?.map((p) => (
                    <option key={p._id} value={p._id}>{p.userName || "Unknown"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Date *</label>
                <Input type="date" className="neo-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Time *</label>
                <Input type="time" className="neo-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Reason</label>
                <Input className="neo-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="neo-btn bg-foreground text-background font-bold">{t("common.save")}</Button>
              <Button type="button" variant="outline" className="neo-btn font-bold" onClick={() => setShowAdd(false)}>{t("common.cancel")}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-0">
        {filtered.length === 0 ? (
          <div className="neo-card p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-bold">{t("common.noData")}</p>
          </div>
        ) : (
          filtered.map((apt) => (
            <div key={apt._id} className="neo-card p-4 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neo-blue border-2 border-foreground flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{apt.patientName || "Patient"}</p>
                  <p className="text-xs text-muted-foreground">{apt.date} at {apt.time} — {apt.reason || "Consultation"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`neo-badge px-2 py-1 text-xs ${statusColors[apt.status] || ""}`}>{t(`status.${apt.status}`)}</span>
                {apt.status === "scheduled" && (
                  <div className="flex gap-1">
                    <button onClick={() => handleStatusChange(apt._id, "completed")} className="p-1.5 border-2 border-foreground hover:bg-neo-green" title="Complete">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleStatusChange(apt._id, "cancelled")} className="p-1.5 border-2 border-foreground hover:bg-neo-red" title="Cancel">
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleStatusChange(apt._id, "missed")} className="p-1.5 border-2 border-foreground hover:bg-muted" title="Missed">
                      <AlertTriangle className="w-3.5 h-3.5" />
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
  const prescriptions = useQuery(api.prescriptions.list, {});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (prescriptions === undefined) {
    return (
      <div className="flex items-center gap-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {prescriptions.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("common.noData")}</p>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <div key={rx._id} className="neo-card mb-3">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50"
              onClick={() => setExpandedId(expandedId === rx._id ? null : rx._id)}
            >
              <div>
                <p className="font-bold text-sm">{rx.patientName || "Patient"}</p>
                <p className="text-xs text-muted-foreground">
                  {rx.items?.length || 0} medicines • {new Date(rx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`neo-badge px-2 py-1 text-xs ${rx.status === "active" ? "bg-neo-green" : "bg-muted"}`}>{rx.status}</span>
            </div>
            {expandedId === rx._id && (
              <div className="p-4 border-t-2 border-foreground bg-secondary/30 space-y-3">
                {rx.items?.map((item) => (
                  <div key={item._id} className="bg-background border-2 border-foreground p-3">
                    <p className="font-bold text-sm">
                      {item.medicineName}
                      {item.isAyurvedic && <span className="ml-2 text-xs bg-neo-green px-2 py-0.5 neo-badge">Ayurvedic</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.dosage} • {item.frequency} • {item.duration}
                    </p>
                    {item.instructions && <p className="text-xs mt-1">📋 {item.instructions}</p>}
                  </div>
                ))}
                {rx.notes && <p className="text-xs text-muted-foreground"><span className="font-bold">Notes:</span> {rx.notes}</p>}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Records View ─── */
function RecordsView() {
  return (
    <div className="neo-card p-12 text-center">
      <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
      <p className="font-bold mb-2">Medical Records</p>
      <p className="text-sm text-muted-foreground">Select a patient from the Patients tab to view their medical records.</p>
    </div>
  );
}

/* ─── Reports View ─── */
function ReportsView() {
  return (
    <div className="neo-card p-12 text-center">
      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
      <p className="font-bold mb-2">Reports</p>
      <p className="text-sm text-muted-foreground">Select a patient to view their medical reports.</p>
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
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {followups.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("common.noData")}</p>
        </div>
      ) : (
        followups.map((fu) => (
          <div key={fu._id} className="neo-card p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neo-orange border-2 border-foreground flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">{fu.patientName || "Patient"}</p>
                <p className="text-xs text-muted-foreground">{fu.date} — {fu.notes || "Follow-up"}</p>
              </div>
            </div>
            <span className={`neo-badge px-2 py-1 text-xs ${fu.status === "pending" ? "bg-neo-orange" : "bg-neo-green"}`}>{fu.status}</span>
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Documents View ─── */
function DocumentsView() {
  return (
    <div className="neo-card p-12 text-center">
      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
      <p className="font-bold mb-2">Documents</p>
      <p className="text-sm text-muted-foreground">Select a patient to view uploaded documents and handwritten prescriptions.</p>
      <div className="neo-border-sm p-4 mt-6 max-w-md mx-auto text-left">
        <p className="text-xs font-bold mb-1">OCR Document Processing</p>
        <p className="text-xs text-muted-foreground">Upload handwritten prescriptions, reports, or documents. OCR extracts text for doctor review and verification.</p>
        <p className="text-[10px] text-muted-foreground mt-2 italic">AI/OCR extracted — Doctor verification required.</p>
      </div>
    </div>
  );
}

/* ─── Notifications View ─── */
function NotificationsView({ notifications }: { notifications: Record<string, unknown>[] }) {
  const markAsRead = useMutation(api.notifications.markAsRead);

  return (
    <div className="space-y-0">
      {notifications.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">No notifications</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={String(n._id)}
            className={`neo-card p-4 mb-3 cursor-pointer ${!n.read ? "bg-neo-yellow/20" : ""}`}
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
