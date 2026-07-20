// pages/Product-Specific-Pages/flowboard/FlowboardTasks.jsx
// Route: /flowboard/tasks — review/push generated tasks (Manager) or
// review/post drafted status updates (Contributor).
import { useEffect, useState } from 'react';
import Loader from '../../../components/Loader';
import { useFlowboardUser } from './useFlowboardUser';
import { getTickets, setTickets } from './flowboardStore';
import TicketCard from './components/TicketCard';
import RoleSwitcher from './components/RoleSwitcher';

export default function FlowboardTasks() {
  const { flowboardRole, setFlowboardRole, loading } = useFlowboardUser();
  const isManager = flowboardRole === 'admin';
  const [tickets, setLocalTickets] = useState([]);

  useEffect(() => {
    setLocalTickets(getTickets()[flowboardRole] ?? []);
  }, [flowboardRole]);

  function handlePush(id, editedText) {
    const next = tickets.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, pushed: true };
      if (isManager) updated.description = editedText;
      else updated.comment = editedText;
      return updated;
    });
    setLocalTickets(next);
    const allTickets = getTickets();
    setTickets({ ...allTickets, [flowboardRole]: next });
  }

  if (loading) return <Loader />;

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
        <RoleSwitcher flowboardRole={flowboardRole} onChange={setFlowboardRole} />
      </div>

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
