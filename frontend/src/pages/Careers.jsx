import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Reveal, Overline } from "@/components/Reveal";
import api, { formatApiError } from "@/lib/api";
import { IMAGES } from "@/data/content";

const OPENINGS = [
  { title: "State Project Coordinator", type: "Full-time · Chennai", desc: "Lead project delivery and coordinator networks across the state." },
  { title: "District Operations Executive", type: "Full-time · Tamil Nadu", desc: "Manage district-level service delivery and agent onboarding." },
  { title: "Field Service Agent", type: "Field · South India", desc: "Deliver citizen services and enrolment support at the last mile." },
  { title: "Customer Support Associate", type: "Full-time · Chennai", desc: "Assist citizens navigating government programmes across channels." },
];

export default function Careers() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", experience: "", message: "" });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = "h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent";

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.position) { toast.error("Please fill all required fields"); return; }
    if (!resume) { toast.error("Please attach your resume"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("resume", resume);
      await api.post("/careers", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Application submitted! Check your email for confirmation.");
      setForm({ name: "", email: "", phone: "", position: "", experience: "", message: "" });
      setResume(null);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="careers-page">
      <section className="relative pt-36 pb-20 min-h-[55vh] flex items-end">
        <div className="absolute inset-0"><img src={IMAGES.careers} alt="Careers at SKL" className="w-full h-full object-cover" /><div className="absolute inset-0 hero-overlay" /></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Overline className="!text-gold">Careers</Overline>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance">Grow your career with purpose</h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl">Join a team building India's digital public-service future. We hire people who value quality, trust and commitment.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Overline>Current Openings</Overline>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 mb-10">Roles we're hiring for</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {OPENINGS.map((o, i) => (
              <Reveal key={o.title} delay={i * 0.05}>
                <button
                  onClick={() => { setForm((f) => ({ ...f, position: o.title })); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="text-left w-full group bg-white border border-slate-200 rounded-sm p-7 card-shadow hover:border-royal transition-colors"
                  data-testid={`opening-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center"><Briefcase className="h-5 w-5 text-royal" /></div>
                    <div><h3 className="font-heading text-lg font-semibold text-slate-900 group-hover:text-royal transition-colors">{o.title}</h3><p className="text-xs text-gold uppercase tracking-wider">{o.type}</p></div>
                  </div>
                  <p className="mt-4 text-slate-600 leading-relaxed">{o.desc}</p>
                  <span className="mt-4 inline-block text-royal font-semibold text-sm">Apply for this role →</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Reveal>
            <Overline>Apply Now</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 mb-8">Submit your application</h2>
            <form onSubmit={submit} className="bg-white border border-slate-200 rounded-sm p-8 lg:p-10 card-shadow space-y-5" data-testid="career-form">
              <div className="grid sm:grid-cols-2 gap-5">
                <div><Label className="mb-2 block">Full Name *</Label><Input data-testid="career-name" className={field} value={form.name} onChange={set("name")} /></div>
                <div><Label className="mb-2 block">Email *</Label><Input data-testid="career-email" type="email" className={field} value={form.email} onChange={set("email")} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><Label className="mb-2 block">Phone *</Label><Input data-testid="career-phone" className={field} value={form.phone} onChange={set("phone")} /></div>
                <div><Label className="mb-2 block">Position *</Label><Input data-testid="career-position" className={field} value={form.position} onChange={set("position")} placeholder="Role you're applying for" /></div>
              </div>
              <div><Label className="mb-2 block">Experience</Label><Input data-testid="career-experience" className={field} value={form.experience} onChange={set("experience")} placeholder="e.g. 3 years" /></div>
              <div><Label className="mb-2 block">Cover Message</Label><Textarea data-testid="career-message" className="rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent" rows={3} value={form.message} onChange={set("message")} /></div>
              <div>
                <Label className="mb-2 block">Resume * <span className="text-slate-400 font-normal">(PDF / DOC, max 10MB)</span></Label>
                <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 rounded-sm px-5 py-4 cursor-pointer hover:border-royal transition-colors" data-testid="career-resume-label">
                  {resume ? <FileText className="h-5 w-5 text-royal" /> : <Upload className="h-5 w-5 text-slate-400" />}
                  <span className="text-slate-600 text-sm truncate">{resume ? resume.name : "Click to upload your resume"}</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" data-testid="career-resume-input" onChange={(e) => setResume(e.target.files[0])} />
                </label>
              </div>
              <Button type="submit" disabled={loading} data-testid="career-submit" className="bg-royal hover:bg-royal-dark text-white h-12 px-8 rounded-sm w-full sm:w-auto transition-colors">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit Application"}
              </Button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
