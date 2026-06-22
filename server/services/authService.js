import connectDB from '../lib/db.js';
import { ApiError } from '../lib/ApiError.js';
import { hashPassword, comparePassword, signToken } from '../lib/auth.js';
import * as repo from '../repositories/casaRepository.js';

function toResult(casa) {
  return { token: signToken(casa), casa: { id: String(casa._id), name: casa.name } };
}

export async function register({ name, password, email }) {
  await connectDB();
  if (!name || !name.trim() || !password) {
    throw new ApiError(400, 'Nome da Casa e palavra-passe são obrigatórios.');
  }
  if (!/^[A-Za-z0-9_]+$/.test(name.trim())) {
    throw new ApiError(
      400,
      'O Nome da Casa só pode ter letras, números e _ (sem espaços).'
    );
  }
  if (await repo.findByName(name.trim())) {
    throw new ApiError(409, 'Já existe uma Casa com esse nome.');
  }
  const casa = await repo.create({
    name: name.trim(),
    passwordHash: await hashPassword(password),
    emails: email && email.trim() ? [email.trim()] : [],
  });
  return toResult(casa);
}

export async function login({ name, password }) {
  await connectDB();
  if (!name || !password) {
    throw new ApiError(400, 'Nome da Casa e palavra-passe são obrigatórios.');
  }
  const casa = await repo.findByName(name.trim());
  if (!casa || !(await comparePassword(password, casa.passwordHash))) {
    throw new ApiError(401, 'Nome da Casa ou palavra-passe incorretos.');
  }
  return toResult(casa);
}
