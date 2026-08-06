import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(!sessionStorage.getItem("skl_loaded"));
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => { setVisible(false); sessionStorage.setItem("skl_loaded", "1"); }, 1300);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
          data-testid="loading-screen"
        >
          <motion.img
            src="/logo-skl.png" alt="SKL Enterprises"
            className="h-24 w-24 object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="mt-6 font-heading text-white text-xl font-bold tracking-tight">SKL ENTERPRISES</div>
          <div className="mt-2 text-gold text-[11px] tracking-[0.25em] uppercase">Public Service Solutions</div>
          <div className="mt-8 h-0.5 w-40 bg-white/10 overflow-hidden rounded-full">
            <motion.div className="h-full bg-gold" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.1, ease: "easeInOut" }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
