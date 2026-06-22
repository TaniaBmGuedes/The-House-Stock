import { notifyExpiring } from '../services/notifyService.js';

// Endpoint chamado por um agendador externo (GitHub Actions). Protegido por um
// segredo: ?token=... ou cabeçalho Authorization: Bearer <token>.
export async function notify(req, res) {
  const secret = process.env.CRON_SECRET;
  const given =
    (req.query && req.query.token) ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!secret || given !== secret) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  try {
    const result = await notifyExpiring();
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao enviar avisos.' });
  }
}
