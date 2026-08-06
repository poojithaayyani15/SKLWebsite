import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6" data-testid="not-found-page">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." path="/404" />
      <img src="/logo-skl.png" alt="SKL Enterprises" className="h-20 w-20 object-contain" />
      <div className="mt-8 font-heading text-7xl font-bold text-gold">404</div>
      <h1 className="mt-4 font-heading text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-slate-400 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link to="/"><Button className="bg-royal hover:bg-royal-dark text-white rounded-sm h-11 px-6" data-testid="notfound-home"><Home className="h-4 w-4 mr-2" /> Back to Home</Button></Link>
        <Link to="/contact"><Button variant="outline" className="border-white/30 bg-white/0 text-white hover:bg-white/10 rounded-sm h-11 px-6">Contact Us</Button></Link>
      </div>
    </div>
  );
}
