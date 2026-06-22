// Token de sessão acessível de forma síncrona (o cliente HTTP lê daqui).
// Inicializado já no arranque a partir do localStorage, para que o primeiro
// pedido do React Query já leve o Authorization correto.
const CASAS_KEY = 'ths.casas';
const ACTIVE_KEY = 'ths.active';

function initialToken() {
  try {
    const casas = JSON.parse(localStorage.getItem(CASAS_KEY)) || [];
    const activeId = localStorage.getItem(ACTIVE_KEY);
    const active = casas.find((c) => c.id === activeId) || casas[0];
    return active?.token || null;
  } catch {
    return null;
  }
}

let token = initialToken();

export function setAuthToken(t) {
  token = t;
}

export function getAuthToken() {
  return token;
}

export const STORAGE_KEYS = { CASAS_KEY, ACTIVE_KEY };
