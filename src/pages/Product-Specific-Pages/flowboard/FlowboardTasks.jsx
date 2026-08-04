// pages/Product-Specific-Pages/flowboard/FlowboardTasks.jsx
// Route: /flowboard/tasks — review/push generated tasks (Manager) or
// review/post drafted status updates (Contributor).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { useFlowboardUser } from './useFlowboardUser';
import { fetchTasks, editTask, pushTask, postUpdate, toTicket, isAuthError, needsOnboarding, apiErrorMessage } from './flowboardApi';
import TicketCard from './components/TicketCard';

export default function FlowboardTasks() {
  const navigate = useNavigate();
  const { flowboardRole, loading } = useFlowboardUser();
  const isManager = flowboardRole === 'manager';
  const [tickets, setLocalTickets] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!flowboardRole) return;
    let cancelled = false;
    setTasksLoading(true);
    fetchTasks()
      .then((tasks) => {
        if (cancelled) return;
        setLocalTickets(tasks.map((t) => toTicket(t, isManager)));
      })
      .catch((err) => {
        if (cancelled) return;
        if (isAuthError(err)) { navigate('/login'); return; }
        if (needsOnboarding(err)) { navigate('/flowboard/setup'); return; }
        setActionError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setTasksLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowboardRole]);

  async function handlePush(id, editedText) {
    setActionError(null);
    try {
      if (isManager) {
        await editTask(id, { description: editedText });
        const updated = await pushTask(id, 'jira');
        setLocalTickets((prev) => prev.map((t) => (t.id === id ? toTicket(updated, isManager) : t)));
      } else {
        await editTask(id, { draft_comment: editedText });
        const updated = await postUpdate(id);
        setLocalTickets((prev) => prev.map((t) => (t.id === id ? toTicket(updated, isManager) : t)));
      }
    } catch (err) {
      if (isAuthError(err)) { navigate('/login'); return; }
      if (needsOnboarding(err)) { navigate('/flowboard/setup'); return; }
      setActionError(apiErrorMessage(err));
    }
  }

  if (loading || tasksLoading) return <Loader />;

  return (
    <div className="flex-1">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            {isManager ? 'Generated tasks' : 'Task updates'}
          </h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            {isManager ? 'Review, edit, and push to your tracker.' : 'Matched from your check-in, ready to post.'}
          </p>
        </div>
      </div>

      {actionError && (
        <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-center text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">
          {actionError}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nothing here yet — head to Canvas and {isManager ? 'extract some tasks' : 'post a check-in'}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} isManager={isManager} onPush={handlePush} />
          ))}
        </div>
      )}
    </div>
  );
}
