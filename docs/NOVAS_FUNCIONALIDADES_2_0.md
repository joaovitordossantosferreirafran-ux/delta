# 🚀 Novas Funcionalidades Implementadas - Versão 2.0

Documento gerado: **26 de Janeiro de 2026**

---

## 📋 Resumo das Funcionalidades

Este documento descreve as 5 novas funcionalidades principais implementadas no sistema:

1. ✅ **Sistema de Reagendamento**
2. ✅ **Avaliações Mútuas (Usuário ↔ Limpador)**
3. ✅ **Sistema de Punição (25 pontos + 2 dias bloqueio)**
4. ✅ **Sistema de Regiões com Modo Rápido**
5. ✅ **Ranking e Grade de Desempenho de Limpadores**

---

## 🔄 1. SISTEMA DE REAGENDAMENTO

### Objetivo
Permitir que usuários e limpadores reagendem faxinas de forma flexível, mantendo histórico de mudanças.

### Principais Funcionalidades

#### 1.1 Reagendar um Agendamento
```
POST /api/features/reschedule
{
  "bookingId": "clj123...",
  "newDate": "2026-02-15T14:00:00",
  "newStartTime": "14:00",
  "newEndTime": "16:00",
  "reason": "Cliente solicitou outro dia",
  "initiatedBy": "user" // ou "cleaner"
}
```

**Validações:**
- Agendamento deve existir e não estar completo
- Horário novo não pode conflitar com outros agendamentos do limpador
- Máximo de reagendamentos por agendamento: sem limite (mas registra histórico)

#### 1.2 Consultar Histórico de Reagendamentos
```
GET /api/features/reschedule/:bookingId
```

**Resposta:**
```json
{
  "success": true,
  "reschedules": [
    {
      "id": "rsch123...",
      "originalDate": "2026-02-10T10:00:00",
      "originalStartTime": "10:00",
      "originalEndTime": "12:00",
      "newDate": "2026-02-15T14:00:00",
      "newStartTime": "14:00",
      "newEndTime": "16:00",
      "reason": "Cliente solicitou outro dia",
      "initiatedBy": "user",
      "createdAt": "2026-01-26T15:30:00"
    }
  ]
}
```

#### 1.3 Histórico de Reagendamentos do Limpador
```
GET /api/features/reschedule/cleaner/:cleanerId?limit=50
```

---

## ⭐ 2. AVALIAÇÕES MÚTUAS (USER ↔ CLEANER)

### Objetivo
Criar um sistema robusto onde usuários avaliam limpadores E limpadores avaliam usuários/clientes.

### Fluxo Principal

#### 2.1 Criar Avaliação
```
POST /api/features/ratings
{
  "bookingId": "clj123...",
  "givenByUserId": "user-id-123",    // null se for limpador
  "givenByCleanerId": "cleaner-id", // null se for usuário
  "toUserId": "user-id-456",         // null se avaliação é para limpador
  "toCleanerId": "cleaner-id",       // null se avaliação é para usuário
  "rating": 5,                       // 1-5 obrigatório
  "comment": "Excelente limpeza!",
  "punctuality": 5,      // 1-5 opcional
  "professionalism": 4,  // 1-5 opcional
  "quality": 5,          // 1-5 opcional
  "communication": 4     // 1-5 opcional
}
```

#### 2.2 Editar Avaliação (até 7 dias)
```
PUT /api/features/ratings/:ratingId
{
  "rating": 4,
  "comment": "Muito bom, mas poderia melhorar...",
  "punctuality": 4
}
```

**Restrição:** Apenas nos primeiros 7 dias após criação.

#### 2.3 Flagar Avaliação como Abusiva
```
POST /api/features/ratings/:ratingId/flag
{
  "reason": "Conteúdo ofensivo"
}
```

A avaliação fica oculta até moderação admin.

#### 2.4 Consultar Avaliações de um Limpador
```
GET /api/features/ratings/cleaner/:cleanerId?limit=50&offset=0
```

