// components/ComingSoon.jsx
// Shown in place of a real product page when VITE_DEMO_MODE is off — lets prod
// ship the dock entry for a WIP product (e.g. Flowboard, DocArc) without exposing
// the half-built pages to real users. Toggle back on per-env via VITE_DEMO_MODE.
import { useNavigate } from "react-router-dom";

const ComingSoon = ({ productName, description, icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center py-16 px-4 min-h-[60vh]">
      <div className="glass-card w-full max-w-md p-10 flex flex-col items-center text-center gap-5">
        <div className="glass-inset w-20 h-20 rounded-full flex items-center justify-center">
          {Icon && <Icon className="w-9 h-9 text-zinc-500 dark:text-zinc-400" />}
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
          In Development
        </span>

        <div>
          <h1 className="text-xl">{productName}</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {description || `${productName} is being built right now. We'll let you know the moment it's ready.`}
          </p>
        </div>

        <button onClick={() => navigate("/dashboard")} className="btn-mono mt-1">
          Back to Hub
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
