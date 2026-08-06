import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";
import { INDIAN_STATES } from "@/data/content";

export default function AgentForm({ project = "", roles = [], compact = false }) {
  const [form, setForm] = useState({
    name: "", mobile: "", email: "", state: "", district: "", city: "",
    pincode: "", occupation: "", experience: "", role: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email || !form.state || !form.district || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await api.post("/agents", { ...form, project });
      toast.success("Application submitted! Check your email for confirmation.");
      setForm({ name: "", mobile: "", email: "", state: "", district: "", city: "", pincode: "", occupation: "", experience: "", role: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const field = "h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent";

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="agent-form">
      <div className="grid sm:grid-cols-2 gap-5">
        <div><Label className="mb-2 block">Full Name *</Label><Input data-testid="agent-name" className={field} value={form.name} onChange={set("name")} placeholder="Your name" /></div>
        <div><Label className="mb-2 block">Mobile *</Label><Input data-testid="agent-mobile" className={field} value={form.mobile} onChange={set("mobile")} placeholder="+91" /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div><Label className="mb-2 block">Email *</Label><Input data-testid="agent-email" type="email" className={field} value={form.email} onChange={set("email")} placeholder="you@email.com" /></div>
        <div>
          <Label className="mb-2 block">State *</Label>
          <Select value={form.state} onValueChange={set("state")}>
            <SelectTrigger className={field} data-testid="agent-state"><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>{INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        <div><Label className="mb-2 block">District *</Label><Input data-testid="agent-district" className={field} value={form.district} onChange={set("district")} /></div>
        <div><Label className="mb-2 block">City *</Label><Input data-testid="agent-city" className={field} value={form.city} onChange={set("city")} /></div>
        <div><Label className="mb-2 block">Pincode *</Label><Input data-testid="agent-pincode" className={field} value={form.pincode} onChange={set("pincode")} /></div>
      </div>
      {roles.length > 0 && (
        <div>
          <Label className="mb-2 block">Preferred Role</Label>
          <Select value={form.role} onValueChange={set("role")}>
            <SelectTrigger className={field} data-testid="agent-role"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <div><Label className="mb-2 block">Occupation</Label><Input data-testid="agent-occupation" className={field} value={form.occupation} onChange={set("occupation")} /></div>
        <div><Label className="mb-2 block">Experience</Label><Input data-testid="agent-experience" className={field} value={form.experience} onChange={set("experience")} placeholder="e.g. 2 years" /></div>
      </div>
      <div><Label className="mb-2 block">Message</Label><Textarea data-testid="agent-message" className="rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent" rows={3} value={form.message} onChange={set("message")} placeholder="Tell us about yourself" /></div>
      <Button type="submit" disabled={loading} data-testid="agent-submit" className="bg-royal hover:bg-royal-dark text-white h-12 px-8 rounded-sm w-full sm:w-auto transition-colors">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit Application"}
      </Button>
    </form>
  );
}
