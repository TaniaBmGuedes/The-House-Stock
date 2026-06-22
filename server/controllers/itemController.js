import * as service from '../services/itemService.js';
import { requireCasa, fail, methodNotAllowed } from '../lib/http.js';

async function list(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(200).json(await service.listItems(casa));
  } catch (e) {
    fail(res, e);
  }
}

async function create(req, res) {
  try {
    const casa = requireCasa(req);
    const item = await service.createItem(casa, req.body || {});
    res.status(201).json(item);
  } catch (e) {
    fail(res, e);
  }
}

async function update(req, res) {
  try {
    const casa = requireCasa(req);
    const item = await service.updateItem(casa, req.query.id, req.body || {});
    res.status(200).json(item);
  } catch (e) {
    fail(res, e);
  }
}

async function remove(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(200).json(await service.deleteItem(casa, req.query.id));
  } catch (e) {
    fail(res, e);
  }
}

// /api/items
export function collection(req, res) {
  if (req.method === 'GET') return list(req, res);
  if (req.method === 'POST') return create(req, res);
  return methodNotAllowed(req, res, ['GET', 'POST']);
}

// /api/items/:id
export function resource(req, res) {
  if (req.method === 'PATCH') return update(req, res);
  if (req.method === 'DELETE') return remove(req, res);
  return methodNotAllowed(req, res, ['PATCH', 'DELETE']);
}
