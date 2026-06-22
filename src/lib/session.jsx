import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAuthToken, STORAGE_KEYS } from './authToken';

const { CASAS_KEY, ACTIVE_KEY } = STORAGE_KEYS;

function loadCasas() {
  try {
    return JSON.parse(localStorage.getItem(CASAS_KEY)) || [];
  } catch {
    return [];
  }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [casas, setCasas] = useState(loadCasas);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY) || null);

  const active = casas.find((c) => c.id === activeId) || casas[0] || null;

  useEffect(() => {
    setAuthToken(active?.token || null);
  }, [active]);

  useEffect(() => {
    localStorage.setItem(CASAS_KEY, JSON.stringify(casas));
  }, [casas]);

  useEffect(() => {
    if (active) localStorage.setItem(ACTIVE_KEY, active.id);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [active]);

  // casa = { id, name, token }
  const addCasa = useCallback((casa) => {
    setCasas((prev) => [...prev.filter((c) => c.id !== casa.id), casa]);
    setActiveId(casa.id);
  }, []);

  const switchCasa = useCallback((id) => setActiveId(id), []);

  const logout = useCallback((id) => {
    setCasas((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setActiveId((cur) => (cur === id ? next[0]?.id || null : cur));
      return next;
    });
  }, []);

  return (
    <SessionContext.Provider
      value={{ casas, active, activeId: active?.id || null, addCasa, switchCasa, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
