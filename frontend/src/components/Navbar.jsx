import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/projects", label: "Projects" },
  { to: "/join", label: "Join Our Network" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[background,box-shadow,border] duration-300 ${
        scrolled ? "glass-nav border-b border-slate-200/60 shadow-sm" : "bg-transparent"
      }`}
      data-testid="main-navbar"
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between gap-6">
        <Link to="/" data-testid="nav-logo-link">
          <Logo variant={scrolled ? "dark" : "dark"} />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-sm transition-colors duration-200 ${
                  isActive ? "text-royal" : "text-slate-600 hover:text-royal"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/join" data-testid="nav-cta-agent">
            <Button className="bg-royal hover:bg-royal-dark text-white rounded-sm px-6 h-11 text-[15px] transition-colors">
              Join Our Network
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden text-royal p-2"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-1 shadow-lg" data-testid="mobile-menu">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-3 py-3 text-base font-medium rounded-sm ${
                  isActive ? "text-royal bg-royal/5" : "text-slate-700"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/join">
            <Button className="w-full mt-2 bg-royal text-white rounded-sm">Join Our Network</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
