import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, CreditCard, MapPin } from "lucide-react";
import { Reveal, Overline } from "@/components/Reveal";
import { PROJECTS } from "@/data/content";

function PageHero({ label, title, subtitle }) {
  return (
    <section className="relative pt-36 pb-20 bg-royal-dark overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A059 0, transparent 45%)" }} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <Overline className="!text-gold">{label}</Overline>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance">{title}</h1>
        {subtitle && <p className="mt-6 text-lg text-white/75 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}

export default function Projects() {
  const list = [PROJECTS.apaar, PROJECTS["pan-2"]];
  return (
    <div data-testid="projects-page">
      <PageHero
        label="Our Projects"
        title="Technology-enabled public service projects"
        subtitle="We facilitate flagship national initiatives that expand citizen access to essential digital services."
      />
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <div className={`grid lg:grid-cols-2 gap-0 rounded-sm overflow-hidden card-shadow bg-white border border-slate-200 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="aspect-[16/11] lg:aspect-auto overflow-hidden">
                  <img src={p.hero} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] font-semibold">
                    {p.slug === "apaar" ? <GraduationCap className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    {p.full}
                  </div>
                  <h2 className="mt-4 font-heading text-3xl lg:text-4xl font-bold text-slate-900">{p.name}</h2>
                  <p className="mt-4 text-lg text-slate-600 leading-relaxed">{p.overview.slice(0, 220)}…</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="h-4 w-4 text-royal" /> Coverage: <span className="font-semibold text-slate-700">{p.coverage}</span>
                  </div>
                  <Link to={`/projects/${p.slug}`} className="mt-8" data-testid={`project-link-${p.slug}`}>
                    <span className="inline-flex items-center gap-2 bg-royal hover:bg-royal-dark text-white font-semibold px-6 py-3 rounded-sm transition-colors">
                      Explore {p.name} <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
