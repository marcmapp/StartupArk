// Shared left-hand brand panel for the wide horizontal auth cards (Login / Signup).
// Mono glass — black-and-white only.
const STEPS = ['Discover', 'Connect', 'Collaborate', 'Grow'];

const AuthBrandPanel = ({ eyebrow, title, subtitle, activeStep = 0 }) => {
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

      {/* Top: logo + eyebrow */}
      <div className="relative flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-white font-bold tracking-tight">MAPP ARKS</span>
        </div>

        <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-white/15 text-white/70 text-[10px] font-semibold uppercase tracking-[0.3em]">
          {eyebrow}
        </div>
      </div>

      {/* Middle: headline */}
      <div className="relative">
        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-white/60 mt-3 text-sm max-w-xs">{subtitle}</p>
      </div>

      {/* Bottom: step tracker + footer */}
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 w-14 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-semibold transition-colors ${
                    i <= activeStep
                      ? 'bg-white text-zinc-900 border-white'
                      : 'border-white/25 text-white/50'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-[9px] text-white/40 uppercase tracking-wide text-center">
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mt-3.5 ${i < activeStep ? 'bg-white/50' : 'bg-white/15'}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-white/40 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          MAPP ARKS · StartupArk
        </div>
      </div>
    </div>
  );
};

export default AuthBrandPanel;