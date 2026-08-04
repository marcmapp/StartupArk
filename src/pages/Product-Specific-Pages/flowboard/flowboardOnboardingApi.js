// pages/Product-Specific-Pages/flowboard/flowboardOnboardingApi.js
// Role selection + agreement for Flowboard — talks to the Node Server
// (flowboardRole lives on MappArks_User, mirrors StartupArk's role/agree
// pattern), NOT flowboard-service. See Backend/Server/mapp-portal/products/
// flowboard/routes/flowboard-role.cjs.
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function client() {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setFlowboardRole(role) {
  const { data } = await client().post('/flowboard/api/role', { role });
  return data;
}

export async function agreeFlowboardRole(displayName) {
  const { data } = await client().post('/flowboard/api/role/agree', { displayName });
  return data;
}
