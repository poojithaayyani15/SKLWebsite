import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" data-testid="breadcrumb" className="flex items-center gap-2 text-sm flex-wrap">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {it.to && !last ? (
              <Link to={it.to} className="text-white/70 hover:text-gold transition-colors">{it.label}</Link>
            ) : (
              <span className={last ? "text-gold font-medium" : "text-white/70"}>{it.label}</span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 text-white/40" />}
          </span>
        );
      })}
    </nav>
  );
}
