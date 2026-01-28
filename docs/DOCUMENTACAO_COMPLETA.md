# 📚 DOCUMENTAÇÃO COMPLETA DO PROJETO

**Single Source of Truth** - Toda a documentação necessária em um único arquivo.

---

## 📖 ÍNDICE GERAL

1. [Visão Geral Rápida](#visão-geral-rápida)
2. [Como Começar](#como-começar)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Features Implementadas](#features-implementadas)
5. [Especificações Técnicas](#especificações-técnicas)
6. [APIs Backend](#apis-backend)
7. [Guia de Integração](#guia-de-integração)
8. [Deploy e Migração](#deploy-e-migração)
9. [Roadmap 2026](#roadmap-2026)
10. [Troubleshooting](#troubleshooting)
11. [Quick Reference](#quick-reference)

---

# 1️⃣ VISÃO GERAL RÁPIDA

## O Projeto

Plataforma completa de agendamento de limpeza conectando clientes com faxineiras profissionais.

**Status**: Production-ready (Frontend) | Development (Backend) | Foundation (Mobile)

## O Que Temos

### ✅ Frontend (React + Vite)
- 100% funcional
- Autenticação, Dashboard, Busca, Agendamento, Pagamento
- **NOVO**: Referral System, Chat, Booking History

### ✅ Backend (Node.js + Express)
- Base implementada
- Autenticação JWT, APIs REST, PostgreSQL
- ⏳ APIs a implementar: Referral, Chat WebSocket, History

### ✅ Mobile (React Native + Expo)
- Foundation pronta
- Navigation, Dashboard
- ⏳ 11 telas + integração com API

## Tecnologias

| Camada | Stack |
|--------|-------|
| Frontend | React 18, Vite, Tailwind, React Router, Zustand |
| Backend | Node.js, Express, Prisma, PostgreSQL |
| Mobile | React Native, Expo, React Navigation |
| Real-time | Socket.io, WebSocket |
| Pagamento | Stripe API |
| DevOps | Docker, Railway, Vercel |

---

# 2️⃣ COMO COMEÇAR

## 5 Minutos de Setup

### Opção 1: Docker (Recomendado)

```bash
# 1. Clone
git clone https://github.com/seu-username/seu-projeto.git
cd seu-projeto

# 2. Configure
cp backend/.env.example .env

# 3. Inicie
docker-compose up -d

# 4. Acesse
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Banco: localhost:5432
```

### Opção 2: Desenvolvimento Local

```bash
# Terminal 1 - Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Mobile (opcional)
cd mobile
npm install
npm start
```

## Credenciais de Teste

```
Email: teste@example.com
Senha: Teste123!

Ou crie uma nova conta via /register
```

---

# 3️⃣ ESTRUTURA DO PROJETO

```
/workspaces/1/
│
├── 📖 DOCUMENTAÇÃO (Raiz)
│   ├── START_HERE.md                    ← Comece aqui!
│   ├── README.md                        ← Visão geral
│   ├── DOCUMENTACAO_COMPLETA.md         ← Este arquivo
│   └── docker-compose.yml               ← Deploy local
│
├── 🎨 FRONTEND (React + Vite)
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── ReferralSystem.jsx   ✨ Sistema de referral
│       │   │   ├── ChatWindow.jsx       ✨ Chat em tempo real
│       │   │   ├── BookingHistory.jsx   ✨ Histórico de agendamentos
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Cleaners.jsx
│       │   │   ├── Booking.jsx
│       │   │   ├── Payment.jsx
│       │   │   └── ... (outros)
│       │   ├── components/              ← Componentes reutilizáveis
│       │   ├── services/                ← API calls (Axios)
│       │   └── stores/                  ← Zustand state management
│       ├── package.json
│       └── vite.config.js
│
├── 🔌 BACKEND (Node.js + Express)
│   └── backend/
│       ├── src/
│       │   ├── server.js                ← Entry point
│       │   ├── routes/
│       │   │   ├── auth.js
│       │   │   ├── bookings.js
│       │   │   ├── payments.js
│       │   │   ├── referrals.js        ⏳ A implementar
│       │   │   ├── messages.js         ⏳ A implementar
│       │   │   └── ... (outros)
│       │   ├── controllers/             ← Lógica de negócio
│       │   ├── services/                ← Integrações externas
│       │   └── middleware/              ← Auth, validação
│       ├── prisma/
│       │   └── schema.prisma            ← Database models
│       ├── package.json
│       └── .env.example
│
├── 📱 MOBILE (React Native + Expo)
│   └── mobile/
│       ├── screens/
│       │   ├── DashboardScreen.js       ✨ Home screen
│       │   ├── LoginScreen.js
│       │   ├── CleanersListScreen.js
│       │   └── ... (11 telas mais)
│       ├── Navigation.js                ← Estrutura de rotas
│       ├── App.tsx                      ← Entry point
│       ├── package.json
│       └── app.json                     ← Config Expo
│
└── 📁 DOCS/
    ├── backend-integration.md           ← Como implementar APIs
    ├── deployment-guide.md              ← Deploy passo a passo
    ├── roadmap.md                       ← Plano 2026
    ├── payment-system.md                ← Lógica de pagamentos
    └── reference.md                     ← Cheat sheet
```

---

# 4️⃣ FEATURES IMPLEMENTADAS

## ✅ Melhorias 1-8 (Completadas)

| # | Feature | Status |
|---|---------|--------|
| 1 | Autenticação JWT | ✅ |
| 2 | Pagamentos (Stripe/MercadoPago) | ✅ |
| 3 | Email (SendGrid) | ✅ |
| 4 | WhatsApp (Twilio) | ✅ |
| 5 | Upload de Fotos (AWS S3) | ✅ |
| 6 | Google Maps | ✅ |
| 7 | Notificações Push (Firebase) | ✅ |
| 8 | Sistema de Avaliações | ✅ |

## ✨ Melhorias 9-12 (Esta Sessão)

### 9️⃣ Sistema de Referral
- Código unique por usuário
- Compartilhar via WhatsApp, Facebook, Twitter
- Ganhar R$ 50 por indicação
- Histórico de referrals
- **Status**: Frontend ✅, Backend ⏳

### 🔟 Chat em Tempo Real
- Conversa 1-1 entre usuários
- Histórico persistente
- Typing indicators
- Online status
- **Status**: Frontend ✅, Backend ⏳

### 1️⃣1️⃣ Histórico de Agendamentos
- Listar com filtros
- Exportar CSV
- Estatísticas
- **Status**: Frontend ✅, Backend ⏳

### 1️⃣2️⃣ React Native Mobile
- Navegação com abas
- Dashboard responsivo
- Chat mobile
- Perfil usuário
- **Status**: Foundation ✅, Telas ⏳

---

# 5️⃣ ESPECIFICAÇÕES TÉCNICAS

## Database Schema (Prisma)

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String
  phone           String?
  avatar          String?
  role            String    @default("client") // client|cleaner|admin
  isVerified      Boolean   @default(false)
  
  // Referral
  referralCode    String    @unique
  referralBalance Decimal   @default(0)
  referralsGiven  Referral[] @relation("ReferrerUser")
  referralsReceived Referral[] @relation("ReferredUser")
  
  // Conversas
  conversations1  Conversation[] @relation("ConversationUser1")
  conversations2  Conversation[] @relation("ConversationUser2")
  messagesSent    Message[]      @relation("MessageSender")
  
  // Agendamentos
  bookingsAsClient Booking[] @relation("ClientBooking")
  bookingsAsClean Booking[]  @relation("CleanerBooking")
  
  // Avaliações
  reviewsAsClient Review[]   @relation("ClientReview")
  reviewsAsClean  Review[]   @relation("CleanerReview")
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

model Booking {
  id              String    @id @default(cuid())
  client          User      @relation("ClientBooking", fields: [clientId], references: [id])
  clientId        String
  cleaner         User      @relation("CleanerBooking", fields: [cleanerId], references: [id])
  cleanerId       String
  
  address         String
  date            DateTime
  duration        Int       // em minutos
  type            String    // "normal" | "profunda" | "express"
  price           Decimal
  status          String    @default("pending")
  
  scheduledAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  
  review          Review?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Referral {
  id              String    @id @default(cuid())
  referrer        User      @relation("ReferrerUser", fields: [referrerId], references: [id])
  referrerId      String
  referred        User      @relation("ReferredUser", fields: [referredId], references: [id])
  referredId      String
  
  amount          Decimal   @default(50.00)
  status          String    @default("pending")
  completedAt     DateTime?
  withdrawnAt     DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Conversation {
  id              String    @id @default(cuid())
  user1           User      @relation("ConversationUser1", fields: [user1Id], references: [id])
  user1Id         String
  user2           User      @relation("ConversationUser2", fields: [user2Id], references: [id])
  user2Id         String
  
  messages        Message[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([user1Id, user2Id])
}

model Message {
  id              String       @id @default(cuid())
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId  String
  sender          User         @relation("MessageSender", fields: [senderId], references: [id])
  senderId        String
  
  content         String
  imageUrl        String?
  isRead          Boolean      @default(false)
  readAt          DateTime?
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model Review {
  id              String    @id @default(cuid())
  booking         Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  bookingId       String    @unique
  
  clientReview    User      @relation("ClientReview", fields: [clientId], references: [id])
  clientId        String
  cleanerReview   User      @relation("CleanerReview", fields: [cleanerId], references: [id])
  cleanerId       String
  
  rating          Int       // 1-5
  comment         String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Variáveis de Ambiente

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cleaning-db

# Auth
JWT_SECRET=sua-chave-secreta-super-segura-min-32-chars

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# SendGrid
SENDGRID_API_KEY=xxx
SENDGRID_FROM_EMAIL=noreply@limpeza.com

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=+55xxxx

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Firebase
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx

# NodeEnv
NODE_ENV=development
PORT=3000
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

# 6️⃣ APIS BACKEND

## Autenticação

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
```

## Usuários

```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
PUT    /api/users/:id/avatar
GET    /api/users/search?q=termo
```

## Agendamentos

```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id
GET    /api/bookings/history?status=completed&days=30
GET    /api/bookings/export/csv
GET    /api/bookings/stats
```

## Pagamentos

```
POST   /api/payments/intent
POST   /api/payments/confirm
GET    /api/payments/history
GET    /api/payments/:id
POST   /api/payments/refund/:id
```

## Referral (A Implementar)

```
GET    /api/referral/me
GET    /api/referral/stats
GET    /api/referral/history
POST   /api/referral/validate/:code
POST   /api/referral/complete
POST   /api/referral/withdraw
```

## Chat (A Implementar)

```
GET    /api/conversations
GET    /api/conversations/:id/messages
POST   /api/messages
PUT    /api/messages/:id
DELETE /api/messages/:id
GET    /api/conversations/:id/unread_count
WS     /socket.io (WebSocket)
```

## Avaliações

```
POST   /api/reviews
GET    /api/reviews/:userId
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

---

# 7️⃣ GUIA DE INTEGRAÇÃO

## Como Implementar Referral API

### 1. Atualizar Schema Prisma

Já está no schema acima (modelo `Referral`).

### 2. Criar Migration

```bash
cd backend
npx prisma migrate dev --name add_referral_system
```

### 3. Implementar Controller

```javascript
// backend/src/controllers/referralController.js

export const getMyReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, referralBalance: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await prisma.referral.groupBy({
      by: ['status'],
      where: { referrerId: userId },
      _count: true,
      _sum: { amount: true }
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { newUserId } = req.body;
    
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code }
    });
    
    if (!referrer) {
      return res.status(400).json({ error: 'Código inválido' });
    }
    
    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUserId,
        status: 'pending'
      }
    });
    
    res.json({ referralId: referral.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeReferral = async (req, res) => {
  try {
    const { bookingId, cleanerId } = req.body;
    
    const referral = await prisma.referral.findFirst({
      where: {
        referredId: cleanerId,
        status: 'pending'
      }
    });
    
    if (!referral) return res.json({ success: false });
    
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'earned',
        completedAt: new Date()
      }
    });
    
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        referralBalance: { increment: 50 }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 4. Criar Rotas

```javascript
// backend/src/routes/referrals.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as referralController from '../controllers/referralController.js';

const router = express.Router();

router.get('/me', authMiddleware, referralController.getMyReferralCode);
router.get('/stats', authMiddleware, referralController.getReferralStats);
router.get('/history', authMiddleware, referralController.getReferralHistory);
router.post('/validate/:code', referralController.validateReferralCode);
router.post('/complete', referralController.completeReferral);

export default router;
```

### 5. Registrar no Server

```javascript
// backend/src/server.js
import referralsRouter from './routes/referrals.js';
app.use('/api/referral', referralsRouter);
```

## Como Implementar Chat + WebSocket

### 1. Instalar Socket.io

```bash
npm install socket.io
```

### 2. Configurar WebSocket

```javascript
// backend/src/websocket.js
import { Server } from 'socket.io';

export const setupWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });
  
  io.on('connection', (socket) => {
    socket.on('send_message', async (data) => {
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content
        }
      });
      io.to(data.conversationId).emit('new_message', message);
    });
    
    socket.on('typing', (data) => {
      io.to(data.conversationId).emit('user_typing', { userId: data.userId });
    });
  });
  
  return io;
};
```

---

# 8️⃣ DEPLOY E MIGRAÇÃO

## Opção 1: Railway (Recomendado)

Railway é a opção mais fácil para deploy full-stack.

### Setup Rápido (30 minutos)

1. Crie conta em [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Clique "New Project" → "GitHub Repo"
4. Selecione seu repositório
5. Railway detecta automaticamente:
   - Frontend (detecta Node.js + package.json)
   - Backend (detecta Express)
   - Database (oferece PostgreSQL)

### Custos

- Frontend: Grátis (até 100GB/mês)
- Backend: $5/mês (ou mais conforme uso)
- Database: $10/mês (DB compartilhado) ou $20+
- **Total**: ~$15-25/mês

## Opção 2: Frontend em Vercel + Backend em Railway

### Frontend (Vercel)

```bash
# 1. Vá para vercel.com
# 2. Conecte GitHub
# 3. Selecione repositório
# 4. Deploy automático!
# 5. Atribuir domínio personalizado
```

**Custos**: Grátis (até 100 deploys/dia)

### Backend (Railway)

Mesmo setup acima.

**Custos**: $5-10/mês

## Opção 3: AWS/DigitalOcean (Mais controle)

Mais complexo, mas oferece mais controle.

```bash
# AWS EC2 (t3.micro)
# Backend + Database: ~$15-20/mês

# DigitalOcean App Platform
# Full-stack: ~$15/mês
```

## Passos para Deploy

### 1. Preparar GitHub

```bash
cd /workspaces/1

# Criar repositório
git remote remove origin
git remote add origin https://github.com/seu-username/seu-projeto.git

# Push inicial
git branch -M main
git push -u origin main
```

### 2. Variáveis de Ambiente

Configure no host (Railway, Vercel, etc):
- DATABASE_URL
- JWT_SECRET
- STRIPE_KEY
- TWILIO_TOKEN
- etc...

### 3. Database Migration

```bash
# Railway executa automaticamente
# Ou manual:
npx prisma migrate deploy
```

### 4. Deploy

```bash
# Railway: Automático ao push
# Vercel: Automático ao push
# AWS: Via CLI ou console
```

---

# 9️⃣ ROADMAP 2026

## Q1 (Jan-Mar)

- ✅ Frontend 100% (completo)
- ⏳ Backend APIs (Referral, Chat, History)
- ⏳ Mobile 11 telas
- 🎯 Deploy beta em staging

## Q2 (Abr-Jun)

- 🎯 Deploy produção
- 🎯 Testes com 100+ usuários
- 🎯 Performance optimization
- 🎯 Analytics integrado

## Q3 (Jul-Set)

- 🎯 Marketing e aquisição
- 🎯 Referral campaign
- 🎯 Mobile PlayStore/AppStore
- 🎯 500+ usuários ativos

## Q4 (Out-Dez)

- 🎯 Novas features (agendamentos recorrentes, etc)
- 🎯 Expansão para outras cidades
- 🎯 1000+ usuários
- 🎯 Monetização completa

---

# 🔟 TROUBLESHOOTING

## "Connection refused" (Backend)

```bash
# Verifique se backend está rodando
ps aux | grep node

# Ou reinicie Docker
docker-compose restart backend

# Verificar porta 3000
lsof -i :3000
```

## "Database migration failed"

```bash
# Reset database
npx prisma migrate reset
npx prisma db push

# Ou recriar
docker-compose down -v
docker-compose up
```

## "CORS error"

```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## "Frontend bundle too large"

```bash
cd frontend
npm run build
npm run preview

# Análise
npm install --save-dev rollup-plugin-visualizer
```

## "WebSocket connection failed"

Verifique:
1. Backend rodando: `http://localhost:3000`
2. Socket.io port aberto
3. CORS configurado em websocket.js
4. Firewall não bloqueando

---

# 1️⃣1️⃣ QUICK REFERENCE

## Comandos Principais

```bash
# Docker
docker-compose up -d        # Iniciar
docker-compose down         # Parar
docker-compose logs -f      # Ver logs

# Frontend
cd frontend && npm run dev  # Dev server
cd frontend && npm run build # Build production

# Backend
cd backend && npm run dev   # Dev server
npx prisma studio          # Admin DB visual

# Mobile
cd mobile && npm start      # Expo local
eas build --platform ios    # Build iOS
eas build --platform android # Build Android

# Git
git add .
git commit -m "mensagem"
git push origin main
```

## Portas

| Serviço | Porta |
|---------|-------|
| Frontend | 5173 |
| Backend | 3000 |
| Database | 5432 |
| Socket.io | 3000 |
| Expo (mobile) | 19000 |

## Estrutura de Pastas

```
├── frontend/           React app
├── backend/            Express server
├── mobile/             React Native
├── docs/               Documentação
└── docker-compose.yml  Orquestração
```

## Deploy URLs (Exemplo Railway)

```
Frontend:  https://seu-app.vercel.app
Backend:   https://seu-app.up.railway.app
Database:  seu-app-db.railway.internal
```

---

## 📞 PRECISA DE AJUDA?

1. Leia este arquivo completamente
2. Verifique `/docs/` para detalhes específicos
3. Consulte [GitHub Issues](https://github.com/seu-username/seu-projeto/issues)
4. Stack Overflow para problemas gerais

---

**Última atualização**: 26 de Janeiro, 2026  
**Status**: Production-ready ✅  
**Versão**: 1.0 Release Candidate
