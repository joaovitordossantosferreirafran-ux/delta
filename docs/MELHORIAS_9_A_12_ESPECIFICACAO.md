# 🚀 MELHORIAS 9-12: Especificação e Planejamento

## 📋 Visão Geral

Este documento define as 4 melhorias propostas para a próxima fase do CleanApp. Cada uma foi desenhada para melhorar a experiência do usuário, aumentar retenção e monetização.

---

## 🎯 MELHORIA #9: Sistema de Avaliações e Reviews

### Objetivo
Criar um sistema robusto de avaliações 5-estrelas com comentários, permitindo que clientes avaliem limpadores e vice-versa.

### Features Principais

#### 9.1 Página de Reviews do Limpador
```
- Mostrar todas as avaliações recebidas
- Filtrar por: todas, 5⭐, 4⭐, 3⭐, 2⭐, 1⭐
- Buscar por cliente nome
- Gráfico de distribuição de notas
- Média móvel (últimas 30 dias)
```

#### 9.2 Página de Reviews do Cliente
```
- Histórico de limpadores avaliados
- Poder editar avaliação até 7 dias após
- Denunciar reviews abusivas
- Filtro por período
```

#### 9.3 Modal de Avaliação
```
- Rating visual (click nas estrelas)
- Campo de comentário (max 500 chars)
- Aspectos avaliar: qualidade, pontualidade, respeito
- Opção de recomendação (sim/não)
- Submit com validações
```

#### 9.4 Moderação Admin
```
- Dashboard para revisar reviews flagadas
- Opção aprovar/rejeitar
- Analytics: média de ratings por limpador
- Trending positive/negative reviews
```

### Componentes a Criar
- `ReviewsList.jsx` - Listagem de avaliações com filtros
- `ReviewModal.jsx` - Modal para dar/editar avaliação
- `ReviewsStats.jsx` - Gráficos e estatísticas
- `AdminReviewModeration.jsx` - Painel admin

### API Endpoints Necessários
```
POST   /api/reviews                 # Criar/Atualizar avaliação
GET    /api/reviews/cleaner/:id    # Buscar avaliações de limpador
GET    /api/reviews/stats/:id      # Stats de avaliações
PUT    /api/reviews/:id            # Editar review
DELETE /api/reviews/:id            # Deletar review (owner/admin)
GET    /api/admin/reviews/flagged  # Reviews flagadas
POST   /api/reviews/:id/flag       # Flagar como abusiva
```

### Banco de Dados
```prisma
model Review {
  id          String   @id @default(cuid())
  rating      Int      @db.Int // 1-5
  comment     String?
  cleanerId   String
  clientId    String
  bookingId   String   @unique
  
  quality     Int?     // 1-5
  punctuality Int?     // 1-5
  respect     Int?     // 1-5
  recommend   Boolean  @default(false)
  
  flagged     Boolean  @default(false)
  flagReason  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  cleaner     Cleaner  @relation("ReviewsReceived", fields: [cleanerId], references: [id])
  client      User     @relation("ReviewsGiven", fields: [clientId], references: [id])
  booking     Booking  @relation(fields: [bookingId], references: [id])
}
```

### Status de Implementação
- [ ] Database schema
- [ ] API endpoints (8)
- [ ] Frontend components (4)
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Documentação

---

## 🎯 MELHORIA #10: Gamificação e Achievements

### Objetivo
Aumentar engagement com sistema de badges, leaderboards e desafios semanais.

### Features Principais

#### 10.1 Sistema de Badges/Achievements
```
Badges automáticos:
- 🌟 "Iniciante" - Completar 1º agendamento
- ⚡ "Superfast" - Completar 10 agendamentos
- 👑 "Top Cleaner" - Top 10% por 30 dias
- 💎 "Perfectionist" - 50 avaliações 5⭐
- 🔥 "On Fire" - 10 avaliações 5⭐ consecutivas
- 🤝 "Team Player" - 100 agendamentos
- 🎯 "Reliable" - 95%+ taxa conclusão
- 🌍 "Explorer" - Trabalhar em 5+ bairros
- 💰 "Money Maker" - R$ 10k faturados
```

#### 10.2 Leaderboard
```
- Ranking global de limpadores
- Filtros: este mês, últimos 3 meses, all-time
- Métricas: ganhos, reviews, conclusões, agilidade
- Posição pessoal destacada
- Top 10 com badges
```

#### 10.3 Desafios Semanais
```
- 3-4 desafios por semana
- Exemplo: "Complete 5 agendamentos"
- Exemplo: "Ganhe média 4.8+ estrelas"
- Exemplo: "Responda em < 5 minutos"
- Prêmio: badge + bonus em dinheiro (R$ 10-50)
```

