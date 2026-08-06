import { useParams, Link, Navigate } from "react-router-dom";
import {
  Target, Gift, Layers, CheckCircle2, FileText, ListOrdered, MapPin, ArrowLeft, Phone,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, Overline } from "@/components/Reveal";
import AgentForm from "@/components/AgentForm";
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

  return (
    <div data-testid={`project-detail-${slug}`}>
      {/* HERO */}
      <section className="relative pt-36 pb-24 min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          <img src={p.hero} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <Link to="/projects" className="inline-flex items-center gap-2 text-white/80 hover:text-gold text-sm mb-6 transition-colors" data-testid="back-to-projects">
            <ArrowLeft className="h-4 w-4" /> All Projects
          </Link>
          <span className="section-label">{p.full}</span>
          <h1 className="mt-3 font-heading text-5xl lg:text-7xl font-bold text-white">{p.name}</h1>
          <p className="mt-4 text-xl text-white/85 max-w-2xl">{p.tagline}</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-sm text-sm">
            <MapPin className="h-4 w-4 text-gold" /> Coverage: {p.coverage}
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

      {/* OBJECTIVES + BENEFITS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
          <Block icon={Target} title="Objectives"><ListRow items={p.objectives} /></Block>
          <Block icon={Gift} title="Benefits"><ListRow items={p.benefits} /></Block>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Block icon={Layers} title="Key Features"><ListRow items={p.features} /></Block>
          <Reveal delay={0.1}><img src={p.content} alt={`${p.name} in action`} className="w-full h-[400px] object-cover rounded-sm card-shadow" /></Reveal>
        </div>
      </section>

      {/* ELIGIBILITY + DOCUMENTS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
          <Block icon={CheckCircle2} title="Eligibility"><ListRow items={p.eligibility} /></Block>
          <Block icon={FileText} title="Documents Required"><ListRow items={p.documents} /></Block>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Block icon={ListOrdered} title="Registration Process">
            <ol className="mt-2 space-y-6">
              {p.process.map((step, i) => (
                <li key={i} className="flex gap-5">
                  <div className="h-10 w-10 shrink-0 rounded-sm bg-royal text-white font-heading font-bold flex items-center justify-center">{i + 1}</div>
                  <p className="text-lg text-slate-600 leading-relaxed pt-1.5">{step}</p>
                </li>
              ))}
            </ol>
          </Block>
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

      {/* RECRUITING / BECOME AN AGENT */}
      <section className="py-24" data-testid="become-agent-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
          <Reveal>
            <Overline>Recruiting Now</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900">Become a {p.name} Agent</h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Join our trusted network delivering {p.name} services across {p.coverage}. We are actively recruiting:
            </p>
            <div className="mt-6 space-y-3">
              {p.recruiting.map((r) => (
                <div key={r} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-sm px-5 py-4">
                  <div className="h-2 w-2 rounded-full bg-gold" /><span className="font-medium text-slate-800">{r}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-royal text-white rounded-sm">
              <p className="text-white/80 text-sm">Prefer to talk to us directly?</p>
              <a href={`tel:${COMPANY.phoneRaw}`} className="inline-flex items-center gap-2 mt-2 font-heading text-xl font-semibold hover:text-gold transition-colors">
                <Phone className="h-5 w-5" /> {COMPANY.phone}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-white border border-slate-200 rounded-sm p-8 card-shadow">
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-6">Agent Application — {p.name}</h3>
              <AgentForm project={p.name} roles={p.recruiting} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
