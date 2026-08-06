import { Network, Users, Award, GraduationCap, CreditCard } from "lucide-react";
import { Reveal, Overline } from "@/components/Reveal";
import SEO from "@/components/SEO";
import AgentForm from "@/components/AgentForm";
import { PROJECTS } from "@/data/content";

export default function JoinNetwork() {
  const projects = [PROJECTS.apaar, PROJECTS["pan-2"]];
  return (
    <div data-testid="join-page">
      <SEO title="Join Our Network — Become a Partner" description="Join the SKL Enterprises network and deliver essential digital citizen services across South India. Coordinator and agent roles open for APAAR and PAN 2.0." path="/join" />
      <section className="relative pt-36 pb-20 bg-royal-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A059 0, transparent 45%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Overline className="!text-gold">Join Our Network</Overline>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance">
            Build a rewarding future with SKL Enterprises
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl">
            Become part of a trusted network delivering essential digital citizen services
            across South India. Choose a project below and register — our team will reach out.
          </p>
        </div>
      </section>

      {/* PROJECT OPPORTUNITIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <div className="border border-slate-200 rounded-sm p-8 card-shadow h-full bg-white" data-testid={`join-project-${p.slug}`}>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-sm bg-royal/10 flex items-center justify-center">
                    {p.slug === "apaar" ? <GraduationCap className="h-5 w-5 text-royal" /> : <CreditCard className="h-5 w-5 text-royal" />}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-gold uppercase tracking-wider">Coverage: {p.coverage}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Positions</p>
                <div className="mt-3 space-y-2">
                  {p.recruiting.map((r) => (
                    <div key={r} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-sm px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-gold" /><span className="text-slate-800 text-sm font-medium">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-5 gap-14 items-start">
          <Reveal className="lg:col-span-2 space-y-8">
            {[
              { icon: Network, t: "Trusted Network", d: "Join coordinators and agents delivering government-aligned services at the last mile." },
              { icon: Users, t: "Real Opportunity", d: "Create income and employment while serving citizens in your own region." },
              { icon: Award, t: "Training & Support", d: "Receive onboarding, process guidance and continuous operational support." },
            ].map((b) => (
              <div key={b.t} className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-sm bg-royal/10 flex items-center justify-center"><b.icon className="h-6 w-6 text-royal" /></div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-slate-900">{b.t}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{b.d}</p>
                </div>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-sm p-8 lg:p-10 card-shadow">
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">Network Registration</h2>
              <p className="text-slate-500 mb-8">Register for APAAR or PAN 2.0 across South India.</p>
              <AgentForm
                positions={["State Coordinator", "District Coordinator", "Field Agent", "Pincode-Level Agent"]}
                stateOptions={["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana", "Puducherry"]}
                coverage="South India"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
