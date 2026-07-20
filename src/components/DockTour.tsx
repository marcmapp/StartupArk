// DockTour.tsx — one-time spotlight onboarding for the unified dock.
// Reads element positions via data-tour attributes; no external library.
// Persisted server-side via PUT /startupark/api/nav-preferences (hasSeenDockTour).
//
// Step 1: avatar menu
// Step 2: nav items row
// The launcher step was removed in Phase 5 — there is no launcher any more.

import { useState, useEffect } from "react";

const STEPS = [
  {
    target: "dock-avatar",
    caption:
      "Your profile and account menu. Tap any time to log out or switch to another app.",
  },
  {
    target: "dock-pinned",
    caption:
      "All your navigation shortcuts are here. Tap any icon to jump straight there.",
  },
];

function getRect(tourKey: string): DOMRect | null {
  return (
    document.querySelector<HTMLElement>(`[data-tour="${tourKey}"]`)?.getBoundingClientRect() ??
    null
  );
}

type Props = { onComplete: () => void };

export function DockTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [rects, setRects] = useState<(DOMRect | null)[]>([]);

  useEffect(() => {
    // Give the dock time to fully render before measuring.
    const t = setTimeout(() => {
      setRects(STEPS.map((s) => getRect(s.target)));
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const target = rects[step];
  if (!target) return null;

  const isLast = step === STEPS.length - 1;

  const advance = () => {
    if (isLast) onComplete();
    else setStep((s) => s + 1);
  };

  // Clamp caption card so it never overflows viewport edges.
  const cardWidth = 264;
  const cardLeft = Math.min(
    Math.max(target.left - 8, 8),
    window.innerWidth - cardWidth - 8,
  );
  const cardBottom = window.innerHeight - target.top + 16;

  const pad = 6;
  const hl = {
    top:    target.top    - pad,
    left:   target.left   - pad,
    width:  target.width  + pad * 2,
    height: target.height + pad * 2,
  };

  return (
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-label="Dock introduction"
    >
      {/* Four-rect dim overlay — leaves a spotlight hole at the target element */}
      <div
        className="pointer-events-auto absolute inset-0 cursor-pointer"
        onClick={advance}
      >
        <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: hl.top }} />
        <div className="absolute bg-black/60" style={{ top: hl.top, left: 0, width: hl.left, height: hl.height }} />
        <div className="absolute bg-black/60" style={{ top: hl.top, left: hl.left + hl.width, right: 0, height: hl.height }} />
        <div className="absolute bg-black/60" style={{ top: hl.top + hl.height, left: 0, right: 0, bottom: 0 }} />
      </div>

      {/* Spotlight ring */}
      <div
        className="pointer-events-none absolute rounded-xl border-2 border-white/80 shadow-[0_0_0_4px_rgba(255,255,255,0.15)]"
        style={{ top: hl.top, left: hl.left, width: hl.width, height: hl.height }}
      />

      {/* Caption card */}
      <div
        className="pointer-events-auto absolute"
        style={{ left: cardLeft, bottom: cardBottom, width: cardWidth }}
      >
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm leading-snug text-zinc-900 dark:text-white">
            {STEPS[step].caption}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {step + 1} / {STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onComplete}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Skip
              </button>
              <button
                onClick={advance}
                className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
