import { useParams, Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Target, Gift, Layers, CheckCircle2, FileText, MapPin, Phone, Download, ArrowRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, Overline } from "@/components/Reveal";
import AgentForm from "@/components/AgentForm";
import Breadcrumb from "@/components/Breadcrumb";
import VideoSection from "@/components/VideoSection";
import SEO from "@/components/SEO";
import { PROJECTS, COMPANY } from "@/data/content";

const Block = ({ icon: Icon, title, children }) => (
  <Reveal>
    <div className="flex items-center gap-3 mb-6">
      <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center"><Icon className="h-5 w-5 text-royal" /></div>
      <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900">{title}</h2>
    </div>
    {children}
  </Reveal>
);

const ListRow = ({ items }) => (
  <ul className="space-y-3">
    {items.map((t, i) => (
      <li key={i} className="flex gap-3 text-slate-600 leading-relaxed">
        <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" /><span>{t}</span>
      </li>
    ))}
  </ul>
);

export default function ProjectDetail() {
  const { slug } = useParams();
  const p = PROJECTS[slug];
  if (!p) return <Navigate to="/projects" replace />;

  const placeholderDownload = (label) => toast.info(`${label} will be available for download soon.`);

  return (
    <div data-testid={`project-detail-${slug}`}>
      <SEO title={`${p.name} — ${p.full}`} description={p.overview.slice(0, 155)} path={`/projects/${slug}`} />

      {/* PROFESSIONAL HERO BANNER (split, official image + gradient) */}
      <section className="relative pt-28 bg-royal-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, #C5A059 0, transparent 45%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-0">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Projects", to: "/projects" }, { label: p.name }]} />
          <div className="grid lg:grid-cols-2 gap-10 items-center py-12 lg:py-16">
            <div>
              <span className="section-label">{p.full}</span>
              <h1 className="mt-3 font-heading text-5xl lg:text-6xl font-bold text-white">{p.name}</h1>
              <p className="mt-5 text-xl text-white/85 max-w-xl">{p.tagline}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-sm text-sm"><MapPin className="h-4 w-4 text-gold" /> Coverage: {p.coverage}</span>
                <a href="#become-agent" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-slate-900 font-semibold px-5 py-2 rounded-sm text-sm transition-colors" data-testid="hero-agent-cta">Join Our Network <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
            <div className="relative">
              <img src={p.hero} alt={`${p.name} official`} className="w-full rounded-sm border border-white/10 shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Block icon={Layers} title="Project Overview">
            <p className="text-lg text-slate-600 leading-relaxed">{p.overview}</p>
          </Block>
        </div>
      </section>

      {/* OBJECTIVES + BENEFITS CARDS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <Block icon={Target} title="Objectives"><ListRow items={p.objectives} /></Block>
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center"><Gift className="h-5 w-5 text-royal" /></div>
                  <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900">Benefits</h2>
                </div>
              </Reveal>
              <div className="grid sm:grid-cols-2 gap-4">
                {p.benefits.map((b, i) => (
                  <Reveal key={i} delay={i * 0.04}>
                    <div className="bg-white border border-slate-200 rounded-sm p-5 h-full card-shadow">
                      <CheckCircle2 className="h-5 w-5 text-gold" />
                      <p className="mt-3 text-slate-700 text-sm leading-relaxed">{b}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES + GALLERY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Block icon={Layers} title="Key Features"><ListRow items={p.features} /></Block>
          <Reveal delay={0.1} className="space-y-4" data-testid="project-gallery">
            {p.gallery.map((g, i) => (
              <img key={i} src={g} alt={`${p.name} visual ${i + 1}`} className="w-full rounded-sm card-shadow border border-slate-200" />
            ))}
          </Reveal>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Overline>How It Works</Overline>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 mb-10">Registration Process</h2>
          <div className="relative border-l-2 border-royal/20 ml-5" data-testid="process-timeline">
            {p.process.map((step, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="relative pl-10 pb-10 last:pb-0">
                  <div className="absolute -left-[21px] h-10 w-10 rounded-full bg-royal text-white font-heading font-bold flex items-center justify-center ring-4 ring-slate-50">{i + 1}</div>
                  <p className="text-lg text-slate-700 leading-relaxed pt-1.5">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ELIGIBILITY + DOCUMENTS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
          <Block icon={CheckCircle2} title="Eligibility"><ListRow items={p.eligibility} /></Block>
          <Block icon={FileText} title="Documents Required"><ListRow items={p.documents} /></Block>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <VideoSection
        src={p.video}
        poster={p.hero}
        label={`${p.name} Film`}
        title={p.video ? `Watch: ${p.name} Introduction` : `${p.name} Promotional Video`}
      />

      {/* RELATED DOWNLOADS */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Overline>Resources</Overline>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 mb-8">Related Downloads</h2>
          <div className="grid sm:grid-cols-2 gap-4" data-testid="project-downloads">
            {p.downloads.map((d, i) => (
              <button key={i} onClick={() => placeholderDownload(d.label)} data-testid={`download-${i}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-sm p-5 card-shadow hover:border-royal transition-colors text-left w-full">
                <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center"><FileText className="h-5 w-5 text-royal" /></div>
                <div className="flex-1"><p className="font-medium text-slate-900">{d.label}</p><p className="text-xs text-slate-400">{d.type} · Available soon</p></div>
                <Download className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Overline>FAQ</Overline>
          <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-3" data-testid="faq-accordion">
            {p.faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-200 rounded-sm px-6">
                <AccordionTrigger className="text-left font-heading font-medium text-slate-900 hover:no-underline hover:text-royal py-5">{f.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* BECOME AN AGENT */}
      <section id="become-agent" className="py-24 scroll-mt-24" data-testid="become-agent-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
          <Reveal>
            <Overline>Recruiting Now</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900">Join the {p.name} Network</h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">Join our trusted network delivering {p.name} services across {p.coverage}. We are actively recruiting:</p>
            <div className="mt-6 space-y-3">
              {p.recruiting.map((r) => (
                <div key={r} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-sm px-5 py-4">
                  <div className="h-2 w-2 rounded-full bg-gold" /><span className="font-medium text-slate-800">{r}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-royal text-white rounded-sm">
              <p className="text-white/80 text-sm">Prefer to talk to us directly?</p>
              <a href={`tel:${COMPANY.phoneRaw}`} className="inline-flex items-center gap-2 mt-2 font-heading text-xl font-semibold hover:text-gold transition-colors" data-testid="project-call">
                <Phone className="h-5 w-5" /> {COMPANY.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-white border border-slate-200 rounded-sm p-8 card-shadow">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">Network Application — {p.name}</h3>
              <AgentForm
                project={p.name}
                positions={p.positions}
                coverage={p.coverage}
                stateOptions={p.coverageStates}
                fixedState={p.fixedState || ""}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