**Resposta:**
```json
{
  "ratings": [
    {
      "id": "rating123...",
      "rating": 5,
      "comment": "Ótimo trabalho!",
      "punctuality": 5,
      "professionalism": 5,
      "quality": 5,
      "communication": 4,
      "isPublic": true,
      "flagged": false,
      "createdAt": "2026-01-26T10:00:00"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

#### 2.5 Estatísticas de Avaliação
```
GET /api/features/ratings/stats/:cleanerId
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "average": 4.8,
    "total": 45,
    "distribution": {
      "5": 35,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "avgPunctuality": 4.9,
    "avgProfessionalism": 4.7,
    "avgQuality": 4.8,
    "avgCommunication": 4.6
  }
}
```

---

## 🚫 3. SISTEMA DE PUNIÇÃO

### Objetivo
Punir limpadores e usuários que não cumprem com responsabilidades:
- **Punição padrão:** 25 pontos deduzidos + 2 dias bloqueado
- **Reputação inicial:** 100 pontos
- **Suspensão automática:** Quando reputação chega a 0

### Tipos de Punição

| Tipo | Pontos | Dias Bloqueio | Motivo |
|------|--------|---------------|--------|
| `no_show` | 25 | 2 | Não comparecimento |
| `cancellation_both` | 25 | 2 | Múltiplos cancelamentos |
| `low_rating` | 15 | 1 | Muitas avaliações baixas |

### Fluxo

#### 3.1 Aplicar Punição
```
POST /api/features/punishment
{
  "cleanerId": "cleaner-id-123",
  "type": "no_show",
  "reason": "Não compareceu no agendamento #booking123",
  "relatedBookingId": "booking123",
  "givenByAdmin": true,
  "adminId": "admin-id-456"
}
```

**Resposta:**
```json
{
  "success": true,
  "punishment": {
    "id": "pun123...",
    "cleanerId": "cleaner-id-123",
    "type": "no_show",
    "pointsDeducted": 25,
    "isActive": true,
    "blockedUntil": "2026-01-28T15:30:00",
    "reason": "Não compareceu no agendamento #booking123"
  },
  "cleaner": {
    "id": "cleaner-id-123",
    "reputationPoints": 75,  // Era 100, perdeu 25
    "status": "active"        // Seria "suspended" se chegasse a 0
  },
  "message": "Punição aplicada com sucesso. Limpador bloqueado até 28/01/2026"
}
```

#### 3.2 Verificar se Limpador Está Bloqueado
```
GET /api/features/punishment/check/:cleanerId
```

**Resposta (bloqueado):**
```json
{
  "isBlocked": true,
  "punishments": [
    {
      "id": "pun123...",
      "type": "no_show",
      "reason": "Não compareceu",
      "blockedUntil": "2026-01-28T15:30:00",
      "pointsDeducted": 25
    }
  ],
  "blockedUntil": "2026-01-28T15:30:00",
  "message": "Você está bloqueado até 28/01/2026 por: Não compareceu"
}
```

#### 3.3 Remover Punição (Admin)
```
DELETE /api/features/punishment/:punishmentId
{
  "adminId": "admin-id-456",
  "reason": "Apelação aprovada"
}
```

Restaura os pontos de reputação deduzidos.

#### 3.4 Histórico de Punições
```
GET /api/features/punishment/history/:cleanerId?limit=50
```

---

## 🗺️ 4. SISTEMA DE REGIÃO COM MODO RÁPIDO

### Objetivo
Permitir que usuários selecionem regiões de preferência e usem modo rápido para agendar rapidamente.

### Configurações Iniciais

#### 4.1 Definir Preferências de Região
```
POST /api/features/region/preferences
{
  "regions": ["Zona Sul", "Zona Oeste", "Centro"],
  "cities": ["São Paulo", "Guarulhos"],
  "maxDistance": 20, // km máximo
  "isQuickMode": false,
  "quickModeRegion": null
}
```

#### 4.2 Ativar Modo Rápido
Usuário seleciona rapidamente uma região para buscar limpadores:

```
POST /api/features/region/quick-mode
{
  "region": "Zona Sul"
}
```

**Efeito:** Sistema prioriza limpadores da "Zona Sul" nas buscas.

#### 4.3 Desativar Modo Rápido
```
DELETE /api/features/region/quick-mode
```

Volta para preferências padrão.

#### 4.4 Buscar Limpadores por Região
```
GET /api/features/region/cleaners?region=Zona+Sul&limit=50
```

**Resposta:**
```json
{
  "success": true,
  "region": "Zona Sul",
  "count": 15,
  "cleaners": [
    {
      "id": "cleaner1...",
      "name": "Maria Silva",
      "region": "Zona Sul",
      "averageRating": 4.9,
      "reviewCount": 45,
      "totalBookings": 120,
      "topCleanerBadge": true,
      "agilityScore": 9.2
    }
  ]
}
```

#### 4.5 Buscar em Múltiplas Regiões
```
GET /api/features/region/cleaners/multiple?regions=Zona+Sul,Zona+Oeste&limit=30
```

**Resposta:**
```json
{
  "success": true,
  "regions": ["Zona Sul", "Zona Oeste"],
  "results": {
    "Zona Sul": {
      "count": 15,
      "cleaners": [...]
    },
    "Zona Oeste": {
      "count": 12,
      "cleaners": [...]
    }
  }
}
```

#### 4.6 Gerenciar Regiões
```
POST /api/features/region/add
{
  "region": "Vila Mariana"
}