#### 10.4 Página de Achievements
```
- Grid com todos os badges (bloqueados/desbloqueados)
- Progresso para próxima badge
- Data de conquista
- Compartilhar conquista (social)
- Histórico de desafios
```

### Componentes a Criar
- `AchievementsBadges.jsx` - Grid de badges
- `Leaderboard.jsx` - Ranking global
- `WeeklyChallenges.jsx` - Desafios atuais
- `AchievementDetail.jsx` - Modal detalhes
- `AdminChallengeManager.jsx` - Criar desafios

### API Endpoints Necessários
```
GET    /api/achievements/user/:id     # Badges do usuário
GET    /api/leaderboard               # Ranking global
POST   /api/achievements/unlock       # Desbloquear badge
GET    /api/challenges/weekly         # Desafios ativos
POST   /api/challenges/complete/:id   # Completar desafio
GET    /api/achievements/progress     # Progresso geral
```

### Banco de Dados
```prisma
model Badge {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  requirement String   // JSON com lógica
  
  UnlockedBadges UnlockedBadge[]
}

model UnlockedBadge {
  id        String   @id @default(cuid())
  cleanerId String
  badgeId   String
  unlockedAt DateTime @default(now())
  
  cleaner   Cleaner  @relation(fields: [cleanerId], references: [id])
  badge     Badge    @relation(fields: [badgeId], references: [id])
}

model Challenge {
  id        String   @id @default(cuid())
  title     String
  description String
  requirement String // JSON
  reward    Float
  active    Boolean  @default(true)
  startDate DateTime
  endDate   DateTime
  
  completions ChallengeCompletion[]
}

model ChallengeCompletion {
  id          String   @id @default(cuid())
  cleanerId   String
  challengeId String
  completedAt DateTime @default(now())
  bonus       Float    @default(0)
  
  cleaner    Cleaner   @relation(fields: [cleanerId], references: [id])
  challenge  Challenge @relation(fields: [challengeId], references: [id])
}
```

### Status de Implementação
- [ ] Database schema
- [ ] Sistema de cálculo de badges
- [ ] API endpoints (7)
- [ ] Frontend components (5)
- [ ] Testes unitários
- [ ] Testes E2E

---

## 🎯 MELHORIA #11: Analytics e Relatórios

### Objetivo
Fornecer dados para limpadores e admin tomarem decisões baseadas em dados.

### Features Principais

#### 11.1 Dashboard de Analytics (Cleaner)
```
Gráficos:
- Ganhos ao longo do tempo (linha)
- Agendamentos por dia (barra)
- Taxa de conclusão (gauge)
- Distribuição de tipos de limpeza (pizza)
- Comparação mês vs mês (linha dupla)

KPIs:
- Ganho médio por agendamento
- Tempo médio de resposta
- Taxa de cancelamento
- NPS (Net Promoter Score)
```

#### 11.2 Relatório Mensal
```
- PDF downloadável
- Resumo: ganhos, agendamentos, ratings
- Gráficos mensais
- Comparação com mês anterior
- Projeções
```

#### 11.3 Analytics Admin
```
- Receita total da plataforma
- Número de limpadores ativos
- Gráfico de crescimento
- Taxa de conversão cliente->booking
- Revenue por categoria de serviço
- Heatmap de regiões
```

#### 11.4 Segmentação
```
- Usuários por nível: bronze/silver/gold
- Retenção 30/60/90 dias
- LTV (lifetime value)
- Churn rate
```

### Componentes a Criar
- `AnalyticsDashboard.jsx` - Dashboard principal
- `ChartArea.jsx` - Gráficos genéricos
- `ReportGenerator.jsx` - Gerador de PDF
- `AdminAnalytics.jsx` - Panel admin
- `SegmentationView.jsx` - Segmentação

### API Endpoints Necessários
```
GET    /api/analytics/cleaner/:id     # Dados de cleaner
GET    /api/analytics/earnings        # Ganhos ao tempo
GET    /api/analytics/report/monthly  # Relatório mensal
GET    /api/admin/analytics           # Analytics admin
GET    /api/admin/analytics/revenue   # Receita plataforma
GET    /api/admin/analytics/retention # Retenção
```

### Banco de Dados
```prisma
model AnalyticsSnapshot {
  id        String   @id @default(cuid())
  cleanerId String?
  date      DateTime
  
  earnings  Float
  bookings  Int
  rating    Float
  responses Int
  
  createdAt DateTime @default(now())
  
  cleaner   Cleaner? @relation(fields: [cleanerId], references: [id])
}
```

### Status de Implementação
- [ ] Database schema
- [ ] Cálculo de métricas
- [ ] API endpoints (6)
- [ ] Frontend components (5)
- [ ] Gerador de PDF
- [ ] Testes

---

## 🎯 MELHORIA #12: Integração WhatsApp e Chat

### Objetivo
Permitir comunicação via WhatsApp e chat in-app entre cliente e limpador.

