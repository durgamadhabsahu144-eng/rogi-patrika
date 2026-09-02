import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Leaf, ArrowRight, Loader2, Mail, ArrowLeft, Stethoscope, Heart, Shield } from "lucide-react";

type Role = "doctor" | "patient" | "admin";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirect(role: Role | null): string {
  if (role === "doctor") return "/dashboard";
  if (role === "patient") return "/patient";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

function getRoleFromUser(user: { role?: string } | null | undefined): Role | null {
  if (!user?.role) return null;
  if (user.role === "doctor" || user.role === "patient" || user.role === "admin") {
    return user.role;
  }
  return null;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, user, signIn } = useAuth();
  const navigate = useNavigate();
  const setMyRole = useMutation(api.users.setMyRole);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as Role | null;
  const [selectedRole, setSelectedRole] = useState<Role | null>(roleParam);
  const [step, setStep] = useState<"role" | "email" | "otp">(
    roleParam ? "email" : "role"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const userRole = getRoleFromUser(user);
      if (userRole) {
        navigate(redirectAfterAuth || resolveRedirect(userRole));
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, redirectAfterAuth]);

  useEffect(() => {
    if (roleParam && (roleParam === "doctor" || roleParam === "patient" || roleParam === "admin")) {
      setSelectedRole(roleParam);
      setStep("email");
    }
  }, [roleParam]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("email");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      await signIn("email-otp", formData);
      setStep("otp");
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code."
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", otp);
      await signIn("email-otp", formData);
      if (selectedRole) {
        await setMyRole({ role: selectedRole });
      }
      navigate(redirectAfterAuth || resolveRedirect(selectedRole));
    } catch {
      setError("The verification code is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    if (!selectedRole) {
      setError("Please select a role first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      await setMyRole({ role: selectedRole });
      navigate(redirectAfterAuth || resolveRedirect(selectedRole));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in as guest."
      );
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: Role) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      await setMyRole({ role: demoRole });
      navigate(redirectAfterAuth || resolveRedirect(demoRole));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in."
      );
      setIsLoading(false);
    }
  };

  const roleStyles: Record<Role, { bg: string; icon: string; border: string }> = {
    doctor: { bg: "bg-[#EFF6FF]", icon: "text-[#2563EB]", border: "border-[#BFDBFE] hover:border-[#2563EB]" },
    patient: { bg: "bg-[#D1FAE5]", icon: "text-[#059669]", border: "border-[#A7F3D0] hover:border-[#059669]" },
    admin: { bg: "bg-[#EDE9FE]", icon: "text-[#7C3AED]", border: "border-[#C4B5FD] hover:border-[#7C3AED]" },
  };

  const roleIcons: Record<Role, typeof Leaf> = {
    doctor: Stethoscope,
    patient: Heart,
    admin: Shield,
  };

  const roleDescriptions: Record<Role, string> = {
    doctor: "Manage patients, prescriptions, and appointments",
    patient: "View your health records and appointments",
    admin: "Manage the healthcare system",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div
          className="flex items-center gap-3 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-11 h-11 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-xl tracking-tight text-[#0F172A]">RogiPatrika</p>
            <p className="text-xs text-[#64748B]">Connected Patient Care</p>
          </div>
        </div>

        {/* Role Selection */}
        {step === "role" && (
          <div>
            <h1 className="text-2xl font-bold mb-1 text-[#0F172A]">Select your role</h1>
            <p className="text-sm text-[#64748B] mb-6">
              Choose how you want to sign in to RogiPatrika
            </p>
            <div className="space-y-3">
              {(["doctor", "patient", "admin"] as Role[]).map((role) => {
                const Icon = roleIcons[role];
                const styles = roleStyles[role];
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full p-5 rounded-xl border ${styles.border} ${styles.bg} text-left hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.bg}`}>
                          <Icon className={`w-5 h-5 ${styles.icon}`} />
                        </div>
                        <div>
                          <span className="font-semibold text-base capitalize block text-[#0F172A]">{role}</span>
                          <span className="text-xs text-[#64748B]">{roleDescriptions[role]}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#94A3B8]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Email Input */}
        {step === "email" && (
          <div>
            <button
              onClick={() => setStep("role")}
              className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to role selection
            </button>
            <div className={`p-4 rounded-xl border ${roleStyles[selectedRole || "doctor"].border} ${roleStyles[selectedRole || "doctor"].bg} mb-6`}>
              <div className="flex items-center gap-2">
                {selectedRole && (() => {
                  const Icon = roleIcons[selectedRole];
                  return <Icon className={`w-5 h-5 ${roleStyles[selectedRole].icon}`} />;
                })()}
                <span className="font-semibold capitalize text-[#0F172A]">{selectedRole}</span>
                <span className="text-[#64748B] font-medium">Login</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-1 text-[#0F172A]">Enter your email</h1>
            <p className="text-sm text-[#64748B] mb-6">
              We'll send a verification code to your email
            </p>
            <form onSubmit={handleEmailSubmit}>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-[#94A3B8]" />
                <Input
                  placeholder="name@example.com"
                  type="email"
                  className="health-input pl-11 py-6 text-base rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-[#DC2626] font-medium mb-4">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="health-btn w-full bg-[#2563EB] text-white font-semibold py-6 text-base rounded-xl hover:bg-[#1D4ED8]"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="health-btn w-full mt-3 font-semibold rounded-xl border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#2563EB]"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </form>

            {/* Demo Quick Login */}
            {selectedRole === "patient" && (
              <div className="mt-6 p-4 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5]">
                <p className="text-xs font-semibold text-[#059669] mb-3">⚡ Quick Demo Login — See a patient with data</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("patient")}
                    className="w-full p-3 rounded-xl bg-white border border-[#A7F3D0] hover:border-[#059669] hover:shadow-sm text-left transition-all"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">Rahul Kumar</p>
                    <p className="text-xs text-[#64748B]">Anxiety • Thyroid • Prescriptions & Reports</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("patient")}
                    className="w-full p-3 rounded-xl bg-white border border-[#A7F3D0] hover:border-[#059669] hover:shadow-sm text-left transition-all"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">Anita Devi</p>
                    <p className="text-xs text-[#64748B]">Diabetes • Cholesterol • Prescriptions & Reports</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("patient")}
                    className="w-full p-3 rounded-xl bg-white border border-[#A7F3D0] hover:border-[#059669] hover:shadow-sm text-left transition-all"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">Suresh Patel</p>
                    <p className="text-xs text-[#64748B]">Hypertension • Sleep • Prescriptions & Reports</p>
                  </button>
                </div>
                <p className="text-[10px] text-[#059669]/70 mt-2">Click any patient — demo data auto-seeds on login</p>
              </div>
            )}
            {selectedRole === "doctor" && (
              <div className="mt-6 p-4 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]">
                <p className="text-xs font-semibold text-[#2563EB] mb-3">⚡ Quick Demo Login — See a doctor with data</p>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("doctor")}
                  className="w-full p-3 rounded-xl bg-white border border-[#BFDBFE] hover:border-[#2563EB] hover:shadow-sm text-left transition-all"
                >
                  <p className="text-sm font-semibold text-[#0F172A]">Dr. Priya Sharma</p>
                  <p className="text-xs text-[#64748B]">3 patients • Prescriptions • Reports • Appointments</p>
                </button>
                <p className="text-[10px] text-[#2563EB]/70 mt-2">Click — demo data auto-seeds on login</p>
              </div>
            )}
          </div>
        )}

        {/* OTP Input */}
        {step === "otp" && (
          <div>
            <button
              onClick={() => setStep("email")}
              className="flex items-center gap-1 text-sm text-[#64748B] mb-4 hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Use different email
            </button>
            <h1 className="text-2xl font-bold mb-1 text-[#0F172A]">Check your email</h1>
            <p className="text-sm text-[#64748B] mb-6">
              We've sent a code to {email}
            </p>
            <form onSubmit={handleOtpSubmit}>
              <div className="flex justify-center mb-4">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      otp.length === 6 &&
                      !isLoading
                    ) {
                      const form = (e.target as HTMLElement).closest("form");
                      if (form) form.requestSubmit();
                    }
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="w-12 h-14 text-lg font-bold rounded-lg border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <p className="text-sm text-[#DC2626] font-medium text-center mb-4">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="health-btn w-full bg-[#2563EB] text-white font-semibold py-6 text-base rounded-xl hover:bg-[#1D4ED8]"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        <p className="text-xs text-center text-[#94A3B8] mt-8">
          AI assists healthcare professionals; it does not replace medical judgment.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
