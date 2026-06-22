import { getCasaId } from './auth.js';
import { ApiError } from './ApiError.js';

// Extrai a Casa autenticada ou lança 401.
export function requireCasa(req) {
  const casa = getCasaId(req);
  if (!casa) throw new ApiError(401, 'Sessão inválida.');
  return casa;
}

// Traduz um erro para resposta JSON (ApiError -> status próprio; resto -> 500).
export function fail(res, err) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Erro no servidor.' });
}

// Responde 405 com o cabeçalho Allow.
export function methodNotAllowed(req, res, allowed) {
  res.setHeader('Allow', allowed);
  return res.status(405).json({ error: `Método ${req.method} não permitido.` });
}
