import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api, { formatApiError } from "@/lib/api";
import { INDIAN_STATES } from "@/data/content";
import { STATE_DISTRICTS } from "@/data/locations";

/**
 * Props:
 * - project: project name string (stored with the lead)
 * - positions: array of "Position Applied For" options (dropdown)
 * - stateOptions: array of allowed states (defaults to full list)
 * - fixedState: if set, state is locked to this value (e.g. PAN 2.0 = Tamil Nadu)
 * - coverage: coverage label to show
 */
export default function AgentForm({ project = "", positions = [], stateOptions, fixedState = "", coverage = "" }) {
  const empty = {
    name: "", mobile: "", email: "",
    state: fixedState || "", district: "", city: "", pincode: "",
    occupation: "", experience: "", role: "", message: "",
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const states = stateOptions && stateOptions.length ? stateOptions : INDIAN_STATES;
  const districts = STATE_DISTRICTS[form.state] || [];

  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });
  const setState = (v) => setForm({ ...form, state: v, district: "" }); // cascade reset

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email || !form.state || !form.district || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (positions.length && !form.role) { toast.error("Please select the position applied for"); return; }
    setLoading(true);
    try {
      await api.post("/agents", { ...form, project });
      setDone(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed");
    } finally { setLoading(false); }
  };

  const field = "h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent";

  if (done) {
    return (
      <div className="text-center py-8" data-testid="agent-success">
        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div>
        <h3 className="mt-5 font-heading text-2xl font-semibold text-slate-900">Application Received!</h3>
        <p className="mt-3 text-slate-600 max-w-sm mx-auto">Thank you, {form.name.split(" ")[0] || "there"}. Our partnerships team will verify your details and contact you shortly. A confirmation has been sent to your email.</p>
        <Button onClick={() => { setForm(empty); setDone(false); }} className="mt-6 bg-royal hover:bg-royal-dark text-white rounded-sm" data-testid="agent-another">Submit Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="agent-form">
      {(positions.length > 0 || coverage) && (
        <div className="grid sm:grid-cols-2 gap-5">
          {positions.length > 0 && (
            <div>
              <Label className="mb-2 block">Position Applied For *</Label>
              <Select value={form.role} onValueChange={set("role")}>
                <SelectTrigger className={field} data-testid="agent-position"><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>{positions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {coverage && (
            <div>
              <Label className="mb-2 block">Coverage</Label>
              <Input className={`${field} bg-slate-50`} value={coverage} readOnly data-testid="agent-coverage" />
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div><Label className="mb-2 block">Full Name *</Label><Input data-testid="agent-name" className={field} value={form.name} onChange={set("name")} placeholder="Your name" /></div>
        <div><Label className="mb-2 block">Mobile *</Label><Input data-testid="agent-mobile" className={field} value={form.mobile} onChange={set("mobile")} placeholder="+91" /></div>
      </div>
      <div><Label className="mb-2 block">Email *</Label><Input data-testid="agent-email" type="email" className={field} value={form.email} onChange={set("email")} placeholder="you@email.com" /></div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label className="mb-2 block">State *</Label>
          {fixedState ? (
            <Input className={`${field} bg-slate-50`} value={fixedState} readOnly data-testid="agent-state" />
          ) : (
            <Select value={form.state} onValueChange={setState}>
              <SelectTrigger className={field} data-testid="agent-state"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label className="mb-2 block">District *</Label>
          <Select value={form.district} onValueChange={set("district")} disabled={!form.state}>
            <SelectTrigger className={field} data-testid="agent-district"><SelectValue placeholder={form.state ? "Select district" : "Select state first"} /></SelectTrigger>
            <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div><Label className="mb-2 block">City *</Label><Input data-testid="agent-city" className={field} value={form.city} onChange={set("city")} /></div>
        <div><Label className="mb-2 block">Pincode *</Label><Input data-testid="agent-pincode" className={field} value={form.pincode} onChange={set("pincode")} /></div>
      </div>
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
