import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function StatCounter({ value, suffix = "", label, duration = 1800 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const step = (t) => {
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return (
    <div ref={ref} data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="font-heading text-4xl sm:text-5xl font-bold text-white">
        {count.toLocaleString()}<span className="text-gold">{suffix}</span>
      </div>
      <div className="mt-2 text-sm text-white/70 tracking-wide">{label}</div>
    </div>
  );
}
