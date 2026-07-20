import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { POSITION_CATEGORY, COMMITMENT_LABELS, COMPENSATION_LABELS } from './projectArkLabels';

const CATEGORY_OPTIONS = Object.entries(POSITION_CATEGORY).map(([v, meta]) => ({ v, label: meta.label }));
const COMMITMENT_OPTIONS = Object.entries(COMMITMENT_LABELS).map(([v, label]) => ({ v, label }));
const COMPENSATION_OPTIONS = Object.entries(COMPENSATION_LABELS).map(([v, label]) => ({ v, label }));

const EMPTY_DRAFT = {
  title: '', positionCategory: 'core-team', description: '', requiredSkillsRaw: '',
  commitment: 'full-time', compensationType: 'equity', compensationText: '',
  applyVia: 'proposal', headcount: 1,
};

const SEL = 'input-mono text-xs w-full [&>option]:bg-zinc-900 [&>option]:text-zinc-100';

export default function RequiredPositionsEditor({ positions, onChange }) {
  const [draft, setDraft] = useState(null); // null = not adding

  function setField(key, value) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function addPosition() {
    if (!draft?.title?.trim()) return;
    const position = {
      title: draft.title.trim(),
      positionCategory: draft.positionCategory,
      description: draft.description.trim(),
      requiredSkills: draft.requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean),
      commitment: draft.commitment,
      compensationType: draft.compensationType,
      compensationText: draft.compensationText.trim(),
      applyVia: draft.applyVia,
      headcount: Math.max(1, Number(draft.headcount) || 1),
    };
    onChange([...positions, position]);
    setDraft(null);
  }

  function removePosition(idx) {
    onChange(positions.filter((_, i) => i !== idx));
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Required Positions</label>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            List the people you need — a co-founder, core team, or freelance role — each with its own apply flow.
          </p>
        </div>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft(EMPTY_DRAFT)}
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Add
          </button>
        )}
      </div>

      {/* Existing positions */}
      {positions.length > 0 && (
        <div className="space-y-2">
          {positions.map((p, idx) => (
            <div key={idx} className="glass-inset px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-200 truncate">{p.title}</div>
                <div className="text-[10px] text-zinc-500">
                  {POSITION_CATEGORY[p.positionCategory]?.label} · {COMMITMENT_LABELS[p.commitment]} · {COMPENSATION_LABELS[p.compensationType]}
                  {p.compensationText ? ` (${p.compensationText})` : ''} · {p.applyVia === 'application' ? 'takes applications' : 'takes proposals'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePosition(idx)}
                className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Draft row */}
      {draft && (
        <div className="glass-inset p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">New Position</span>
            <button type="button" onClick={() => setDraft(null)} className="text-zinc-600 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Position title — e.g. Co-Founder (Tech), Frontend Engineer"
            value={draft.title}
            onChange={e => setField('title', e.target.value)}
            className="input-mono text-sm w-full"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select value={draft.positionCategory} onChange={e => setField('positionCategory', e.target.value)} className={SEL}>
              {CATEGORY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <select value={draft.commitment} onChange={e => setField('commitment', e.target.value)} className={SEL}>
              {COMMITMENT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
            <select value={draft.compensationType} onChange={e => setField('compensationType', e.target.value)} className={SEL}>
              {COMPENSATION_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Compensation detail — e.g. ₹8-12 LPA + 1-2% equity"
              value={draft.compensationText}
              onChange={e => setField('compensationText', e.target.value)}
              className="input-mono text-xs w-full"
            />
            <select value={draft.applyVia} onChange={e => setField('applyVia', e.target.value)} className={SEL}>
              <option value="proposal">Takes proposals (negotiation)</option>
              <option value="application">Takes applications (resume)</option>
            </select>
          </div>

          <textarea
            placeholder="What this position will own (optional)…"
            value={draft.description}
            onChange={e => setField('description', e.target.value)}
            rows={2}
            className="input-mono text-xs w-full resize-none"
          />

          <input
            type="text"
            placeholder="Skills — comma-separated"
            value={draft.requiredSkillsRaw}
            onChange={e => setField('requiredSkillsRaw', e.target.value)}
            className="input-mono text-xs w-full"
          />

          <button type="button" onClick={addPosition} className="btn-mono text-xs px-4 py-2 w-full">
            Add Position
          </button>
        </div>
      )}

      {positions.length === 0 && !draft && (
        <p className="text-[11px] text-zinc-600">No positions added — this project will use a single apply-to-whole-post flow.</p>
      )}
    </div>
  );
}
