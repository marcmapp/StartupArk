import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../../components/Loader';
import FormComponent from '../startupark-setup/FormComponent';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Generic edit-profile page for user / student StartupArk roles.
// (Startups have their own richer editor at /startupark/startup-edit-profile.)
export default function EditProfile() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios.get(`${baseUrl}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const rr = r.data?.startuparkRole;
        if (rr === 'startup') { navigate('/startupark/startup-edit-profile'); return; }
        if (!rr) { navigate('/startupark'); return; }
        setRole(rr);
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const dashRoute = role === 'student' ? '/startupark/student-dashboard' : '/startupark/user-dashboard';

  const handleSaved = () => {
    setSaved(true);
    setTimeout(() => navigate(dashRoute), 1200);
  };

  if (loading || !role) return <Loader />;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(dashRoute)} className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition mb-3">
            ← Back to dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">My Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Keep your StartupArk profile up to date.</p>
        </div>

        {saved && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2">
            ✓ Profile updated successfully. Taking you back…
          </div>
        )}

        <div className="glass-card shadow-xl p-6 sm:p-8">
          <FormComponent role={role} editMode onSubmit={handleSaved} onCancel={() => navigate(dashRoute)} />
        </div>
      </div>
    </div>
  );
}
