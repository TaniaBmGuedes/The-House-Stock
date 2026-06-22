// Helpers de data no formato dd/mm/yyyy.

export function maskDate(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

export function parseDMY(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '');
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

// Devolve estado de validade pronto a mostrar (label + cor de Chip do HeroUI).
export function expiryStatus(s, tr) {
  const d = parseDMY(s);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return { label: tr.expired, urgent: true, color: 'danger' };
  if (diff === 0) return { label: tr.expiresToday, urgent: true, color: 'danger' };
  if (diff <= 7) return { label: tr.expiresInDays(diff), urgent: true, color: 'warning' };
  return { label: tr.expiry(s), urgent: false, color: 'default' };
}
