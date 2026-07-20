// pages/Product-Specific-Pages/flowboard/useFlowboardUser.js
// Shared by all three Flowboard routes (Canvas/Tasks/Activity). Fetches only
// the universal identity (`/api/mappuser/me`, the MappArks_User collection) —
// never StartupArk's product-specific routes/fields — and pairs it with
// Flowboard's own independent role choice (see flowboardStore.js).
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getFlowboardRole, setFlowboardRole as persistFlowboardRole } from './flowboardStore';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export function useFlowboardUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flowboardRole, setFlowboardRoleState] = useState('user');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios
      .get(`${baseUrl}/api/mappuser/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        setFlowboardRoleState(getFlowboardRole(res.data?._id));
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  function setFlowboardRole(role) {
    setFlowboardRoleState(role);
    persistFlowboardRole(user?._id, role);
  }

  return { user, flowboardRole, setFlowboardRole, loading };
}
