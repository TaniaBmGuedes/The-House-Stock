import mongoose from 'mongoose';

// Cache da ligação entre invocações da serverless function. Sem isto, cada
// pedido abriria uma nova ligação e esgotaria o limite do MongoDB Atlas.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  // Lido aqui (e não no topo do módulo) para que funcione mesmo quando as
  // variáveis de ambiente são carregadas depois do import (servidor de dev).
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Falta a variável de ambiente MONGODB_URI.');
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Liberta a promessa rejeitada para que o próximo pedido volte a tentar
    // ligar (senão uma falha temporária da BD deixava o servidor preso a 500).
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
