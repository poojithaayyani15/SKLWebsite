import { Linkedin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useCompany } from "@/context/SiteContext";

// Editable social icons — links managed from Website Settings.
export default function SocialIcons({ tone = "dark", className = "" }) {
  const c = useCompany();
  const links = [
    { href: c.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { href: c.facebook, Icon: Facebook, label: "Facebook" },
    { href: c.instagram, Icon: Instagram, label: "Instagram" },
    { href: c.youtube, Icon: Youtube, label: "YouTube" },
    { href: c.twitter, Icon: Twitter, label: "X" },
  ].filter((l) => l.href);
  if (!links.length) return null;
  const styles = tone === "light"
    ? "border-slate-300 text-slate-600 hover:border-royal hover:text-royal"
    : "border-white/20 text-slate-300 hover:border-gold hover:text-gold";
  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="social-icons">
      {links.map(({ href, Icon, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
          className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${styles}`}>
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
