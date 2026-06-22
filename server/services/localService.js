import connectDB from '../lib/db.js';
import { ApiError } from '../lib/ApiError.js';
import * as repo from '../repositories/localRepository.js';

const ALLOWED = ['name', 'capacity', 'cols', 'rows', 'photo'];

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

export async function listLocals(casa) {
  await connectDB();
  return repo.findByCasa(casa);
}

export async function createLocal(casa, body) {
  await connectDB();
  if (!body.name || !body.name.trim()) {
    throw new ApiError(400, 'O nome do local é obrigatório.');
  }
  return repo.create({ casa, ...pick(body, ALLOWED) });
}

export async function updateLocal(casa, id, body) {
  await connectDB();
  const local = await repo.updateInCasa(id, casa, pick(body, ALLOWED));
  if (!local) throw new ApiError(404, 'Local não encontrado.');
  return local;
}

export async function deleteLocal(casa, id) {
  await connectDB();
  const local = await repo.deleteInCasa(id, casa);
  if (!local) throw new ApiError(404, 'Local não encontrado.');
  return { ok: true };
}
