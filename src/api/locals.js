// Cliente HTTP dos Locais de arrumação. Mesmo padrão do api/items.
import { getAuthToken } from '../lib/authToken';

function headers(withJSON = true) {
  const h = {};
  if (withJSON) h['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function toJSON(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro');
  return data;
}

export const fetchLocals = () => fetch('/api/locals', { headers: headers(false) }).then(toJSON);

export const createLocal = (payload) =>
  fetch('/api/locals', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  }).then(toJSON);

export const updateLocal = ({ id, data }) =>
  fetch(`/api/locals/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  }).then(toJSON);

export const deleteLocal = (id) =>
  fetch(`/api/locals/${id}`, { method: 'DELETE', headers: headers(false) }).then(toJSON);
