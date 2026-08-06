import { Network, Users, Award } from "lucide-react";
import { Reveal, Overline } from "@/components/Reveal";
import AgentForm from "@/components/AgentForm";

export default function JoinNetwork() {
  return (
    <div data-testid="join-page">
      <section className="relative pt-36 pb-20 bg-royal-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A059 0, transparent 45%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Overline className="!text-gold">Join Our Network</Overline>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl text-balance">
            Build a rewarding future as an SKL agent
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl">
            Become part of a trusted field network delivering essential digital citizen services
            across South India. Register below and our partnerships team will reach out.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32">
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
              <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-8">Agent Registration Form</h2>
              <AgentForm roles={["State Coordinator", "District Coordinator", "Field Agent", "Pincode Level Agent"]} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
