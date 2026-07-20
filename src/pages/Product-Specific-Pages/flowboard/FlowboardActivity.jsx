// pages/Product-Specific-Pages/flowboard/FlowboardActivity.jsx
// Route: /flowboard/activity — what's happened in this Flowboard workspace.
import Loader from '../../../components/Loader';
import { useFlowboardUser } from './useFlowboardUser';
import { getActivity } from './flowboardStore';
import RoleSwitcher from './components/RoleSwitcher';

function ActivityIcon({ audio }) {
  return audio ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function FlowboardActivity() {
  const { flowboardRole, setFlowboardRole, loading } = useFlowboardUser();
  const activity = getActivity();

  if (loading) return <Loader />;

  return (
    <div className="flex-1">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Activity</h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">What's happened in your Flowboard workspace.</p>
        </div>
        <RoleSwitcher flowboardRole={flowboardRole} onChange={setFlowboardRole} />
      </div>

      {activity.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map((entry) => (
            <div key={entry.id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-300">
                <ActivityIcon audio={entry.audio} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] text-zinc-900 dark:text-white">
                  {entry.verb} {entry.count} {entry.unit}
                </p>
                <p className="text-[11.5px] mt-0.5 text-zinc-400 dark:text-zinc-500">
                  {entry.role} · {entry.when}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
