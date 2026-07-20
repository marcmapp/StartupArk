// pages/Product-Specific-Pages/flowboard/components/RoleSwitcher.jsx
// Flowboard-local Manager/Contributor toggle. Deliberately not derived from
// StartupArk's startuparkRole — see useFlowboardUser.js for why — so this is
// the only place that role gets set, per account, until a real backend field
// exists for it.
export default function RoleSwitcher({ flowboardRole, onChange }) {
  return (
    <div className="inline-flex items-center p-1 rounded-full border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.05]">
      {[
        { id: 'admin', label: 'Manager' },
        { id: 'user', label: 'Contributor' },
      ].map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
            flowboardRole === opt.id
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
