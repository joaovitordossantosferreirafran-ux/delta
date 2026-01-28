# 📦 GUIA DE MIGRAÇÃO E HOSTING

## 🎯 Objetivo

Preparar o projeto para ser migrado de `/workspaces/1` para um host profissional (Vercel, Railway, AWS, etc).

---

## 📊 Estrutura Otimizada para Migração

```
seu-repo-github/
├── .github/
│   └── workflows/
│       ├── test.yml              # Testes automáticos
│       ├── deploy.yml            # Deploy automático
│       └── lint.yml              # Linting
│
├── frontend/                      # Deploy em Vercel
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Deploy em Railway/Heroku
│   ├── src/
│   ├── prisma/
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── mobile/                        # Build com EAS
│   ├── screens/
│   ├── .env.example
│   ├── package.json
│   └── app.json
│
├── docker-compose.yml            # Local development
├── .gitignore
├── .env.example
└── README.md
```

---

## 🔑 1. Preparar o Repositório Git

### 1.1. Criar um novo repositório no GitHub

```bash
# No GitHub.com crie um novo repositório vazio
# Ex: seu-username/seu-nome-projeto

# No seu terminal:
cd /workspaces/1
git remote remove origin
git remote add origin https://github.com/seu-username/seu-nome-projeto.git
git branch -M main
git push -u origin main
```

### 1.2. Criar `.gitignore` na raiz

```
# Dependencies
node_modules/
*/node_modules/

# Environment
.env
.env.local
.env.*.local

# Build outputs
*/build/
*/dist/
*/.next/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Testing
coverage/
.nyc_output/

# Docker
.dockerignore
```

### 1.3. Criar `.env.example`

```bash
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/seu-db
JWT_SECRET=sua-chave-secreta-super-segura
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## 🌐 2. Opções de Hosting

### OPÇÃO 1: Stack Completo Integrado ⭐ RECOMENDADO

#### Railway.app (Melhor custo-benefício)

**Vantagens**:
- ✅ Frontend, backend, banco de dados TUDO em um lugar
- ✅ Muito fácil de usar
- ✅ Muito barato ($5-20/mês)
- ✅ Dashboard visual bonito
- ✅ Suporta Docker direto

**Como fazer**:

1. Cadastre em [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Clique em "New Project" → "GitHub Repo"
4. Selecione seu repositório
5. Railway detecta automaticamente os serviços

```bash
# Na raiz do projeto, crie railroad.json:
{
  "spec": [
    {
      "name": "backend",
      "root": "backend",
      "buildCommand": "npm install && npx prisma migrate deploy",
      "startCommand": "npm run start"
    },
    {
      "name": "frontend", 
      "root": "frontend",
      "buildCommand": "npm install && npm run build",
      "startCommand": "npm run preview"
    }
  ]
}
```

**Custo**: $5/mês backend + $0 frontend (Vercel)

---

### OPÇÃO 2: Separado por Serviço

#### Frontend em Vercel

**Vantagens**:
- ✅ Super rápido (CDN global)
- ✅ Grátis para projetos públicos
- ✅ Deploy automático via Git

**Como fazer**:

```bash
# 1. Vá para vercel.com e faça login com GitHub
# 2. Clique "Add New..." → "Project"
# 3. Importe seu repositório
# 4. Configure:
#    - Root Directory: ./frontend
#    - Build: npm run build
#    - Output: dist
# 5. Clique "Deploy"
```

**Custo**: Grátis (até 100K visitors/mês)

---

#### Backend em Railway OU Heroku OU DigitalOcean

##### Railway (Recomendado)

```bash
# 1. Vá para railway.app
# 2. "New Project" → "Deploy from GitHub"
# 3. Selecione o repositório
# 4. Clique na pasta "backend"
# 5. Configure variáveis de ambiente (.env)
# 6. Deploy automático!

# Variáveis necessárias:
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
STRIPE_KEY=xxx
STRIPE_SECRET=xxx
```

**Custo**: $5-10/mês

##### Heroku (Alternativa)

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create seu-app-name

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

**Custo**: $7/mês (mínimo)

---

#### Mobile em EAS Build (Expo)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build para Android
cd mobile
eas build --platform android

# 4. Build para iOS
eas build --platform ios

# 5. Build para ambos
eas build --platform all
```

**Custo**: Grátis (até 30 builds/mês)

---

### OPÇÃO 3: AWS (Se quiser mais controle)

```bash
# Frontend: AWS S3 + CloudFront
# Backend: AWS EC2 (t3.micro = $6/mês)
# Database: AWS RDS (db.t3.micro = $12/mês)
# Total: ~$18/mês

# Mas é mais complexo... Railway é mais fácil!
```

---

## 📋 Checklist de Migração

### Antes de Fazer Deploy

