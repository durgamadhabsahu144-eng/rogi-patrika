import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  UserCog,
  Activity,
  LogOut,
  Menu,
  X,
  Leaf,
  Search,
  Bell,
  Loader2,
} from "lucide-react";

type View = "overview" | "doctors" | "patients" | "activity";

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doctors = useQuery(api.admin.getAllDoctors);
  const patients = useQuery(api.admin.getAllPatients);
  const notifications = useQuery(api.admin.getAllNotifications);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarItems: { icon: typeof Shield; label: string; key: View }[] = [
    { icon: Shield, label: "Overview", key: "overview" },
    { icon: Users, label: t("nav.doctors"), key: "doctors" },
    { icon: UserCog, label: t("nav.patients"), key: "patients" },
    { icon: Activity, label: "Activity", key: "activity" },
  ];

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
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
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

        <nav className="flex-1 p-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setView(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                view === item.key
                  ? "bg-[#EDE9FE] text-[#7C3AED]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#E2E8F0]">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold truncate text-[#0F172A]">{user?.name || "Admin"}</p>
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
            {sidebarItems.find((i) => i.key === view)?.label || "Admin"}
          </h1>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {view === "overview" && (
            <OverviewView
              doctorCount={doctors?.length || 0}
              patientCount={patients?.length || 0}
              t={t}
            />
          )}
          {view === "doctors" && (
            <DoctorsView doctors={doctors || []} t={t} />
          )}
          {view === "patients" && (
            <PatientsView patients={patients || []} t={t} />
          )}
          {view === "activity" && (
            <ActivityView notifications={notifications || []} t={t} />
          )}
        </main>
      </div>
    </div>
  );
}

function OverviewView({
  doctorCount,
  patientCount,
  t,
}: {
  doctorCount: number;
  patientCount: number;
  t: (k: string) => string;
}) {
  const seedDemo = useMutation(api.seed.seedDemoData);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleSeed = async () => {
    try {
      const result = await seedDemo();
      setSeedStatus(String(result));
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setSeedStatus(String(err));
    }
  };

  const stats = [
    { label: "Doctors", value: doctorCount, color: "bg-[#EDE9FE] text-[#7C3AED]" },
    { label: "Patients", value: patientCount, color: "bg-[#D1FAE5] text-[#059669]" },
    {
      label: "System Status",
      value: "Active",
      color: "bg-[#D1FAE5] text-[#059669]",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-white/80 mt-1">
          System overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="health-stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.isText ? <Shield className="w-5 h-5" /> : stat.label === "Doctors" ? <Users className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
              </div>
              <div>
                <p className={`font-bold text-2xl text-[#0F172A]`}>{stat.value}</p>
                <p className="text-xs font-medium text-[#64748B]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="health-card-static p-6">
        <h3 className="font-semibold mb-4 text-[#0F172A]">Quick Actions</h3>
        <div className="mb-4">
          <button
            onClick={handleSeed}
            className="health-btn bg-[#059669] text-white font-semibold px-4 py-2 text-sm rounded-xl"
          >
            Seed Demo Data
          </button>
          {seedStatus && <p className="text-xs mt-2 text-[#64748B]">{seedStatus}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
            <p className="font-semibold text-sm text-[#0F172A] mb-1">Manage Doctors</p>
            <p className="text-xs text-[#64748B]">
              View and manage doctor accounts
            </p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
            <p className="font-semibold text-sm text-[#0F172A] mb-1">Manage Patients</p>
            <p className="text-xs text-[#64748B]">
              View and manage patient records
            </p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
        <p className="text-xs font-semibold text-[#0F172A]">System Information</p>
        <p className="text-xs text-[#64748B] mt-1">
          RogiPatrika v1.0 — SIH 2026 Problem Statement 47 — Patient
          Case-Taking Software for Ayurvedic Practitioners
        </p>
      </div>
    </div>
  );
}

function DoctorsView({
  doctors,
  t,
}: {
  doctors: Record<string, unknown>[];
  t: (k: string) => string;
}) {
  const [search, setSearch] = useState("");
  const filtered = doctors.filter(
    (d) =>
      !search ||
      (d as { userName?: string })
        .userName?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (d as { userEmail?: string })
        .userEmail?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
        <Input
          placeholder="Search doctors..."
          className="health-input pl-10 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((doc) => (
          <div key={doc._id as string} className="health-card-static p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EDE9FE] rounded-lg flex items-center justify-center font-semibold text-sm text-[#7C3AED]">
                {(doc as { userName?: string }).userName?.charAt(0) || "D"}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0F172A]">
                  {(doc as { userName?: string }).userName || "Doctor"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {(doc as { userEmail?: string }).userEmail}
                </p>
                {(doc as { specialization?: string }).specialization && (
                  <p className="text-xs text-[#334155] mt-1">
                    {(doc as { specialization?: string }).specialization}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PatientsView({
  patients,
  t,
}: {
  patients: Record<string, unknown>[];
  t: (k: string) => string;
}) {
  const [search, setSearch] = useState("");
  const filtered = patients.filter(
    (p) =>
      !search ||
      (p as { userName?: string })
        .userName?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (p as { userEmail?: string })
        .userEmail?.toLowerCase()
        .includes(search.toLowerCase()) ||
      (p as { phone?: string })
        .phone?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
        <Input
          placeholder="Search patients..."
          className="health-input pl-10 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((patient) => (
          <div key={patient._id as string} className="health-card-static p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center font-semibold text-sm text-[#059669]">
                {(patient as { userName?: string }).userName?.charAt(0) || "P"}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#0F172A]">
                  {(patient as { userName?: string }).userName || "Patient"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {(patient as { userEmail?: string }).userEmail} •{" "}
                  {(patient as { phone?: string }).phone || "No phone"}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ActivityView({
  notifications,
  t,
}: {
  notifications: Record<string, unknown>[];
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[#0F172A]">System Activity</h2>
      {notifications.length === 0 ? (
        <div className="health-card-static p-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 text-[#94A3B8]" />
          <p className="font-semibold text-[#0F172A]">No recent activity</p>
        </div>
      ) : (
        notifications.slice(0, 20).map((n) => (
          <div key={n._id as string} className="health-card-static p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-[#2563EB] rounded-full shrink-0" />
              <div>
                <p className="font-medium text-sm text-[#0F172A]">{n.title as string}</p>
                <p className="text-xs text-[#64748B]">
                  {n.message as string}
                </p>
                <p className="text-[10px] text-[#94A3B8] mt-1">
                  {new Date(n.createdAt as number).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
