// pages/Product-Specific-Pages/flowboard/FlowboardSetup.jsx
// Route: /flowboard/setup — one-time Manager/Contributor registration.
// Mirrors StartupArk's role-selection wizard pattern (pick role -> agree to
// terms -> land in product), scaled down: no separate profile-collection
// step, and the role is permanent once agreed (no in-app switcher, unlike
// StartupArk's startuparkRole which any later POST can still overwrite).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { useFlowboardUser } from './useFlowboardUser';
import { setFlowboardRole, agreeFlowboardRole } from './flowboardOnboardingApi';

const ROLES = [
  {
    id: 'manager',
    label: 'Manager',
    blurb: 'Turn notes and meeting recaps into tasks, assign them, push to your tracker.',
  },
  {
    id: 'contributor',
    label: 'Contributor',
    blurb: 'Give quick check-ins — Flowboard matches them to your open tasks and drafts updates.',
  },
];

const TERMS = {
  manager:
    'As a Manager, notes and recordings you submit are sent to an AI provider to extract tasks. Extracted tasks are visible to the contributors they get assigned to.',
  contributor:
    'As a Contributor, check-ins you submit are matched against tasks assigned to you and used to draft status updates on your behalf, for you to review before posting.',
};

export default function FlowboardSetup() {
  const navigate = useNavigate();
  const { user, loading } = useFlowboardUser();
  const [step, setStep] = useState(null); // 'role' | 'agree' | 'done'
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.flowboardRole) {
      setRole(user.flowboardRole);
      setDisplayName(user.flowboardDisplayName || user.username || '');
      setStep('agree');
    } else {
      setStep('role');
    }
  }, [user]);

  async function handleRoleSelect(id) {
    setError(null);
    setSubmitting(true);
    try {
      await setFlowboardRole(id);
      setRole(id);
      setDisplayName(user?.username || '');
      setStep('agree');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save your role. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAgree() {
    setError(null);
    setSubmitting(true);
    try {
      await agreeFlowboardRole(displayName);
      setStep('done');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !step) return <Loader />;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[560px]">
        {step === 'role' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white">
                Welcome to Flowboard
              </h1>
              <p className="mt-2 text-[14.5px] text-zinc-500 dark:text-zinc-400">
                How will you be using it? This can't be changed later.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  disabled={submitting}
                  onClick={() => handleRoleSelect(r.id)}
                  className="glass-card p-5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition-colors disabled:opacity-60"
                >
                  <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">{r.label}</h3>
                  <p className="text-[12.5px] mt-1.5 text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {r.blurb}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'agree' && (
          <div className="glass-card p-7">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              You're registering as {role === 'manager' ? 'a Manager' : 'a Contributor'}
            </h1>
            <p className="text-[13px] mt-3 text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {TERMS[role]}
            </p>

            <label className="block mt-5">
              <span className="text-[12.5px] font-medium text-zinc-600 dark:text-zinc-300">
                Display name
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. your first name"
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/15 text-zinc-900 dark:text-white outline-none focus:border-black/25 dark:focus:border-white/30"
              />
              <span className="block mt-1.5 text-[11.5px] text-zinc-400 dark:text-zinc-500">
                Used to match you to tasks written about you in notes and check-ins.
              </span>
            </label>

            <button
              className="btn-mono w-full mt-6 disabled:opacity-60"
              disabled={submitting || !displayName.trim()}
              onClick={handleAgree}
            >
              I agree, continue
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="glass-card p-9 text-center">
            <div className="fb-success-check mx-auto">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mt-4">You're set up</h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1.5">
              Registered as {role === 'manager' ? 'a Manager' : 'a Contributor'}.
            </p>
            <button className="btn-mono w-full mt-7" onClick={() => navigate('/flowboard')}>
              Go to Flowboard
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl text-[13px] text-center text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
