// pages/Product-Specific-Pages/flowboard/FlowboardCanvas.jsx
// Flowboard's main working surface — type, paste, or record, then extract into
// tasks. Route: /flowboard. Ported from the flowboard prototype's canvas page,
// restyled onto the mono glass design system. Role comes from Flowboard's own
// RoleSwitcher (not StartupArk's startuparkRole — see useFlowboardUser.js).
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { useFlowboardUser } from './useFlowboardUser';
import { SAMPLES, DEFAULT_TICKETS } from './flowboardData';
import { getDraft, setDraft, getTickets, setTickets, addActivity } from './flowboardStore';
import PipelineModal from './components/PipelineModal';
import RoleSwitcher from './components/RoleSwitcher';

const chipBase = "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300";
const chipClickable = "hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors";

const MIC_PATH = (
  <>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </>
);
const STOP_PATH = <rect x="6" y="6" width="12" height="12" rx="2" />;

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' + r : r}`;
}

export default function FlowboardCanvas() {
  const navigate = useNavigate();
  const { flowboardRole, setFlowboardRole, loading } = useFlowboardUser();

  const draft = getDraft();
  const [text, setText] = useState(draft.text);
  const [hasAudio, setHasAudio] = useState(draft.hasAudio);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [showAutosave, setShowAutosave] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const timerRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const isManager = flowboardRole === 'admin';

  function flashAutosave() {
    setShowAutosave(true);
    clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => setShowAutosave(false), 1600);
  }

  function persistDraft(nextText, nextHasAudio) {
    setDraft({ text: nextText, hasAudio: nextHasAudio });
  }

  function handleTextChange(e) {
    const value = e.target.value;
    setText(value);
    persistDraft(value, hasAudio);
    if (value.trim()) flashAutosave();
  }

  function handleExampleClick(kind) {
    if (kind === 'clear') {
      setText('');
      setHasAudio(false);
      persistDraft('', false);
      textareaRef.current?.focus();
      return;
    }
    const value = SAMPLES[flowboardRole][kind];
    setText(value);
    persistDraft(value, hasAudio);
    textareaRef.current?.focus();
    flashAutosave();
  }

  function toggleRecording() {
    if (!isRecording) {
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
      return;
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    setTranscribing(true);
    setTimeout(() => {
      setTranscribing(false);
      const transcript = SAMPLES[flowboardRole].meeting;
      setText((prev) => {
        const next = prev.trim() ? `${prev.trim()}\n\n${transcript}` : transcript;
        persistDraft(next, true);
        return next;
      });
      setHasAudio(true);
      flashAutosave();
    }, 1300);
  }

  function handleExtract() {
    if (!text.trim()) {
      textareaRef.current?.focus();
      return;
    }
    setPipelineOpen(true);
  }

  function handlePipelineDone() {
    setPipelineOpen(false);
    const generated = DEFAULT_TICKETS[flowboardRole];
    const tickets = getTickets();
    setTickets({ ...tickets, [flowboardRole]: generated.map((t) => ({ ...t, pushed: false })) });
    addActivity({
      verb: isManager
        ? (hasAudio ? 'Recorded and summarised a meeting into' : 'Extracted from the canvas')
        : (hasAudio ? 'Recorded and posted an update to' : 'Posted a check-in update to'),
      count: generated.length,
      unit: 'tasks',
      role: isManager ? 'Manager' : 'Contributor',
      audio: hasAudio,
    });
    setText('');
    setHasAudio(false);
    persistDraft('', false);
    navigate('/flowboard/tasks');
  }

  if (loading) return <Loader />;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[760px]">
        <div className="flex justify-center mb-5">
          <RoleSwitcher flowboardRole={flowboardRole} onChange={setFlowboardRole} />
        </div>

        <div className="text-center mb-8">
          <span className={`${chipBase} mb-4`}>{isManager ? 'FREEFORM' : 'CHECK IN'}</span>
          <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white mt-4">
            {isManager ? "What's on your mind?" : 'What did you get done?'}
          </h1>
          <p className="mt-2 text-[14.5px] text-zinc-500 dark:text-zinc-400">
            {isManager
              ? 'Type it, paste it, or just talk — Flowboard will summarise it into tasks.'
              : 'Give a quick update — Flowboard will match it to your tasks.'}
          </p>
        </div>

        <div className="glass-panel p-6 md:p-7">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Start typing, or hit record and talk through it..."
            rows={7}
            className="w-full bg-transparent border-none outline-none resize-none text-[16px] md:text-[18px] leading-[1.85] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />

          <div className="flex items-center justify-between mt-4 pt-4 flex-wrap gap-3 border-t border-black/[0.06] dark:border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleRecording}
                aria-label="Record"
                className={`fb-record-btn ${isRecording ? 'recording' : ''}`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {isRecording ? STOP_PATH : MIC_PATH}
                </svg>
              </button>

              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="fb-waveform">
                    <span /><span /><span /><span /><span />
                  </div>
                  <span className="font-mono text-[13px] text-red-500 font-medium">{fmtTime(recordSeconds)}</span>
                </div>
              ) : transcribing ? (
                <div className="text-[12.5px] flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Transcribing...
                </div>
              ) : (
                <div className="text-[12.5px] text-zinc-400 dark:text-zinc-500">Record a conversation</div>
              )}

              <span className={`${chipBase} transition-opacity ${showAutosave ? 'opacity-100' : 'opacity-0'}`}>draft saved</span>
            </div>

            <button className="btn-mono" onClick={handleExtract}>
              {isManager ? 'Extract' : 'Update'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
          <span className="text-[11.5px] mr-1 text-zinc-400 dark:text-zinc-500">Try:</span>
          <span className={`${chipBase} ${chipClickable}`} onClick={() => handleExampleClick('sample')}>Standup notes</span>
          <span className={`${chipBase} ${chipClickable}`} onClick={() => handleExampleClick('meeting')}>Meeting recap</span>
          <span className={`${chipBase} ${chipClickable}`} onClick={() => handleExampleClick('clear')}>Clear canvas</span>
        </div>
      </div>

      <PipelineModal
        open={pipelineOpen}
        flowboardRole={flowboardRole}
        hasAudio={hasAudio}
        resultCount={DEFAULT_TICKETS[flowboardRole]?.length ?? 2}
        onDone={handlePipelineDone}
      />
    </div>
  );
}
