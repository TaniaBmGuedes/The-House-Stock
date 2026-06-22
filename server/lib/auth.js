import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const secret = () => process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

export const hashPassword = (pw) => bcrypt.hash(pw, 10);
export const comparePassword = (pw, hash) => bcrypt.compare(pw, hash);

export const signToken = (casa) =>
  jwt.sign({ casaId: String(casa._id), name: casa.name }, secret(), {
    expiresIn: '180d',
  });

// Devolve o casaId a partir do header Authorization, ou null se inválido.
export function getCasaId(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) return null;
  try {
    return jwt.verify(match[1], secret()).casaId;
  } catch {
    return null;
  }
}
