import SEO from "@/components/SEO";
import { Reveal, Overline } from "@/components/Reveal";
import { useCompany } from "@/context/SiteContext";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    intro: "SKL Enterprises is committed to protecting the privacy of every citizen, partner and applicant who interacts with us.",
    sections: [
      { h: "Information We Collect", p: "We collect information you voluntarily provide through our forms — such as name, contact details, location and application details — to deliver and facilitate government and digital citizen services." },
      { h: "How We Use Information", p: "Your information is used solely to process enquiries, applications and service requests, to contact you regarding our services, and to meet operational and legal requirements." },
      { h: "Data Security", p: "We apply reasonable technical and organisational measures to protect your information against unauthorised access, disclosure or misuse." },
      { h: "Third Parties", p: "We do not sell your personal information. Data may be shared with authorised programme partners only to the extent required to deliver the requested service." },
      { h: "Your Rights", p: "You may request access to, correction of, or deletion of your personal information by contacting us using the details on our Contact page." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "By accessing and using the SKL Enterprises website you agree to the following terms and conditions.",
    sections: [
      { h: "Use of Website", p: "This website is provided for information and service-facilitation purposes. You agree to use it lawfully and not to misuse any content or functionality." },
      { h: "Service Facilitation", p: "SKL Enterprises facilitates access to government and digital citizen services in line with publicly available guidelines. Eligibility, documentation and final processing are governed by the respective programme authorities." },
      { h: "Agent & Career Applications", p: "Submission of an application does not guarantee appointment, empanelment or employment. All applications are subject to verification and internal review." },
      { h: "Intellectual Property", p: "All content, branding and materials on this website are the property of SKL Enterprises unless otherwise stated and may not be reproduced without permission." },
      { h: "Limitation of Liability", p: "SKL Enterprises shall not be liable for any indirect or consequential loss arising from the use of this website or reliance on its content." },
    ],
  },
};

export default function Legal({ type }) {
  const c = useCompany();
  const data = CONTENT[type] || CONTENT.privacy;
  return (
    <div data-testid={`legal-${type}`}>
      <SEO title={data.title} description={data.intro} path={`/${type}`} />
      <section className="relative pt-36 pb-16 bg-royal-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #C5A059 0, transparent 45%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <Overline className="!text-gold">Legal</Overline>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl font-bold text-white">{data.title}</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Reveal><p className="text-lg text-slate-600 leading-relaxed">{data.intro}</p></Reveal>
          <div className="mt-10 space-y-8">
            {data.sections.map((s, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <h2 className="font-heading text-xl font-semibold text-slate-900">{s.h}</h2>
                <p className="mt-2 text-slate-600 leading-relaxed">{s.p}</p>
              </Reveal>
            ))}
            <Reveal><p className="text-slate-500 text-sm pt-6 border-t border-slate-200">For any questions regarding this {data.title.toLowerCase()}, contact us at <a href={`mailto:${c.email}`} className="text-royal font-medium">{c.email}</a>.</p></Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
