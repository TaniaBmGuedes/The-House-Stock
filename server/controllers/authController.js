import * as service from '../services/authService.js';
import { fail, methodNotAllowed } from '../lib/http.js';

export function register(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);
  return service
    .register(req.body || {})
    .then((result) => res.status(201).json(result))
    .catch((e) => fail(res, e));
}

export function login(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(req, res, ['POST']);
  return service
    .login(req.body || {})
    .then((result) => res.status(200).json(result))
    .catch((e) => fail(res, e));
}
