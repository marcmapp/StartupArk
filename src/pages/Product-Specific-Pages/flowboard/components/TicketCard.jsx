// pages/Product-Specific-Pages/flowboard/components/TicketCard.jsx
// A single generated task (Manager view) or task update (Contributor view).
import { useState } from 'react';
import { STATUS_LABEL } from '../flowboardData';

const chip = "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300";

const STATUS_STYLE = {
  review: 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400',
  progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  done: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft: 'bg-black/[0.03] dark:bg-white/[0.04] text-zinc-400 dark:text-zinc-500',
};

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="13" r="7" /><path d="M12 9v4l2 2M9 3l1.5 3M15 3l-1.5 3M2 13h3M19 13h3" />
    </svg>
  );
}

export default function TicketCard({ ticket, isManager, onPush }) {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(ticket.description ?? ticket.comment ?? '');

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{ticket.code}</span>
          <h4 className="text-[14px] font-semibold text-zinc-900 dark:text-white mt-0.5">{ticket.title}</h4>
        </div>
        <span className={`${chip} border-transparent ${STATUS_STYLE[ticket.status] ?? STATUS_STYLE.draft}`}>
          {STATUS_LABEL[ticket.status] ?? ticket.status}
        </span>
      </div>

      {isManager ? (
        <>
          <p
            className="text-[13px] leading-relaxed mt-2 text-zinc-500 dark:text-zinc-400"
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) => setDescription(e.currentTarget.textContent)}
            style={editing ? { outline: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6 } : undefined}
          >
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className={chip}><PersonIcon />{ticket.assignee}</span>
            <span className={chip}><CalendarIcon />{ticket.due}</span>
            <span className={chip}><TagIcon />{ticket.tag}</span>
            <select className={`${chip} cursor-pointer`} defaultValue={ticket.tracker}>
              <option>Jira</option>
              <option>Linear</option>
            </select>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-xl glass-inset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <p
            className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400"
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) => setDescription(e.currentTarget.textContent)}
            style={editing ? { outline: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6 } : undefined}
          >
            <span className="text-zinc-400 dark:text-zinc-500">draft comment — </span>
            {description}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/[0.06] dark:border-white/10">
        <button className="btn-ghost text-xs flex-1" onClick={() => setEditing((v) => !v)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {editing ? 'Done' : 'Edit'}
        </button>
        <button
          className="btn-mono text-xs flex-1 disabled:opacity-60"
          disabled={ticket.pushed}
          onClick={() => onPush(ticket.id, description)}
        >
          {ticket.pushed ? '✓ ' + (isManager ? 'pushed' : 'posted') : (isManager ? 'Push' : 'Post')}
          {!ticket.pushed && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
