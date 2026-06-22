// Servidor de API só para desenvolvimento local.
// Em produção são usadas as serverless functions da pasta /api; ambas chamam
// EXATAMENTE os mesmos controllers, por isso não há lógica duplicada.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import * as itemController from './controllers/itemController.js';
import * as authController from './controllers/authController.js';
import * as recognizeController from './controllers/recognizeController.js';

const app = express();
// Limite maior porque as fotos chegam em base64.
app.use(express.json({ limit: '15mb' }));

// Auth
app.all('/api/auth/register', (req, res) => authController.register(req, res));
app.all('/api/auth/login', (req, res) => authController.login(req, res));

// Reconhecimento por foto
app.all('/api/recognize', (req, res) => recognizeController.recognize(req, res));

// Itens
app.all('/api/items', (req, res) => itemController.collection(req, res));
app.all('/api/items/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return itemController.resource(req, res);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API de desenvolvimento em http://localhost:${PORT}`);
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI não definida — cria o ficheiro .env.local (ver README).');
  }
});
