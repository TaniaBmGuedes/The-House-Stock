import { getAuthToken } from '../lib/authToken';

export async function recognizePhoto({ image, mediaType }) {
  const token = getAuthToken();
  const res = await fetch('/api/recognize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ image, mediaType }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro');
  return data;
}