### Features Principais

#### 12.1 Chat In-App
```
- Conversas 1:1
- Histórico de mensagens
- Typing indicator ("digitando...")
- Leitura de mensagens (seen at)
- Buscar em conversas
- Notificação em tempo real
- Emojis e upload de imagens
```

#### 12.2 Integração WhatsApp
```
- Botão "Contatar via WhatsApp"
- Link pré-preenchido com telefone
- Mensagem padrão sugestão
- Logs de interação
- Opção de enviar link da proposta via WA
```

#### 12.3 Notificações
```
- Notificação app quando recebe mensagem
- Badge counter no ícone
- Som/vibração customizável
- Desktop notifications (PWA)
```

#### 12.4 Admin Moderation
```
- Ver conversas (com permissão)
- Reportar abuso
- Banir usuários de chat
```

### Componentes a Criar
- `ChatWindow.jsx` - Janela de chat
- `ConversationList.jsx` - Lista de conversas
- `MessageBubble.jsx` - Bolha de mensagem
- `ChatNotification.jsx` - Notificações
- `AdminChatModeration.jsx` - Moderação

### API Endpoints Necessários
```
POST   /api/messages                     # Enviar mensagem
GET    /api/messages/conversation/:id    # Histórico
GET    /api/conversations                # Minhas conversas
POST   /api/whatsapp/send                # Enviar via WA
GET    /api/messages/unread              # Contar não lidas
DELETE /api/messages/:id                 # Deletar mensagem
```

### Banco de Dados
```prisma
model Message {
  id            String   @id @default(cuid())
  conversationId String
  senderId      String
  content       String
  image         String?
  
  readAt        DateTime?
  createdAt     DateTime @default(now())
  
  conversation  Conversation @relation(fields: [conversationId], references: [id])
  sender        User     @relation(fields: [senderId], references: [id])
}

model Conversation {
  id        String   @id @default(cuid())
  user1Id   String
  user2Id   String
  
  lastMessage String?
  lastMessageAt DateTime?
  
  messages  Message[]
  participants User[]
  
  createdAt DateTime @default(now())
}
```

### Status de Implementação
- [ ] Database schema
- [ ] API endpoints (6)
- [ ] Frontend components (5)
- [ ] WebSocket real-time (Socket.io)
- [ ] WhatsApp integration (Twilio/Wapi)
- [ ] Testes

---

## 📊 RESUMO COMPARATIVO

| Melhoria | Foco | Complexidade | Prioridade | Tempo EST |
|----------|------|-------------|-----------|----------|
| #9 Reviews | Confiança | Média | 🔴 Alta | 2 semanas |
| #10 Gamification | Engagement | Média | 🟡 Média | 1.5 semanas |
| #11 Analytics | Dados | Alta | 🟡 Média | 2.5 semanas |
| #12 Chat | Comunicação | Alta | 🔴 Alta | 3 semanas |

**Total estimado**: 9-10 semanas

---

## 🔄 DEPENDÊNCIAS E ORDEM

```
1. MELHORIA #9 (Reviews)
   ↓
   └─→ MELHORIA #10 (Achievements) - Depende de dados de reviews
       ↓
       └─→ MELHORIA #11 (Analytics) - Usa dados de tudo
           ↓
           └─→ MELHORIA #12 (Chat) - Independente
```

**Ordem recomendada**:
1. #9 Reviews (base para reputação)
2. #10 Gamification (usa reviews)
3. #11 Analytics (integra tudo)
4. #12 Chat (comunicação)

---

## 🎨 DESIGN PATTERN

Todas as melhorias 9-12 seguirão o mesmo padrão das 1-8:

```
cada_melhoria/
├── Frontend
│   ├── Components/
│   ├── Pages/
│   └── Services/
├── Backend
│   ├── Controllers/
│   ├── Routes/
│   ├── Services/
│   └── Middleware/
├── Database
│   ├── Prisma Models
│   └── Migrations
└── Documentation
    ├── Especificação
    ├── Testes (70+ casos)
    └── Guia de implementação
```

---

## ✅ PRÓXIMOS PASSOS

1. **Aprovação** das especificações 9-12
2. **Priorização** entre as 4 features
3. **Alocação de recursos** (1-2 devs por melhoria)
4. **Sprint planning** (semanas 1-3: #9-10, semanas 4-6: #11-12)
5. **Kickoff** de desenvolvimento

---

## 📞 QUESTÕES ABERTAS

- [ ] Integração WhatsApp via Twilio ou Wapi?
- [ ] Armazenar imagens em upload direto ou processadas?
- [ ] Relatórios automáticos via email todo mês?
- [ ] Limite de mensagens por conversa?
- [ ] Gamificação: ativar/desativar globalmente?

---

**Versão**: 1.0
**Data**: Janeiro 2026
**Status**: Planejamento

