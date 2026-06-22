# 🏠 Casa Stock

Site simples e responsivo (telemóvel + PC) para gerir o material de casa —
**cozinha, casa de banho, despensa** — partilhado entre os dois. A lista é a
mesma para ambos porque os dados ficam guardados no MongoDB.

## Stack

- **Frontend:** Vite + React + Tailwind CSS (mobile-first, largura total)
- **Backend:** Servidor Express (`server/index.js`) com controllers partilhados (pasta `/api` para serverless, se preferires)
- **Base de dados:** MongoDB Atlas via Mongoose
- **Deploy:** Render (servidor único: site + API)

## Funcionalidades

- Adicionar / apagar itens
- Categorias: Cozinha, Casa de banho, Despensa, Outros
- Botões +/- para a quantidade (atualização instantânea)
- Aviso de **"a acabar"** quando a quantidade chega ao limite definido
- Pesquisa e filtro por categoria
- Lista partilhada e sincronizada entre os dois telemóveis

---

## 1. Criar a base de dados (MongoDB Atlas — grátis)

1. Cria conta em https://www.mongodb.com/atlas e cria um cluster **gratuito (M0)**.
2. Em **Database Access**, cria um utilizador com password.
3. Em **Network Access**, adiciona `0.0.0.0/0` (permite acesso da Vercel).
4. Em **Database → Connect → Drivers**, copia a *connection string*
   (algo como `mongodb+srv://user:<password>@cluster...`).

## 2. Correr localmente

```bash
npm install

# cria o .env.local com a tua connection string
cp .env.example .env.local
# edita .env.local e mete o teu MONGODB_URI
```

Depois é só:

```bash
npm run dev
```

Isto arranca **ao mesmo tempo** o frontend (Vite, http://localhost:5173) e um
servidor de API local (http://localhost:3001) que reutiliza os mesmos handlers
da pasta `/api`. Abre http://localhost:5173 — os pedidos `/api/...` são
encaminhados automaticamente para a API.

## 3. Deploy (Render)

A app corre como **um único servidor Express** (`server/index.js`) que serve o
site (build do Vite) **e** a API no mesmo processo.

1. **Base de dados:** cria um cluster grátis no [MongoDB Atlas](https://www.mongodb.com/atlas).
   Em **Network Access** adiciona `0.0.0.0/0` e copia a *connection string*.
2. No [Render](https://render.com) → **New → Blueprint** → liga o repositório do
   GitHub. O Render lê o `render.yaml` automaticamente.
3. Em **Environment**, preenche as variáveis:
   - `MONGODB_URI` — a connection string do Atlas
   - `JWT_SECRET` — uma string longa e aleatória
   - `ANTHROPIC_API_KEY` — chave da Anthropic (reconhecimento por foto)
4. **Deploy**. Cada `git push` para o `main` volta a fazer deploy sozinho.

> Testar o build de produção localmente: `npm run build && npm start`
> (abre http://localhost:3001).
