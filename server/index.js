// Servidor de PRODUÇÃO: serve o site (build do Vite em /dist) E a API, no mesmo
// processo. Reutiliza exatamente os mesmos controllers do dev. Usado no deploy
// (ex.: Render). Localmente continua a usar-se `npm run dev`.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as itemController from './controllers/itemController.js';
import * as localController from './controllers/localController.js';
import * as authController from './controllers/authController.js';
import * as recognizeController from './controllers/recognizeController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');

const app = express();
// Limite maior porque as fotos chegam em base64.
app.use(express.json({ limit: '15mb' }));

// ---- API (mesmas rotas do servidor de dev) ----
app.all('/api/auth/register', (req, res) => authController.register(req, res));
app.all('/api/auth/login', (req, res) => authController.login(req, res));

app.all('/api/recognize', (req, res) => recognizeController.recognize(req, res));

app.all('/api/items', (req, res) => itemController.collection(req, res));
app.all('/api/items/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return itemController.resource(req, res);
});

app.all('/api/locals', (req, res) => localController.collection(req, res));
app.all('/api/locals/:id', (req, res) => {
  req.query = { ...req.query, id: req.params.id };
  return localController.resource(req, res);
});

// Qualquer /api desconhecido -> 404 JSON (não cai no fallback do site).
app.all('/api/*', (req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// ---- Frontend estático (build do Vite) ----
app.use(express.static(dist));
// SPA fallback: qualquer outra rota devolve o index.html.
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor (site + API) a correr na porta ${PORT}`);
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI não definida — define a variável de ambiente.');
  }
});
