# 🎯 GUIA RÁPIDO - Novas Funcionalidades v2.0

## ✅ O que foi implementado?

### 1️⃣ Reagendamento de Faxinas
- **POST** `/api/features/reschedule` - Reagendar um agendamento
- **GET** `/api/features/reschedule/:bookingId` - Ver histórico de reagendamentos
- **Validações:** Sem conflitos de horário, histórico completo

### 2️⃣ Avaliações Mútuas (User ↔ Cleaner)
- **POST** `/api/features/ratings` - Criar avaliação (5 estrelas + comentário)
- **PUT** `/api/features/ratings/:ratingId` - Editar até 7 dias
- **POST** `/api/features/ratings/:ratingId/flag` - Flagar como abusiva
- **GET** `/api/features/ratings/cleaner/:cleanerId` - Ver avaliações
- **GET** `/api/features/ratings/stats/:cleanerId` - Estatísticas completas

### 3️⃣ Sistema de Punição (25pts + 2 dias)
- **POST** `/api/features/punishment` - Aplicar punição
- **GET** `/api/features/punishment/check/:cleanerId` - Verificar se está bloqueado
- **DELETE** `/api/features/punishment/:punishmentId` - Remover (admin)
- **Tipos:** no_show, cancellation_both, low_rating
- **Bloqueio automático:** 2 dias após punição
- **Reputação:** Começa 100pts, perde 25 por punição, suspensão em 0pts

### 4️⃣ Regiões + Modo Rápido
- **POST** `/api/features/region/preferences` - Definir regiões favoritas
- **POST** `/api/features/region/quick-mode` - Ativar modo rápido (selecionar 1 região)
- **GET** `/api/features/region/cleaners` - Buscar limpadores por região
- **GET** `/api/features/region/cleaners/multiple` - Buscar em várias regiões
- **GET** `/api/features/region/list` - Listar todas regiões do sistema

### 5️⃣ Ranking e Grade de Desempenho
- **GET** `/api/features/ranking/global` - Ranking de todos limpadores
- **GET** `/api/features/ranking/region/:region` - Ranking por região
- **GET** `/api/features/ranking/grade/:cleanerId` - Grade A-F do limpador
- **GET** `/api/features/ranking/cleaner/:cleanerId` - Rank específico
- **POST** `/api/features/ranking/monthly` - Calcular ranking mês (admin)

---

## 📊 Estrutura do Banco de Dados

### Novos Modelos Criados:
1. **BookingReschedule** - Histórico de reagendamentos
2. **UserRating** - Avaliações mútuas com flagging
3. **CleanerPunishment** - Registro de punições
4. **RegionPreference** - Preferências de região do usuário

### Modelos Atualizados:
- **Cleaner** - Adicionados: `reputationPoints`, `currentRank`
- **User** - Adicionada relação com `RegionPreference`
- **Booking** - Adicionadas relações com `BookingReschedule` e `UserRating`

---

## 🚀 Como Usar - Exemplos Práticos

### Exemplo 1: Reagendar uma Faxina
```bash
curl -X POST http://localhost:5000/api/features/reschedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "clj123...",
    "newDate": "2026-02-15",
    "newStartTime": "14:00",
    "newEndTime": "16:00",
    "reason": "Cliente pediu outro dia",
    "initiatedBy": "user"
  }'
```

### Exemplo 2: Avaliar um Limpador (5 estrelas)
```bash
curl -X POST http://localhost:5000/api/features/ratings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "clj123...",
    "givenByUserId": "user-123",
    "toCleanerId": "cleaner-456",
    "rating": 5,
    "comment": "Excelente trabalho!",
    "punctuality": 5,
    "professionalism": 5,
    "quality": 5,
    "communication": 4
  }'
```

### Exemplo 3: Ativar Modo Rápido
```bash
curl -X POST http://localhost:5000/api/features/region/quick-mode \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Zona Sul"
  }'

# Buscar limpadores da região
curl -X GET "http://localhost:5000/api/features/region/cleaners?region=Zona%20Sul" \
  -H "Authorization: Bearer TOKEN"
```

### Exemplo 4: Ver Grade de Desempenho
```bash
curl -X GET http://localhost:5000/api/features/ranking/grade/cleaner-123 \
  -H "Authorization: Bearer TOKEN"

# Resposta:
# {
#   "grade": "A",
#   "metrics": {
#     "agilityScore": 9.7,
#     "acceptanceRate": 96.5,
#     "completionRate": 99.8
#   },
#   "reputation": { "points": 100, "status": "Excelente" }
# }
```

### Exemplo 5: Aplicar Punição por No-Show
```bash
curl -X POST http://localhost:5000/api/features/punishment \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cleanerId": "cleaner-123",
    "type": "no_show",
    "reason": "Não compareceu no agendamento",
    "relatedBookingId": "booking-789",
    "givenByAdmin": true,
    "adminId": "admin-456"
  }'
```

---

## 🔐 Autenticação

Todos os endpoints requerem header:
```
Authorization: Bearer <JWT_TOKEN>
```

Exceto:
- `GET /api/features/rating/stats/:cleanerId` - Público
- `GET /api/features/ranking/global` - Público
- `GET /api/features/ranking/region/:region` - Público
- `GET /api/features/region/list` - Público

---

## ⚠️ Regras Importantes

### Punição
- **25 pontos** deduzidos por punição
- **2 dias bloqueado** no site
- **Reputação começa 100pts**
- **Suspensão automática em 0pts**

### Avaliações
- Máximo de **5 estrelas**
- Podem ser editadas até **7 dias** após criação
- Flagadas como abusivas ficam ocultas
- Registram diversos aspectos (pontualidade, profissionalismo, etc)

### Regiões
- Usuário pode ter **múltiplas regiões favoritas**
- **Modo rápido** limita a apenas 1 região
- Distância máxima configurável

### Ranking
- Baseado em **agilidade (0-10)**
- 40% aceitação + 30% resposta + 30% conclusão
- Grades **A (≥9.0), B (8-8.9), C (7-7.9), D (6-6.9), F (<6)**
- Top 5% recebem badge "TOP CLEANER"

---

## 📚 Documentação Completa

Para detalhes completos, veja:
- **[NOVAS_FUNCIONALIDADES_2_0.md](./NOVAS_FUNCIONALIDADES_2_0.md)** - Documentação técnica completa
- **[backend/src/services/](../backend/src/services/)** - Código das services
- **[backend/src/routes/features.js](../backend/src/routes/features.js)** - Rotas API

---

## 🔧 Setup & Deployment

### Migrações Necessárias
```bash
cd backend
npm install
npx prisma migrate dev --name add_new_features

# Verificar banco de dados
npx prisma studio
```

### Variáveis de Ambiente (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/cleaner_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

---

## 🤝 Próximas Etapas

1. ✅ **Backend implementado** - Todos endpoints rodando
2. 🟡 **Frontend** - Criar componentes React
3. 🟡 **Testes** - Unitários e E2E
4. 🟡 **Mobile** - Adaptar para React Native
5. 🟡 **Admin Dashboard** - Painel de moderação

---

## 📞 Suporte

Dúvidas? Consulte a [documentação técnica completa](./NOVAS_FUNCIONALIDADES_2_0.md).

**Última atualização:** 26 de Janeiro de 2026  
**Versão:** 2.0 Release
