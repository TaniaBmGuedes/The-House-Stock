# 🏠 Casa Stock

Site simples e responsivo (telemóvel + PC) para gerir o material de casa —
**cozinha, casa de banho, despensa** — partilhado entre os dois. A lista é a
mesma para ambos porque os dados ficam guardados no MongoDB.

## Stack

- **Frontend:** Vite + React + Tailwind CSS (mobile-first, largura total)
- **Backend:** Serverless functions da Vercel (pasta `/api`)
- **Base de dados:** MongoDB Atlas via Mongoose
- **Deploy:** Vercel

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
encaminhados automaticamente para a API. Não é preciso a CLI da Vercel.

## 3. Deploy na Vercel

1. Põe o projeto no GitHub.
2. Em https://vercel.com → **New Project** → importa o repositório.
3. Em **Settings → Environment Variables**, adiciona:
   - `MONGODB_URI` = a tua connection string do Atlas
4. **Deploy**. Ficas com um link tipo `casa-stock.vercel.app` que abrem os dois
   no telemóvel. 💚

### Dica: adicionar ao ecrã inicial do telemóvel

No telemóvel, abre o link → menu do browser → **"Adicionar ao ecrã principal"**.
Fica com um ícone como se fosse uma app.
