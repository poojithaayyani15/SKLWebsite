import { useSite } from "@/context/SiteContext";

export default function MaintenanceGate({ children }) {
  const { company } = useSite();
  if (company.maintenance_mode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6" data-testid="maintenance-screen">
        <img src="/logo-skl.png" alt="SKL Enterprises" className="h-24 w-24 object-contain" />
        <h1 className="mt-6 font-heading text-3xl font-bold text-white">We'll be right back</h1>
        <p className="mt-3 text-slate-400 max-w-md">{company.maintenance_message || "Our website is undergoing scheduled maintenance. Please check back shortly."}</p>
        <div className="mt-6 text-gold text-xs tracking-[0.25em] uppercase">SKL Enterprises</div>
      </div>
    );
  }
  return children;
}
