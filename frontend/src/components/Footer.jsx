import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { COMPANY } from "@/data/content";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <Logo variant="light" />
          <p className="mt-6 text-sm leading-relaxed text-slate-400 max-w-xs">
            {COMPANY.positioning}. Empowering digital citizen services across India through trusted execution.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-white text-sm font-semibold tracking-wide uppercase mb-5">Company</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            <li><Link to="/projects" className="hover:text-gold transition-colors">Our Projects</Link></li>
            <li><Link to="/careers" className="hover:text-gold transition-colors">Careers</Link></li>
            <li><Link to="/join" className="hover:text-gold transition-colors">Join Our Network</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-white text-sm font-semibold tracking-wide uppercase mb-5">Projects</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/projects/apaar" className="hover:text-gold transition-colors">APAAR</Link></li>
            <li><Link to="/projects/pan-2" className="hover:text-gold transition-colors">PAN 2.0</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
            <li><Link to="/admin/login" className="hover:text-gold transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-white text-sm font-semibold tracking-wide uppercase mb-5">Reach Us</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>{COMPANY.address}</span></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /><a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-gold">{COMPANY.phone}</a></li>
            <li className="flex gap-3"><MessageCircle className="h-4 w-4 mt-0.5 text-gold shrink-0" /><a href={`https://wa.me/${COMPANY.whatsappRaw}`} target="_blank" rel="noreferrer" className="hover:text-gold">{COMPANY.whatsapp}</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /><a href={`mailto:${COMPANY.email}`} className="hover:text-gold">{COMPANY.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SKL Enterprises. All rights reserved.</p>
          <p>Founder &amp; Managing Director — E.L. Ashok Anand</p>
        </div>
      </div>
    </footer>
  );
}
