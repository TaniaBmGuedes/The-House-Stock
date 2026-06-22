import * as service from '../services/localService.js';
import { requireCasa, fail, methodNotAllowed } from '../lib/http.js';

async function list(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(200).json(await service.listLocals(casa));
  } catch (e) {
    fail(res, e);
  }
}

async function create(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(201).json(await service.createLocal(casa, req.body || {}));
  } catch (e) {
    fail(res, e);
  }
}

async function update(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(200).json(await service.updateLocal(casa, req.query.id, req.body || {}));
  } catch (e) {
    fail(res, e);
  }
}

async function remove(req, res) {
  try {
    const casa = requireCasa(req);
    res.status(200).json(await service.deleteLocal(casa, req.query.id));
  } catch (e) {
    fail(res, e);
  }
}

// /api/locals
export function collection(req, res) {
  if (req.method === 'GET') return list(req, res);
  if (req.method === 'POST') return create(req, res);
  return methodNotAllowed(req, res, ['GET', 'POST']);
}

// /api/locals/:id
export function resource(req, res) {
  if (req.method === 'PATCH') return update(req, res);
  if (req.method === 'DELETE') return remove(req, res);
  return methodNotAllowed(req, res, ['PATCH', 'DELETE']);
}
