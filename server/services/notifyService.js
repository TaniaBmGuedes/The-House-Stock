import connectDB from '../lib/db.js';
import Item from '../models/Item.js';
import Casa from '../models/Casa.js';
import { sendMail } from '../lib/mailer.js';

const DEFAULT_WINDOW = 7; // dias

// Dias até expirar a partir de uma data dd/mm/yyyy (null se inválida).
function daysToExpiry(dmy) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy || '');
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function label(days) {
  if (days < 0) return 'expirado';
  if (days === 0) return 'expira hoje';
  if (days === 1) return 'expira amanhã';
  return `expira em ${days} dias`;
}

function buildEmail(casa, list) {
  const rows = list
    .map(
      (it) =>
        `<li style="margin:4px 0"><strong>${it.name}</strong> — ${label(
          it._days
        )} (${it.expiryDate})${it.quantity ? ` · ${it.quantity} ${it.unit || 'un'}` : ''}</li>`
    )
    .join('');
  return `
    <div style="font-family:system-ui,Arial,sans-serif;color:#1c1917">
      <h2 style="color:#0f766e">🏠 ${casa.name} — itens a expirar</h2>
      <p>Estes itens estão a chegar à validade:</p>
      <ul style="padding-left:18px">${rows}</ul>
      <p style="color:#78716c;font-size:13px">Enviado automaticamente pelo The House Stock.</p>
    </div>`;
}

// Procura itens a expirar dentro de `windowDays` dias (ainda não avisados),
// agrupa por Casa e envia email aos endereços dessa Casa. Marca como avisados.
export async function notifyExpiring(windowDays = DEFAULT_WINDOW) {
  await connectDB();
  const candidates = await Item.find({
    expiryNotified: { $ne: true },
    expiryDate: { $ne: '' },
  }).lean();

  const due = candidates
    .map((it) => ({ ...it, _days: daysToExpiry(it.expiryDate) }))
    .filter((it) => it._days !== null && it._days >= 0 && it._days <= windowDays);

  if (!due.length) return { casas: 0, emails: 0, items: 0 };

  // Agrupa por Casa.
  const byCasa = new Map();
  for (const it of due) {
    const k = String(it.casa);
    if (!byCasa.has(k)) byCasa.set(k, []);
    byCasa.get(k).push(it);
  }

  let casas = 0;
  let emails = 0;
  for (const [casaId, list] of byCasa) {
    const casa = await Casa.findById(casaId).lean();
    if (!casa || !casa.emails || casa.emails.length === 0) continue;
    await sendMail(casa.emails, `Itens a expirar — ${casa.name}`, buildEmail(casa, list));
    await Item.updateMany(
      { _id: { $in: list.map((i) => i._id) } },
      { expiryNotified: true }
    );
    casas += 1;
    emails += casa.emails.length;
  }

  return { casas, emails, items: due.length };
}
