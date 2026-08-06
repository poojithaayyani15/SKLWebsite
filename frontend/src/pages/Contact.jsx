import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Reveal, Overline } from "@/components/Reveal";
import SEO from "@/components/SEO";
import api, { formatApiError } from "@/lib/api";
import { useCompany } from "@/context/SiteContext";

export default function Contact() {
  const COMPANY = useCompany();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = "h-11 rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent";

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) { toast.error("Please fill all required fields"); return; }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setDone(true);
      toast.success("Message sent! Check your email for confirmation.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Submission failed");
    } finally { setLoading(false); }
  };

  const cards = [
    { icon: MapPin, label: "Office Address", value: COMPANY.address, href: `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.mapQuery)}`, testid: "contact-address" },
    { icon: Phone, label: "Mobile", value: COMPANY.phone, href: `tel:${COMPANY.phoneRaw}`, testid: "contact-phone" },
    { icon: MessageCircle, label: "WhatsApp", value: COMPANY.whatsapp, href: `https://wa.me/${COMPANY.whatsappRaw}`, testid: "contact-whatsapp" },
    { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}`, testid: "contact-email" },
  ];

  return (
    <div data-testid="contact-page">
      <SEO title="Contact Us" description="Contact SKL Enterprises — office in Guindy, Chennai. Call, WhatsApp or email us for enquiries, partnerships and investor relations." path="/contact" />
      <section className="relative pt-36 pb-20 bg-royal-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A059 0, transparent 45%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Overline className="!text-gold">Contact</Overline>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance">Let's talk</h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl">Reach out for enquiries, partnerships or investor relations. We respond within one business day.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <a href={c.href} target={c.label === "Office Address" || c.label === "WhatsApp" ? "_blank" : undefined} rel="noreferrer" data-testid={c.testid}
                 className="block h-full bg-white border border-slate-200 rounded-sm p-6 card-shadow hover:border-royal hover:-translate-y-0.5 transition-[transform,border-color]">
                <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center"><c.icon className="h-5 w-5 text-royal" /></div>
                <p className="mt-4 text-xs uppercase tracking-wider text-gold font-semibold">{c.label}</p>
                <p className="mt-1 text-slate-700 leading-snug break-words">{c.value}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-stretch">
          <Reveal>
            <div className="bg-white border border-slate-200 rounded-sm p-8 lg:p-10 card-shadow h-full">
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-6">Send us a message</h2>
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-6">Send us a message</h2>
              {done ? (
                <div className="text-center py-10" data-testid="contact-success">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div>
                  <h3 className="mt-5 font-heading text-2xl font-semibold text-slate-900">Message Sent!</h3>
                  <p className="mt-3 text-slate-600 max-w-sm mx-auto">Thank you for reaching out. Our team will respond within one business day. A confirmation has been sent to your email.</p>
                  <Button onClick={() => setDone(false)} className="mt-6 bg-royal hover:bg-royal-dark text-white rounded-sm" data-testid="contact-another">Send Another Message</Button>
                </div>
              ) : (
              <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><Label className="mb-2 block">Full Name *</Label><Input data-testid="contact-name" className={field} value={form.name} onChange={set("name")} /></div>
                  <div><Label className="mb-2 block">Phone *</Label><Input data-testid="contact-phone-input" className={field} value={form.phone} onChange={set("phone")} /></div>
                </div>
                <div><Label className="mb-2 block">Email *</Label><Input data-testid="contact-email-input" type="email" className={field} value={form.email} onChange={set("email")} /></div>
                <div><Label className="mb-2 block">Subject</Label><Input data-testid="contact-subject" className={field} value={form.subject} onChange={set("subject")} /></div>
                <div><Label className="mb-2 block">Message *</Label><Textarea data-testid="contact-message" className="rounded-sm border-slate-300 focus:ring-2 focus:ring-royal focus:border-transparent" rows={5} value={form.message} onChange={set("message")} /></div>
                <Button type="submit" disabled={loading} data-testid="contact-submit" className="bg-royal hover:bg-royal-dark text-white h-12 px-8 rounded-sm w-full sm:w-auto transition-colors">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : "Send Message"}
                </Button>
              </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full flex flex-col gap-6">
              <div className="rounded-sm overflow-hidden border border-slate-200 card-shadow flex-1 min-h-[340px]">
                <iframe
                  title="SKL Enterprises Location"
                  data-testid="contact-map"
                  width="100%" height="100%" style={{ border: 0, minHeight: 340 }}
                  loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
              <div className="bg-royal text-white rounded-sm p-6 flex items-start gap-4">
                <Clock className="h-6 w-6 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-semibold">Business Hours</p>
                  <p className="text-white/80 text-sm mt-1">{COMPANY.hours}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
