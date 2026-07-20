// pages/Product-Specific-Pages/flowboard/components/PipelineModal.jsx
// Progress → success modal shown while Flowboard "extracts" tasks from the
// canvas text. Timing/step-through logic ported from the flowboard prototype;
// visuals restyled onto glass-card + fb-pipeline-* tokens (index.css).
import { useEffect, useState } from 'react';
import { PIPELINE_LABELS } from '../flowboardData';

const STEP_MS = 420;

export default function PipelineModal({ open, flowboardRole, hasAudio, resultCount, onDone }) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [phase, setPhase] = useState('progress'); // 'progress' | 'success'

  const labels = hasAudio ? PIPELINE_LABELS[flowboardRole].withAudio : PIPELINE_LABELS[flowboardRole].base;

  useEffect(() => {
    if (!open) return;
    setPhase('progress');
    setStepIndex(-1);

    const timers = labels.map((_, i) => setTimeout(() => setStepIndex(i), i * STEP_MS));
    const successTimer = setTimeout(() => setPhase('success'), labels.length * STEP_MS + 300);
    const autoAdvanceTimer = setTimeout(() => onDone?.(), labels.length * STEP_MS + 300 + 1500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(successTimer);
      clearTimeout(autoAdvanceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasAudio, flowboardRole]);

  if (!open) return null;

  const isManager = flowboardRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 dark:bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[440px] glass-card p-9 text-center">
        {phase === 'progress' ? (
          <>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Working on it</h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-7">
              {hasAudio ? 'Transcribing your recording, then summarising into tasks...' : 'Reading through what you gave us...'}
            </p>

            <div className="flex items-center gap-0">
              {labels.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`fb-pipeline-node ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
                  >
                    {i + 1}
                  </div>
                  {i < labels.length - 1 && (
                    <div className="fb-pipeline-track">
                      <div className="fb-pipeline-fill" style={{ width: i < stepIndex ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex mt-2">
              {labels.map((label) => (
                <span key={label} className="flex-1 text-center text-[10.5px] text-zinc-400 dark:text-zinc-500">
                  {label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="fb-success-check">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-4">
              {resultCount} tasks {isManager ? 'created' : 'updated'}
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5">
              {isManager ? 'Ready for a quick review before they go out.' : 'Comments drafted and matched, ready to post.'}
            </p>
            <button className="btn-mono w-full mt-7" onClick={() => onDone?.()}>
              View tasks
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
