// Shared left-hand brand panel for the wide horizontal auth cards (Login / Signup).
// Mono glass — black-and-white only.
const AuthBrandPanel = ({ eyebrow, title, subtitle }) => {
  return (
    <div className="relative hidden md:flex flex-col justify-between p-8 lg:p-10 bg-zinc-900 dark:bg-white/[0.03] border-r border-black/10 dark:border-white/10 overflow-hidden">
      {/* Subtle mono grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 text-white/70 text-[10px] font-semibold uppercase tracking-[0.3em]">
          {eyebrow}
        </div>
      </div>

      <div className="relative">
        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-white/60 mt-3 text-sm max-w-xs">{subtitle}</p>
      </div>

      <div className="relative flex items-center gap-2 text-white/40 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
        MAPP ARKS · StartupArk
      </div>
    </div>
  );
};

export default AuthBrandPanel;