- [ ] Git configurado com repositório remoto
- [ ] `.env.example` criado (SEM senhas!)
- [ ] `.gitignore` configurado
- [ ] `docker-compose.yml` funcionando localmente
- [ ] `npm test` passando em todos os serviços
- [ ] URLs de API corrigidas (não hardcoded)
- [ ] Secrets (JWT_SECRET, Stripe keys) em variáveis de ambiente

### Deployment Checklist

- [ ] Frontend build sem erros: `cd frontend && npm run build`
- [ ] Backend testes passando: `cd backend && npm test`
- [ ] Database migrations atualizadas: `npx prisma migrate`
- [ ] Variáveis de ambiente configuradas no host
- [ ] CORS configurado corretamente
- [ ] HTTPS ativado
- [ ] Backups do banco configurados
- [ ] Monitoramento/logs ativados

---

## 🛠️ Setup Passo a Passo (Railway Recomendado)

### Step 1: Preparar GitHub

```bash
cd /workspaces/1

# Deletar arquivos desnecessários (já feito!)

# Commitar tudo
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Criar Conta Railway

1. Vá para [railway.app](https://railway.app)
2. Clique "Login with GitHub"
3. Autorize a integração
4. Clique "Start a New Project"

### Step 3: Conectar Repositório

1. Selecione "Deploy from GitHub repo"
2. Procure seu repositório "seu-username/seu-projeto"
3. Clique "Deploy"

### Step 4: Adicionar Serviços

#### 4.1 Frontend

```
New → GitHub Repo
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm run preview
Environment: NODE_ENV=production
```

#### 4.2 Backend

```
New → GitHub Repo
Root Directory: backend
Build Command: npm install && npx prisma migrate deploy
Start Command: npm run start
Environment Variables:
  - DATABASE_URL=postgresql://...
  - JWT_SECRET=sua-chave
  - STRIPE_KEY=pk_live_xxx
  - STRIPE_SECRET=sk_live_xxx
```

#### 4.3 Database

```
New → PostgreSQL
Railway cria automaticamente e fornece DATABASE_URL
```

### Step 5: Configurar Variáveis

No Railway, vá para cada serviço e adicione `.env`:

```
# Backend .env
RAILWAY_PRIVATE_DOMAIN_BACKEND=...
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=${{Postgres.QUERY_PASSWORD}}
```

### Step 6: Deploy

```
Clique "Deploy"
Railway faz tudo automaticamente!
```

### Step 7: Verificar

- [ ] Frontend online: https://seu-frontend.vercel.app
- [ ] Backend online: https://seu-backend.up.railway.app
- [ ] API respondendo: curl https://seu-backend.up.railway.app/api/health
- [ ] Database conectado: Verificar logs

---

## 🔐 Segredos (Secrets Management)

### NÃO FAÇA ISTO ❌
```javascript
// Errado!
const STRIPE_KEY = "pk_live_xxx123456";
const JWT_SECRET = "minha-chave-super-secreta";
```

### FAÇA ISTO ✅
```bash
# 1. Configure no Railway:
# Settings → Environment → Add Variable
STRIPE_KEY=pk_live_xxx123456
JWT_SECRET=minha-chave-super-secreta

# 2. Acesse via .env
# No código: process.env.STRIPE_KEY
# No frontend: import.meta.env.VITE_STRIPE_KEY
```

---

## 📈 Custo Mensal Estimado

| Serviço | Custo |
|---------|-------|
| **Frontend (Vercel)** | Grátis |
| **Backend (Railway)** | $5 |
| **Database (Railway)** | $10 |
| **Mobile Build (EAS)** | Grátis |
| **Domain (.com)** | $10 |
| **CDN (optional)** | $5-20 |
| **TOTAL** | ~$25-35/mês |

---

## 🚀 Deploy Automático com GitHub Actions

### Criar `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend
      
      - name: Deploy Frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token $VERCEL_TOKEN
```

---

## 🐛 Troubleshooting

### "Database connection refused"
```bash
# 1. Verifi que DATABASE_URL está configurado
# 2. Aguarde 30s para Railway criar o banco
# 3. Rode: npx prisma migrate deploy
```

### "CORS errors"
```javascript
// No backend server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### "Build fails"
```bash
# Vê os logs detalhados:
vercel logs --follow
# ou
railway logs --follow
```

---

## ✅ Verificação Final

```bash
# Localmente, simule o ambiente de produção
docker-compose up -d

# Teste
curl http://localhost:3000/api/health

# Após deploy em Railway
curl https://seu-backend.up.railway.app/api/health

# Deve retornar: {"status": "ok"}
```

---

## 📚 Próximas Etapas

1. **Escolha o host** (Railway recomendado)
2. **Configure GitHub** com repositório público
3. **Deploy** inicial
4. **Teste** todas as funcionalidades
5. **Configure SSL/TLS** (automático em Railway)
6. **Setup backups** do banco de dados
7. **Monitore** performance

---

## 🎓 Recursos Úteis

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Data**: 26 de Janeiro, 2026  
**Status**: Pronto para migração  
**Recomendação**: Use Railway para simplificar!
