import { Cpu, Monitor, Smartphone, ShieldCheck } from 'lucide-react';

const FLOAT_CARDS = [
  {
    icon: Monitor,
    label: 'Laptops & displays',
    grade: 'Grade A',
    accent: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    glow: 'shadow-[0_0_40px_-12px_rgba(59,130,246,0.35)]',
    rotate: '-rotate-6',
    position: 'top-4 left-2 sm:left-6',
    delay: '0s',
  },
  {
    icon: Smartphone,
    label: 'Phones & tablets',
    grade: 'Tested',
    accent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    glow: 'shadow-[0_0_40px_-12px_rgba(34,211,238,0.3)]',
    rotate: 'rotate-3',
    position: 'top-[38%] right-0 sm:right-4',
    delay: '-2s',
  },
  {
    icon: ShieldCheck,
    label: 'Quality checked',
    grade: 'Refurbished',
    accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    glow: 'shadow-[0_0_40px_-12px_rgba(52,211,153,0.25)]',
    rotate: '-rotate-2',
    position: 'bottom-6 left-8 sm:left-14',
    delay: '-4s',
  },
];

export default function HeroVisual() {
  return (
    <>
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-float-card { animation: none !important; }
        }
      `}</style>

      <div
        className="relative hidden lg:flex items-center justify-center min-h-[420px] xl:min-h-[460px]"
        aria-hidden
      >
        {/* Ambient glow behind panel */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(37,99,235,0.18),transparent_65%)]" />

        {/* Main glass panel */}
        <div className="relative w-full max-w-md aspect-square rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          {/* Inner mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_45%)]" />

          {/* Circuit grid */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Center hub */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl scale-150 motion-safe:animate-pulse motion-reduce:animate-none" />
              <div className="relative w-24 h-24 rounded-2xl border border-blue-500/40 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)]">
                <Cpu className="w-11 h-11 text-blue-300" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Orbiting ring */}
          <div className="absolute inset-8 rounded-full border border-dashed border-white/10 motion-safe:animate-[spin_30s_linear_infinite] motion-reduce:animate-none" />
          <div className="absolute inset-16 rounded-full border border-white/5" />

          {/* Floating product cards */}
          {FLOAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`absolute ${card.position} ${card.rotate}`}
              >
                <div
                  className="hero-float-card motion-safe:animate-[hero-float_7s_ease-in-out_infinite] motion-reduce:animate-none"
                  style={{ animationDelay: card.delay }}
                >
                  <div
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-md ${card.accent} ${card.glow}`}
                  >
                  <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/90 truncate">{card.label}</p>
                    <p className="text-[10px] font-medium opacity-70">{card.grade}</p>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
