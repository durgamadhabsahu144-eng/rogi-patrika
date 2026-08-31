import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Leaf, ArrowRight, Loader2, Mail, ArrowLeft } from "lucide-react";

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

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
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
    if (!authLoading && isAuthenticated) {
      navigate(redirectAfterAuth || resolveRedirect(selectedRole));
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth, selectedRole]);

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
      navigate(redirectAfterAuth || resolveRedirect(selectedRole));
    } catch {
      setError("The verification code is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirectAfterAuth || resolveRedirect(selectedRole));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in as guest."
      );
      setIsLoading(false);
    }
  };

  const roleColors: Record<Role, string> = {
    doctor: "bg-neo-yellow",
    patient: "bg-neo-green",
    admin: "bg-neo-blue",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div
          className="flex items-center gap-3 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-12 h-12 bg-neo-yellow border-2 border-foreground flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-xl tracking-tight">CareSync Pro</p>
            <p className="text-xs text-muted-foreground">Connected Patient Care</p>
          </div>
        </div>

        {/* Role Selection */}
        {step === "role" && (
          <div>
            <h1 className="text-2xl font-black mb-2">Select your role</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Choose how you want to sign in
            </p>
            <div className="space-y-3">
              {(["doctor", "patient", "admin"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full p-5 border-2 border-foreground text-left hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0A0A0A] transition-all ${roleColors[role]}`}
                >
                  <span className="font-bold text-lg capitalize">{role}</span>
                  <ArrowRight className="float-right mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email Input */}
        {step === "email" && (
          <div>
            <button
              onClick={() => setStep("role")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back to role selection
            </button>
            <div className={`p-4 border-2 border-foreground mb-6 ${roleColors[selectedRole || "doctor"]}`}>
              <span className="font-bold capitalize">{selectedRole}</span> Login
            </div>
            <h1 className="text-2xl font-black mb-2">Enter your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We'll send a verification code to your email
            </p>
            <form onSubmit={handleEmailSubmit}>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="name@example.com"
                  type="email"
                  className="neo-input pl-11 py-6 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium mb-4">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="neo-btn w-full bg-foreground text-background font-bold py-6 text-base"
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
                className="neo-btn w-full mt-3 font-bold"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </form>
          </div>
        )}

        {/* OTP Input */}
        {step === "otp" && (
          <div>
            <button
              onClick={() => setStep("email")}
              className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Use different email
            </button>
            <h1 className="text-2xl font-black mb-2">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-6">
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
                      <InputOTPSlot key={i} index={i} className="w-12 h-14 text-lg font-bold border-2 border-foreground" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium text-center mb-4">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="neo-btn w-full bg-foreground text-background font-bold py-6 text-base"
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

        <p className="text-xs text-center text-muted-foreground mt-8">
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