DELETE /api/features/region/Vila%20Mariana
```

#### 4.7 Listar Todas as Regiões
```
GET /api/features/region/list
```

---

## 🏆 5. RANKING E GRADE DE DESEMPENHO

### Objetivo
Mostrar ranking de limpadores baseado em desempenho, com grades de qualidade (A, B, C, D, F).

### 5.1 Componentes do Score

**Agilidade Score (0-10):**
- 40% = Taxa de aceitação de convites
- 30% = Tempo de resposta (até 5 min)
- 30% = Taxa de conclusão de trabalhos

**Reputação Points:**
- Começa com 100 pontos
- Deduz 25 pontos por punição
- Suspensão automática em 0 pontos

**Grade:**
- **A** = Score ≥ 9.0
- **B** = Score 8.0-8.9
- **C** = Score 7.0-7.9
- **D** = Score 6.0-6.9
- **F** = Score < 6.0

### Endpoints

#### 5.1 Ranking Global
```
GET /api/features/ranking/global?limit=50&offset=0
```

**Resposta:**
```json
{
  "success": true,
  "total": 250,
  "limit": 50,
  "offset": 0,
  "ranking": [
    {
      "globalRank": 1,
      "id": "cleaner1...",
      "name": "Ana Paula",
      "region": "Zona Sul",
      "averageRating": 4.95,
      "reviewCount": 150,
      "totalBookings": 300,
      "agilityScore": 9.7,
      "reputationPoints": 100,
      "topCleanerBadge": true
    }
  ]
}
```

#### 5.2 Ranking Regional
```
GET /api/features/ranking/region/Zona%20Sul?limit=20
```

#### 5.3 Rank de um Limpador
```
GET /api/features/ranking/cleaner/:cleanerId
```

**Resposta:**
```json
{
  "success": true,
  "cleaner": {
    "id": "cleaner1...",
    "name": "Ana Paula",
    "averageRating": 4.95,
    "reviewCount": 150,
    "totalBookings": 300,
    "agilityScore": 9.7,
    "reputationPoints": 100,
    "topCleanerBadge": true,
    "currentRank": 1,
    "metrics": {
      "ranking": 1,
      "topPercentile": true,
      "acceptanceRate": 96.5,
      "completionRate": 99.8,
      "avgRating": 4.95,
      "agilityScore": 9.7
    },
    "globalRank": 1
  }
}
```

#### 5.4 Grade de Desempenho
```
GET /api/features/ranking/grade/:cleanerId
```

**Resposta:**
```json
{
  "success": true,
  "grade": "A",
  "cleaner": {
    "id": "cleaner1...",
    "name": "Ana Paula",
    "photo": "https://...",
    "region": "Zona Sul"
  },
  "metrics": {
    "currentMonthCalls": 28,
    "acceptanceRate": 96.5,
    "completionRate": 99.8,
    "avgRating": 4.95,
    "agilityScore": 9.7,
    "monthlyRanking": 1
  },
  "reputation": {
    "points": 100,
    "status": "Excelente"
  },
  "global": {
    "rank": 1,
    "topPerformer": true,
    "badge": "TOP CLEANER"
  }
}
```

#### 5.5 Calcular Ranking Mensal (Admin)
```
POST /api/features/ranking/monthly
{
  "year": 2026,
  "month": 1
}
```

---

## 📊 Modelos de Banco de Dados

### BookingReschedule
```prisma
model BookingReschedule {
  id              String   @id @default(cuid())
  bookingId       String
  originalDate    DateTime
  originalStartTime String
  originalEndTime String
  newDate         DateTime
  newStartTime    String
  newEndTime      String
  reason          String?
  initiatedBy     String   // "user" ou "cleaner"
  createdAt       DateTime @default(now())
}
```

### UserRating
```prisma
model UserRating {
  id                String   @id @default(cuid())
  givenByUserId     String?
  givenByCleanerId  String?
  toUserId          String?
  toCleanerId       String?
  bookingId         String   @unique
  rating            Int      // 1-5
  comment           String?
  punctuality       Int?     // 1-5
  professionalism   Int?     // 1-5
  quality           Int?     // 1-5
  communication     Int?     // 1-5
  isPublic          Boolean  @default(true)
  flagged           Boolean  @default(false)
  flagReason        String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### CleanerPunishment
```prisma
model CleanerPunishment {
  id                String   @id @default(cuid())
  cleanerId         String
  type              String   // "no_show", "cancellation_both", "low_rating"
  reason            String
  pointsDeducted    Int      @default(25)
  isActive          Boolean  @default(true)
  blockedUntil      DateTime?
  relatedBookingId  String?
  relatedDisputeId  String?
  givenByAdmin      Boolean  @default(false)
  adminId           String?
  description       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### RegionPreference
```prisma
model RegionPreference {
  id                String   @id @default(cuid())
  userId            String
  regions           String[] // ["Zona Sul", "Zona Oeste"]
  cities            String[] // ["São Paulo", "Guarulhos"]
  maxDistance       Int      @default(20)
  isQuickMode       Boolean  @default(false)
  quickModeRegion   String?
  isDefault         Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## 🔧 Fluxos de Negócio

### Fluxo 1: Reagendamento
1. Usuário tenta reagendar um agendamento
2. Sistema valida disponibilidade do limpador
3. Sistema registra reagendamento no histórico
4. Ambos recebem notificação
5. Pagamento é mantido ou ajustado conforme necessário

### Fluxo 2: Avaliação e Punição
1. Agendamento é concluído
2. Ambos (usuário e limpador) podem avaliar-se mutuamente
3. Se avaliação for muito baixa, sistema notifica
4. Admin pode aplicar punição se necessário
5. Limpador é bloqueado se punição for ativa
6. Após período de bloqueio, acesso é restaurado automaticamente

### Fluxo 3: Seleção de Região em Modo Rápido
1. Usuário acessa app
2. Ativa "Modo Rápido" e seleciona região
3. Sistema filtra limpadores apenas dessa região
4. Usuário escolhe limpador rapidamente
5. Agendamento é criado
6. Desativa modo rápido quando terminar (opcional)

### Fluxo 4: Consulta de Rankings
1. Usuário entra na página "Melhores Limpadores"
2. Vê ranking global ordenado por agilidade + avaliação
3. Pode filtrar por região
4. Vê grade de desempenho (A-F) de cada limpador
5. Escolhe com base em reputação e desempenho

---

## 📱 Integração Frontend

### Componentes Recomendados

1. **RescheduleModal.jsx** - Modal para reagendar
2. **RatingModal.jsx** - Modal para avaliar
3. **PunishmentBanner.jsx** - Banner de bloqueio
4. **RegionQuickSelect.jsx** - Seletor rápido de região
5. **CleanerGradeCard.jsx** - Card com grade A-F
6. **RankingList.jsx** - Lista de ranking com filtros
7. **CleanerStatsChart.jsx** - Gráficos de desempenho

---

## ⚠️ Considerações de Segurança

1. **Autenticação:** Todos os endpoints requerem token JWT (exceto rankings públicos)
2. **Autorização:** Apenas admin pode remover punições
3. **Data:** Avalições ocultas após 7 dias (remoção de histórico)
4. **Moderação:** Reviews flagadas requerem aprovação admin
5. **Bloqueio:** Automático ao atingir 0 pontos de reputação

---

## 🚀 Próximos Passos

1. Criar testes unitários para todas as services
2. Implementar notificações em tempo real via WebSocket
3. Adicionar dashboard admin para monitorar punições
4. Criar visualizações de ranking no frontend
5. Implementar sistema automático de punição por no-show
6. Adicionar export de relatórios (CSV/PDF)

---

**Documentação completa:** Acesse os arquivos de service para mais detalhes de implementação.

**Última atualização:** 26 de Janeiro de 2026
