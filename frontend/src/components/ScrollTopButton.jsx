import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      data-testid="scroll-top-btn"
      aria-label="Scroll to top"
      className="fixed bottom-24 right-6 z-40 h-11 w-11 rounded-full bg-royal text-white flex items-center justify-center shadow-lg hover:bg-royal-dark transition-colors"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
