import connectDB from '../lib/db.js';
import { ApiError } from '../lib/ApiError.js';
import * as repo from '../repositories/itemRepository.js';

const ALLOWED = [
  'name', 'category', 'location', 'quantity', 'unit', 'packSize', 'packUnit',
  'brand', 'price', 'expiryDate', 'note', 'barcode', 'image',
];

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}

export async function listItems(casa) {
  await connectDB();
  return repo.findByCasa(casa);
}

export async function createItem(casa, body) {
  await connectDB();
  if (!body.name || !body.name.trim()) {
    throw new ApiError(400, 'O nome é obrigatório.');
  }
  return repo.create({ casa, ...pick(body, ALLOWED) });
}

export async function updateItem(casa, id, body) {
  await connectDB();
  const data = pick(body, ALLOWED);
  if ('quantity' in data && data.quantity < 0) data.quantity = 0;
  const item = await repo.updateInCasa(id, casa, data);
  if (!item) throw new ApiError(404, 'Item não encontrado.');
  return item;
}

export async function deleteItem(casa, id) {
  await connectDB();
  const item = await repo.deleteInCasa(id, casa);
  if (!item) throw new ApiError(404, 'Item não encontrado.');
  return { ok: true };
}
