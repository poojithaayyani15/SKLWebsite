export const Logo = ({ variant = "dark", className = "", showText = true }) => {
  const isLight = variant === "light";
  const textColor = isLight ? "text-white" : "text-slate-900";
  const subColor = isLight ? "text-white/60" : "text-slate-500";
  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="skl-logo">
      <img src="/logo-skl.png" alt="SKL Enterprises" className="h-14 w-14 object-contain shrink-0" />
      {showText && (
        <div className="leading-none">
          <div className={`font-heading font-extrabold tracking-tight text-lg sm:text-xl ${textColor}`}>
            SKL ENTERPRISES
          </div>
          <div className={`text-[9px] sm:text-[10px] tracking-[0.18em] uppercase mt-1 ${subColor}`}>
            Public Service Solutions
          </div>
        </div>
      )}
    </div>
  );
};
