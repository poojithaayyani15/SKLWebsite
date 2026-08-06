import { Quote } from "lucide-react";
import SEO from "@/components/SEO";
import { Reveal, Overline } from "@/components/Reveal";
import { COMPANY, IMAGES, FOUNDER } from "@/data/content";

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

export default function About() {
  return (
    <div data-testid="about-page">
      <SEO title="About Us" description="SKL Enterprises is a technology-driven public-service enterprise committed to Quality, Trust and Commitment. Meet our founder E.L. Ashok Anand." path="/about" />
      <PageHero
        label="About Us"
        title="Empowering digital citizen services across India"
        subtitle={`${COMPANY.name} is a technology-driven public-service enterprise committed to Quality, Trust and Commitment.`}
      />

      {/* OVERVIEW */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <Overline>Company Overview</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">Who we are</h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              {COMPANY.name} is a technology-enabled public-service organisation dedicated to simplifying
              access to essential government and digital services. We serve individuals, students,
              businesses and institutions with reliable, efficient and accessible solutions.
            </p>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              By combining disciplined operations, robust technology and a trusted field network, we
              deliver public-service projects that create real impact — expanding access, reducing
              friction and contributing to India's digital progress.
            </p>
            <div className="mt-8 border-l-4 border-gold bg-slate-50 rounded-sm p-6" data-testid="eas-partnership">
              <div className="section-label mb-2">Strategic Partnership</div>
              <p className="text-slate-700 leading-relaxed">{COMPANY.partnership}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <img src={IMAGES.officeTeam} alt="SKL Enterprises team" className="w-full h-[440px] object-cover rounded-sm card-shadow" />
          </Reveal>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-white border border-slate-200 rounded-sm p-10 h-full card-shadow">
              <Overline>Our Mission</Overline>
              <p className="mt-4 text-xl text-slate-700 leading-relaxed">{COMPANY.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-royal text-white rounded-sm p-10 h-full card-shadow">
              <span className="section-label">Our Vision</span>
              <p className="mt-4 text-xl leading-relaxed">{COMPANY.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Overline>Core Values</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">The principles that guide us</h2>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {COMPANY.values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="border-t-2 border-gold bg-white p-8 card-shadow rounded-sm h-full">
                  <div className="font-heading text-5xl font-bold text-slate-200">0{i + 1}</div>
                  <h3 className="mt-4 font-heading text-2xl font-semibold text-royal">{v.title}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-24 lg:py-32 bg-slate-950 text-white" data-testid="founder-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-5 gap-14 items-start">
          <Reveal className="lg:col-span-2">
            <div className="relative bg-slate-900 border border-slate-800 rounded-sm aspect-[4/5] overflow-hidden">
              {FOUNDER.photo ? (
                <img src={FOUNDER.photo} alt={FOUNDER.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="h-32 w-32 rounded-full bg-royal flex items-center justify-center text-white font-heading text-4xl font-bold">EA</div>
                  <p className="mt-6 text-slate-500 text-sm max-w-[220px]">Official founder photograph to be added here</p>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-royal-dark to-royal p-6">
                <div className="font-heading text-xl font-bold">{FOUNDER.name}</div>
                <div className="text-gold text-sm">{FOUNDER.title}</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-3">
            <Overline className="!text-gold">Founder &amp; Managing Director</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-white">{FOUNDER.name}</h2>
            <div className="mt-8 space-y-5">
              {FOUNDER.bio.map((p, i) => (
                <p key={i} className="text-slate-300 leading-relaxed text-lg">{p}</p>
              ))}
            </div>
            <div className="relative mt-10 pl-6 border-l-2 border-gold">
              <Quote className="h-8 w-8 text-gold/40 absolute -left-1 -top-3" />
              <p className="text-xl italic text-white leading-relaxed">"{FOUNDER.quote}"</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Reveal>
            <Overline className="mx-auto">Company Philosophy</Overline>
            <p className="mt-4 font-heading text-2xl lg:text-3xl font-light text-slate-800 leading-relaxed text-balance">
              We believe technology should make public services simpler, fairer and more accessible.
              Every project we deliver is an opportunity to empower a community, create employment and
              strengthen trust between citizens and the services they depend on.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
