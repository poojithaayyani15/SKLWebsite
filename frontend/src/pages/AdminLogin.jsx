import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/admin", { replace: true }); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-950" data-testid="admin-login-page">
      <div className="hidden lg:flex lg:w-1/2 relative bg-royal-dark items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #C5A059 0, transparent 45%)" }} />
        <div className="relative px-16 max-w-lg">
          <Logo variant="light" />
          <h1 className="mt-10 font-heading text-4xl font-bold text-white leading-tight">SKL Enterprises CRM &amp; Lead Management</h1>
          <p className="mt-5 text-white/70 text-lg leading-relaxed">Secure administrative console for managing enquiries, agent applications and career submissions.</p>
          <div className="mt-10 flex items-center gap-3 text-white/60 text-sm"><ShieldCheck className="h-5 w-5 text-gold" /> Encrypted access · Brute-force protected · Session-managed</div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo variant="light" /></div>
          <div className="bg-white rounded-sm p-8 lg:p-10 card-shadow">
            <div className="h-12 w-12 rounded-sm bg-royal/10 flex items-center justify-center mb-6"><Lock className="h-6 w-6 text-royal" /></div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">Admin Login</h2>
            <p className="mt-2 text-slate-500 text-sm">Authorised personnel only.</p>
            <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
              <div><Label className="mb-2 block">Email</Label><Input data-testid="admin-email" type="email" className="h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label className="mb-2 block">Password</Label><Input data-testid="admin-password" type="password" className="h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={loading} data-testid="admin-login-submit" className="w-full bg-royal hover:bg-royal-dark text-white h-12 rounded-sm transition-colors">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
