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

  const doctors = useQuery(api.doctors.list, {});
  const patients = useQuery(api.patients.list, {});
  const notifications = useQuery(api.notifications.list);

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
            <div className="w-8 h-8 bg-neo-blue border-2 border-foreground flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-black text-sm">CareSync Pro</span>
          </div>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setView(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                view === item.key
                  ? "bg-neo-blue text-background border-2 border-foreground shadow-[2px_2px_0px_#0A0A0A]"
                  : "hover:bg-background border-2 border-transparent"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-foreground">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
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
    } catch (err) {
      setSeedStatus(String(err));
    }
  };
  const stats = [
    { label: "Doctors", value: doctorCount, color: "bg-neo-blue" },
    { label: "Patients", value: patientCount, color: "bg-neo-green" },
    {
      label: "System Status",
      value: "Active",
      color: "bg-neo-green",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="neo-card bg-neo-blue p-6 text-background">
        <h2 className="text-xl font-black">Admin Dashboard</h2>
        <p className="text-sm opacity-80 mt-1">
          System overview and management
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-0">
        {stats.map((stat) => (
          <div key={stat.label} className="border-2 border-foreground p-5">
            <p
              className={`text-2xl font-black ${stat.color} inline-block px-2 py-0.5 border-2 border-foreground ${
                stat.isText ? "text-sm" : ""
              }`}
            >
              {stat.value}
            </p>
            <p className="text-sm font-bold mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="neo-card p-6">
        <h3 className="font-black mb-3">Quick Actions</h3>
        <div className="mb-4">
          <button
            onClick={handleSeed}
            className="neo-btn bg-neo-yellow font-bold px-4 py-2 text-sm"
          >
            Seed Demo Data
          </button>
          {seedStatus && <p className="text-xs mt-2 text-muted-foreground">{seedStatus}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border-2 border-foreground p-4">
            <p className="font-bold text-sm mb-1">Manage Doctors</p>
            <p className="text-xs text-muted-foreground">
              View and manage doctor accounts
            </p>
          </div>
          <div className="border-2 border-foreground p-4">
            <p className="font-bold text-sm mb-1">Manage Patients</p>
            <p className="text-xs text-muted-foreground">
              View and manage patient records
            </p>
          </div>
        </div>
      </div>

      <div className="neo-border-sm p-4 bg-muted/50">
        <p className="text-xs font-bold">System Information</p>
        <p className="text-xs text-muted-foreground mt-1">
          CareSync Pro v1.0 — SIH 2026 Problem Statement 47 — Patient
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
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search doctors..."
          className="neo-input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((doc) => (
          <div key={doc._id as string} className="neo-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neo-blue border-2 border-foreground flex items-center justify-center font-bold text-sm">
                {(doc as { userName?: string }).userName?.charAt(0) || "D"}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {(doc as { userName?: string }).userName || "Doctor"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(doc as { userEmail?: string }).userEmail}
                </p>
                {(doc as { specialization?: string }).specialization && (
                  <p className="text-xs mt-1">
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
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          className="neo-input pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">{t("common.noData")}</p>
        </div>
      ) : (
        filtered.map((patient) => (
          <div key={patient._id as string} className="neo-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neo-green border-2 border-foreground flex items-center justify-center font-bold text-sm">
                {(patient as { userName?: string }).userName?.charAt(0) || "P"}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {(patient as { userName?: string }).userName || "Patient"}
                </p>
                <p className="text-xs text-muted-foreground">
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
      <h2 className="font-black">System Activity</h2>
      {notifications.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-bold">No recent activity</p>
        </div>
      ) : (
        notifications.slice(0, 20).map((n) => (
          <div key={n._id as string} className="neo-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-neo-blue shrink-0" />
              <div>
                <p className="font-bold text-sm">{n.title as string}</p>
                <p className="text-xs text-muted-foreground">
                  {n.message as string}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
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
