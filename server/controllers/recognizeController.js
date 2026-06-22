import * as service from '../services/recognizeService.js';
import { requireCasa, fail, methodNotAllowed } from '../lib/http.js';

export function recognize(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);
  try {
    requireCasa(req); // só Casas autenticadas podem usar o reconhecimento
  } catch (e) {
    return fail(res, e);
  }
  return service
    .recognizeProduct(req.body || {})
    .then((data) => res.status(200).json(data))
    .catch((e) => fail(res, e));
}
