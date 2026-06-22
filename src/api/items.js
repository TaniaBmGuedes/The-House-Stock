// Cliente HTTP da API de itens. Inclui o token de sessão (Authorization) e
// lança erro quando a resposta não é OK, para o React Query tratar os estados.
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

export const fetchItems = () => fetch('/api/items', { headers: headers(false) }).then(toJSON);

export const createItem = (payload) =>
  fetch('/api/items', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  }).then(toJSON);

export const updateItem = ({ id, data }) =>
  fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  }).then(toJSON);

export const deleteItem = (id) =>
  fetch(`/api/items/${id}`, { method: 'DELETE', headers: headers(false) }).then(toJSON);
