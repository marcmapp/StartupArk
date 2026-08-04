// pages/Product-Specific-Pages/flowboard/useFlowboardUser.js
// Shared by every Flowboard route (Canvas/Tasks/Activity/Setup). Fetches the
// universal identity (`/api/mappuser/me`) and reads Flowboard's permanent,
// server-side role off it (flowboardRole + hasAgreedToFlowboardX — set once
// via the /flowboard/setup wizard, see flowboardOnboardingApi.js). Not yet
// onboarded -> redirected to /flowboard/setup; already onboarded and landing
// on /flowboard/setup -> redirected into the product. No in-app role switch.
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const SETUP_PATH = '/flowboard/setup';

function isAgreed(user) {
  if (!user?.flowboardRole) return false;
  return user.flowboardRole === 'manager'
    ? !!user.hasAgreedToFlowboardManager
    : !!user.hasAgreedToFlowboardContributor;
}

export function useFlowboardUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios
      .get(`${baseUrl}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const onboarded = isAgreed(res.data);
        const onSetupPage = location.pathname === SETUP_PATH;
        if (!onboarded && !onSetupPage) { navigate(SETUP_PATH); return; }
        if (onboarded && onSetupPage) { navigate('/flowboard'); return; }
        setUser(res.data);
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate, location.pathname]);

  return {
    user,
    flowboardRole: user?.flowboardRole ?? null,
    onboarded: isAgreed(user),
    loading,
  };
}
