import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import {
  ArrowRight, Users, ShieldCheck, Network, Server, Gauge, Headset,
  CheckCircle2, Quote, GraduationCap, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Overline } from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import { COMPANY, IMAGES, STATS, SERVICES, WHY_US, FOUNDER, PROJECTS } from "@/data/content";

const ICONS = { Users, ShieldCheck, Network, Server, Gauge, Headset };

export default function Home() {
  return (
    <div data-testid="home-page">
      <SEO title="Technology-Driven Public Service Solutions" description="SKL Enterprises empowers digital citizen services across India through innovation, technology, operational excellence and trusted execution. Explore APAAR & PAN 2.0." path="/" />
      {/* HERO */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={IMAGES.heroOffice} alt="SKL Enterprises corporate team" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="section-label">SKL Enterprises</span>
            <h1 className="mt-5 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-[1.05]">
              Technology-Driven Public Service Solutions
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
              Empowering Digital Citizen Services Across India through innovation, technology,
              operational excellence and trusted execution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/projects" data-testid="hero-explore-btn">
                <Button className="bg-gold hover:bg-gold-dark text-slate-900 font-semibold h-13 px-7 py-6 rounded-sm text-base transition-colors w-full sm:w-auto">
                  Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/join" data-testid="hero-agent-btn">
                <Button className="bg-white hover:bg-slate-100 text-royal font-semibold h-13 px-7 py-6 rounded-sm text-base transition-colors w-full sm:w-auto">
                  Join Our Network
                </Button>
              </Link>
              <Link to="/contact" data-testid="hero-contact-btn">
                <Button variant="outline" className="border-white/40 bg-white/0 text-white hover:bg-white/10 h-13 px-7 py-6 rounded-sm text-base transition-colors w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-24 lg:py-32" data-testid="overview-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <Overline>Who We Are</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              A trusted partner in India's digital public-service transformation
            </h2>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              {COMPANY.name} bridges citizens with essential government and digital services.
              We combine reliable technology, disciplined operations and a trusted field network
              to make public services simpler, faster and more accessible.
            </p>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Guided by our core values of <span className="text-royal font-semibold">Quality</span>,{" "}
              <span className="text-royal font-semibold">Trust</span> and{" "}
              <span className="text-royal font-semibold">Commitment</span>, we execute
              technology-enabled public service projects with precision and integrity.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 text-royal font-semibold hover:gap-3 transition-all" data-testid="overview-about-link">
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="relative">
            <img src={IMAGES.officeTeam} alt="SKL professionals collaborating" className="w-full h-[460px] object-cover rounded-sm card-shadow" />
            <div className="absolute -bottom-6 -left-6 bg-royal text-white p-6 rounded-sm hidden sm:block card-shadow max-w-[220px]">
              <div className="text-3xl font-heading font-bold text-gold">South India</div>
              <div className="text-sm text-white/70 mt-1">Active service delivery focus across the region</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 lg:py-32 bg-slate-50" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Overline>What We Do</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Comprehensive citizen-service capabilities
            </h2>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-slate-200">
            {SERVICES.map((s, i) => {
              const Icon = ICONS[s.icon];
              return (
                <Reveal key={s.title} delay={i * 0.05}>
                  <div className="group p-8 lg:p-10 bg-white border-b border-r border-slate-200 h-full transition-colors hover:bg-royal" data-testid={`service-card-${i}`}>
                    <div className="h-12 w-12 rounded-sm bg-royal/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <Icon className="h-6 w-6 text-royal group-hover:text-gold transition-colors" />
                    </div>
                    <h3 className="mt-6 font-heading text-xl font-medium text-slate-900 group-hover:text-white transition-colors">{s.title}</h3>
                    <p className="mt-3 text-slate-600 group-hover:text-white/75 leading-relaxed transition-colors">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-24 lg:py-32" data-testid="featured-projects-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Overline>Featured Projects</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Flagship national initiatives we deliver
            </h2>
          </Reveal>
          <div className="mt-14 grid lg:grid-cols-2 gap-8">
            {[PROJECTS.apaar, PROJECTS["pan-2"]].map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.1}>
                <Link to={`/projects/${p.slug}`} className="group block relative overflow-hidden rounded-sm card-shadow" data-testid={`featured-project-${p.slug}`}>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={p.hero} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-0 p-8">
                    <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-[0.2em] font-semibold">
                      {p.slug === "apaar" ? <GraduationCap className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      Coverage: {p.coverage}
                    </div>
                    <h3 className="mt-3 font-heading text-3xl font-bold text-white">{p.name}</h3>
                    <p className="mt-2 text-white/80 max-w-md">{p.tagline}</p>
                    <span className="inline-flex items-center gap-2 mt-4 text-white font-semibold group-hover:gap-3 transition-all">
                      View Project <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="py-20 bg-royal-dark relative overflow-hidden" data-testid="stats-section">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #C5A059 0, transparent 40%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {STATS.map((s) => (
            <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* LEADERSHIP PREVIEW */}
      <section className="py-24 lg:py-32" data-testid="leadership-preview">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative bg-slate-50 border border-slate-200 rounded-sm aspect-[4/5] max-w-md overflow-hidden">
              {FOUNDER.photo ? (
                <img src={FOUNDER.photo} alt={FOUNDER.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="h-28 w-28 rounded-full bg-royal flex items-center justify-center text-white font-heading text-3xl font-bold">EA</div>
                  <p className="mt-6 text-slate-400 text-sm max-w-[200px]">Official founder photograph to be added here</p>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-royal text-white p-5">
                <div className="font-heading text-lg font-semibold">{FOUNDER.name}</div>
                <div className="text-gold text-sm">{FOUNDER.title}</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <Overline>Leadership</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
              Vision-led, execution-focused
            </h2>
            <div className="relative mt-8 pl-6 border-l-2 border-gold">
              <Quote className="h-8 w-8 text-gold/40 absolute -left-1 -top-2" />
              <p className="text-xl text-slate-700 italic leading-relaxed">"{FOUNDER.quote}"</p>
            </div>
            <p className="mt-6 text-slate-600 leading-relaxed">{FOUNDER.bio[0]}</p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 text-royal font-semibold hover:gap-3 transition-all" data-testid="leadership-about-link">
              Meet our leadership <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 lg:py-32 bg-slate-950 text-white" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Overline>Why Choose Us</Overline>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold tracking-tight text-white">
              Built on trust, delivered with excellence
            </h2>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.05}>
                <div className="flex gap-5" data-testid={`why-us-${i}`}>
                  <CheckCircle2 className="h-7 w-7 text-gold shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-xl font-medium">{w.title}</h3>
                    <p className="mt-2 text-slate-400 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gold" data-testid="cta-section">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 text-balance">
              Partner with SKL Enterprises today
            </h2>
            <p className="mt-5 text-lg text-slate-800/80 max-w-2xl mx-auto">
              Whether you're a citizen, aspiring agent, employee or investor — let's build India's
              digital public-service future together.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join"><Button className="bg-royal hover:bg-royal-dark text-white h-13 px-8 py-6 rounded-sm text-base transition-colors" data-testid="cta-join-btn">Join Our Network</Button></Link>
              <Link to="/contact"><Button className="bg-slate-900 hover:bg-slate-800 text-white h-13 px-8 py-6 rounded-sm text-base transition-colors" data-testid="cta-contact-btn">Get in Touch</Button></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
