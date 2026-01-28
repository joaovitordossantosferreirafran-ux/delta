# 🔌 GUIA DE INTEGRAÇÃO BACKEND - MELHORIAS 4-8

## Endpoints Necessários para Implementar

Total: **17 endpoints** nos seguintes serviços

---

## 📅 1. SCHEDULER SERVICE (2 endpoints)

### GET /api/cleaners/:id/schedule
**Função**: Obter agenda atual da faxineira

**Request**:
```javascript
GET /api/cleaners/123/schedule
Authorization: Bearer {token}
```

**Response** (Mock):
```javascript
{
  scheduleType: 'fixed', // ou 'flexible'
  weekDays: [
    {
      dayOfWeek: 1, // 0=Dom, 1=Seg, ...
      isWorking: true,
      timeSlots: [
        { startTime: '08:00', endTime: '12:00' }
      ]
    },
    // ... 6 mais dias
  ],
  availableDates: [], // se flexible
  minBookingInAdvance: 24, // horas
  maxBookingsPerDay: 3
}
```

**Implementação** (em `backend/src/services/scheduleService.js`):
```javascript
exports.getSchedule = async (cleanerId) => {
  const schedule = await CleanerSchedule.findOne({ cleanerId });
  if (!schedule) {
    // Retornar agenda padrão
    return defaultSchedule();
  }
  return schedule;
};

const defaultSchedule = () => ({
  scheduleType: 'fixed',
  weekDays: [
    { dayOfWeek: 0, isWorking: false, timeSlots: [] }, // Domingo
    { dayOfWeek: 1, isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Seg
    { dayOfWeek: 2, isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Ter
    { dayOfWeek: 3, isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Qua
    { dayOfWeek: 4, isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Qui
    { dayOfWeek: 5, isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Sex
    { dayOfWeek: 6, isWorking: false, timeSlots: [] } // Sábado
  ],
  availableDates: [],
  minBookingInAdvance: 24,
  maxBookingsPerDay: 3
});
```

---

### PUT /api/cleaners/:id/schedule
**Função**: Salvar agenda da faxineira

**Request**:
```javascript
PUT /api/cleaners/123/schedule
Authorization: Bearer {token}
Content-Type: application/json

{
  scheduleType: 'fixed',
  weekDays: [
    {
      dayOfWeek: 1,
      isWorking: true,
      timeSlots: [
        { startTime: '09:00', endTime: '14:00' }
      ]
    },
    // ... mais dias
  ],
  // ou
  availableDates: [
    {
      date: '2026-02-20',
      startTime: '10:00',
      endTime: '18:00',
      isBlocked: false
    }
  ]
}
```

**Response** (Mock):
```javascript
{
  success: true,
  message: 'Agenda salva com sucesso!',
  scheduleId: 'schedule-123'
}
```

**Implementação**:
```javascript
exports.updateSchedule = async (cleanerId, scheduleData) => {
  const schedule = await CleanerSchedule.findOneAndUpdate(
    { cleanerId },
    scheduleData,
    { upsert: true, new: true }
  );
  
  // Marcar faxineira como ativa
  await Cleaner.updateOne(
    { _id: cleanerId },
    { isActive: true, lastUpdateDate: new Date() }
  );
  
  return { success: true, schedule };
};
```

---

## 🏆 2. BONUS SERVICE (6 endpoints)

### GET /api/bonus/check/:cleanerId
**Função**: Verificar elegibilidade para novo bônus

**Request**:
```javascript
GET /api/bonus/check/123
Authorization: Bearer {token}
```

**Response** (Mock):
```javascript
{
  eligible: true, // ou false
  consecutiveFiveStars: 10,
  bonusAmount: 100.00,
  cleaner: {
    id: 123,
    name: 'Maria Silva',
    email: 'maria@email.com'
  },
  lastBonusDate: '2026-01-15'
}
```

**Implementação**:
```javascript
exports.checkEligibility = async (cleanerId) => {
  const cleaner = await Cleaner.findById(cleanerId);
  const eligible = cleaner.consecutiveFiveStars >= 10;
  
  return {
    eligible,
    consecutiveFiveStars: cleaner.consecutiveFiveStars,
    bonusAmount: 100.00,
    cleaner: {
      id: cleaner._id,
      name: cleaner.name,
      email: cleaner.email
    },
    lastBonusDate: cleaner.lastBonusDate
  };
};
```

---

### POST /api/bonus/transfer
**Função**: Processar transferência de bônus

**Request**:
```javascript
POST /api/bonus/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  cleanerId: 123
}
```

**Response** (Mock):
```javascript
{
  success: true,
  message: 'Bônus transferido com sucesso!',
  amount: 100.00,
  transferDate: '2026-02-15',
  topCleanerUntil: '2026-03-15',
  newConsecutiveFiveStars: 0 // Reseta após transferência
}
```

**Implementação**:
```javascript
exports.processBonus = async (cleanerId) => {
  const cleaner = await Cleaner.findById(cleanerId);
  
  if (cleaner.consecutiveFiveStars < 10) {
    throw new Error('Não elegível para bônus');
  }
  
  // Atualizar cleaner
  cleaner.totalBonusEarned += 100;
  cleaner.consecutiveFiveStars = 0; // Reset
  cleaner.topCleanerBadge = true;
  cleaner.topCleanerUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  cleaner.lastBonusDate = new Date();
  await cleaner.save();
  
  // Criar transação de pagamento
  const bonus = await Bonus.create({
    cleanerId,
    amount: 100,
    reason: '10 avaliações 5 estrelas',
    status: 'completed',
    transferDate: new Date()
  });
  
  return {
    success: true,
    bonus,
    topCleanerUntil: cleaner.topCleanerUntil
  };
};
```

---

### GET /api/bonus/history/:cleanerId
**Função**: Obter histórico de bônus

**Request**:
```javascript
GET /api/bonus/history/123?limit=10
Authorization: Bearer {token}
```

**Response** (Mock):
```javascript
{
  bonuses: [
    {
      id: 'bonus-1',
      amount: 100.00,
      date: '2026-01-15',
      reason: '10 avaliações 5 estrelas',
      status: 'completed'
    },
    {
      id: 'bonus-2',
      amount: 100.00,
      date: '2025-12-20',
      reason: '10 avaliações 5 estrelas',
      status: 'completed'
    }
  ],
  totalBonusEarned: 300.00,
  total: 3
}
```

**Implementação**:
```javascript
exports.getHistory = async (cleanerId, limit = 10) => {
  const bonuses = await Bonus.find({ cleanerId })
    .sort({ date: -1 })
    .limit(limit);
  
  const cleaner = await Cleaner.findById(cleanerId);
  
  return {
    bonuses,
    totalBonusEarned: cleaner.totalBonusEarned,
    total: bonuses.length
  };
};
```

---

### POST /api/bonus/register-review
**Função**: Registrar avaliação 5 estrelas

**Request**:
```javascript
POST /api/bonus/register-review
Authorization: Bearer {token}
Content-Type: application/json

{
  bookingId: 'booking-123',
  cleanerId: 123,
  rating: 5
}
```

**Response** (Mock):
```javascript
{
  success: true,
  message: 'Avaliação registrada',
  consecutiveFiveStars: 9,
  nextBonusIn: 1 // Falta 1 avaliação para bônus
}
```

**Implementação**:
```javascript
exports.registerReview = async (bookingId, cleanerId, rating) => {
  const review = await Review.findOne({ bookingId });
  
  if (!review) {
    throw new Error('Avaliação não encontrada');
  }
  
  if (rating === 5) {
    const cleaner = await Cleaner.findById(cleanerId);
    cleaner.consecutiveFiveStars += 1;
    await cleaner.save();
    
    return {
      success: true,
      consecutiveFiveStars: cleaner.consecutiveFiveStars,
      nextBonusIn: Math.max(0, 10 - cleaner.consecutiveFiveStars)
    };
  }
  
  // Se rating < 5, reseta contador
  const cleaner = await Cleaner.findById(cleanerId);
  cleaner.consecutiveFiveStars = 0;
  await cleaner.save();
  
  return {
    success: true,
    message: 'Contador ressetado',
    consecutiveFiveStars: 0,
    nextBonusIn: 10
  };
};
```

---

### GET /api/bonus/top-cleaner/:cleanerId
**Função**: Obter status TOP CLEANER

**Request**:
```javascript
GET /api/bonus/top-cleaner/123
Authorization: Bearer {token}
```

**Response** (Mock):
```javascript
{
  isTopCleaner: true,
  topCleanerUntil: '2026-03-15',
  daysRemaining: 28,
  consecutiveFiveStars: 0,
  totalBonusEarned: 300.00,
  bonuses: 3
}
```

**Implementação**:
```javascript
exports.getTopCleanerStatus = async (cleanerId) => {
  const cleaner = await Cleaner.findById(cleanerId);
  const isTopCleaner = cleaner.topCleanerBadge && 
                       cleaner.topCleanerUntil > new Date();
  
  return {
    isTopCleaner,
    topCleanerUntil: cleaner.topCleanerUntil,
    daysRemaining: isTopCleaner 
      ? Math.ceil((cleaner.topCleanerUntil - new Date()) / (24 * 60 * 60 * 1000))
      : 0,
    consecutiveFiveStars: cleaner.consecutiveFiveStars,
    totalBonusEarned: cleaner.totalBonusEarned
  };
};
```

---

### POST /api/bonus/update-agility
**Função**: Atualizar score de agilidade

**Request**:
```javascript
POST /api/bonus/update-agility
Authorization: Bearer {token}
Content-Type: application/json

{
  cleanerId: 123,
  bookingId: 'booking-123'
}
```

**Response** (Mock):
```javascript
{
  success: true,
  agilityScore: 8.5,
  responseTime: '2h 15m',
  completionRate: 95
}
```

**Implementação**:
```javascript
exports.updateAgilityScore = async (cleanerId, bookingId) => {
  const booking = await Booking.findById(bookingId);
  const cleaner = await Cleaner.findById(cleanerId);
  
  // Calcular tempo de resposta
  const responseTime = new Date() - booking.createdAt;
  const responseMinutes = responseTime / (1000 * 60);
  
  // Calcular taxa de conclusão
  const completedBookings = await Booking.countDocuments({
    cleanerId,
    status: 'completed'
  });
  const totalBookings = await Booking.countDocuments({ cleanerId });
  const completionRate = (completedBookings / totalBookings) * 100;
  
  // Score: 0-10 baseado em resposta + conclusão
  let score = 5;
  if (responseMinutes < 60) score += 3;
  else if (responseMinutes < 240) score += 2;
  else if (responseMinutes < 480) score += 1;
  
  if (completionRate >= 95) score += 2;
  else if (completionRate >= 85) score += 1;
  
  score = Math.min(10, score);
  
  cleaner.agilityScore = score;
  await cleaner.save();
  
  return {
    success: true,
    agilityScore: score,
    completionRate: completionRate.toFixed(1)
  };
};
```

---

## 🔔 3. NOTIFICATION SERVICE (5 endpoints)

### POST /api/notifications/register-token
**Função**: Registrar token para push notifications

**Request**:
```javascript
POST /api/notifications/register-token
Authorization: Bearer {token}
Content-Type: application/json

{
  userId: 123,
  token: 'firebase-token-abc123',
  platform: 'web' // ou 'ios', 'android'
}
```

**Response**:
```javascript
{
  success: true,
  message: 'Token registrado',
  registered: true
}
```

**Implementação**:
```javascript
exports.registerToken = async (userId, token, platform) => {
  const deviceToken = await DeviceToken.findOneAndUpdate(
    { userId, platform },
    { token, lastUpdated: new Date() },
    { upsert: true, new: true }
  );
  
  return { success: true, registered: true };
};
```

---

### GET /api/notifications/history/:userId
**Função**: Obter histórico de notificações

**Request**:
```javascript
GET /api/notifications/history/123?limit=10
Authorization: Bearer {token}
```

**Response**:
```javascript
{
  notifications: [
    {
      id: 'notif-1',
      type: 'booking',
      title: 'Novo Agendamento',
      message: 'Maria agendou para amanhã',
      read: false,
      createdAt: '2026-02-15T10:30:00Z'
    },
    {
      id: 'notif-2',
      type: 'payment',
      title: 'Pagamento Recebido',
      message: 'Você recebeu R$ 150,00',
      read: true,
      createdAt: '2026-02-14T15:45:00Z'
    }
  ],
  total: 25,
  unread: 3
}
```

**Implementação**:
```javascript
exports.getHistory = async (userId, limit = 10) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  const unread = await Notification.countDocuments({
    userId,
    read: false
  });
  
  return {
    notifications,
    total: await Notification.countDocuments({ userId }),
    unread
  };
};
```

---

### PUT /api/notifications/read/:notificationId
**Função**: Marcar notificação como lida

**Request**:
```javascript
PUT /api/notifications/read/notif-123
Authorization: Bearer {token}
```

**Response**:
```javascript
{
  success: true,
  notification: {
    id: 'notif-123',
    read: true,
    readAt: '2026-02-15T10:35:00Z'
  }
}
```

**Implementação**:
```javascript
exports.markAsRead = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { read: true, readAt: new Date() },
    { new: true }
  );
  
  return { success: true, notification };
};
```

---

### DELETE /api/notifications/:notificationId
**Função**: Deletar notificação

**Request**:
```javascript
DELETE /api/notifications/notif-123
Authorization: Bearer {token}
```

**Response**:
```javascript
{
  success: true,
  message: 'Notificação deletada'
}
```

**Implementação**:
```javascript
exports.deleteNotification = async (notificationId) => {
  await Notification.findByIdAndDelete(notificationId);
  return { success: true };
};
```

---

### POST /api/notifications/send
**Função**: Enviar notificação (interno, chamado por outros serviços)

**Request**:
```javascript
POST /api/notifications/send
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  userId: 123,
  type: 'booking',
  title: 'Novo Agendamento',
  message: 'João agendou sua limpeza',
  data: { bookingId: 'booking-123' }
}
```

**Response**:
```javascript
{
  success: true,
  notification: { /* ... */ }
}
```

**Implementação**:
```javascript
exports.sendNotification = async (userId, type, title, message, data) => {
  // Salvar no banco
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    read: false
  });
  
  // Enviar push via Firebase (se token registrado)
  const deviceTokens = await DeviceToken.find({ userId });
  for (const device of deviceTokens) {
    await admin.messaging().send({
      token: device.token,
      notification: { title, body: message },
      data: { notificationId: notification._id.toString(), ...data }
    });
  }
  
  return { success: true, notification };
};
```

---

## 👨‍💼 4. ADMIN SERVICE (4 endpoints)

### GET /api/admin/dashboard/stats
**Função**: Obter estatísticas do dashboard

**Request**:
```javascript
GET /api/admin/dashboard/stats
Authorization: Bearer {adminToken}
```

**Response**:
```javascript
{
  totalUsers: 156,
  totalCleaners: 42,
  totalBookings: 1203,
  totalRevenue: 45200.50,
  totalPayouts: 31500.00,
  platformFee: 13700.50,
  activeBookings: 45,
  completedThisMonth: 320,
  averageRating: 4.7,
  monthlyGrowth: 12.5
}
```

**Implementação**:
```javascript
exports.getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalCleaners = await Cleaner.countDocuments();
  const totalBookings = await Booking.countDocuments();
  
  const completedBookings = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$finalPrice' } } }
  ]);
  
  const totalRevenue = completedBookings[0]?.total || 0;
  const platformFee = totalRevenue * 0.3; // 30%
  const totalPayouts = totalRevenue - platformFee;
  
  return {
    totalUsers,
    totalCleaners,
    totalBookings,
    totalRevenue,
    totalPayouts,
    platformFee
  };
};
```

---

### GET /api/admin/users
**Função**: Listar usuários com filtros

**Request**:
```javascript
GET /api/admin/users?type=cleaner&status=active&page=1&limit=20
Authorization: Bearer {adminToken}
```

**Response**:
```javascript
{
  users: [
    {
      id: 1,
      name: 'Maria Silva',
      type: 'cleaner',
      email: 'maria@email.com',
      status: 'active',
      joinDate: '2025-10-15',
      bookingsCompleted: 45,
      rating: 4.8
    }
  ],
  total: 156,
  pages: 8
}
```

**Implementação**:
```javascript
exports.getUsers = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  
  const users = await User.find(query)
    .limit(filters.limit || 20)
    .skip(((filters.page || 1) - 1) * (filters.limit || 20));
  
  const total = await User.countDocuments(query);
  
  return {
    users,
    total,
    pages: Math.ceil(total / (filters.limit || 20))
  };
};
```

---

### GET /api/admin/bookings
**Função**: Listar agendamentos com status

**Request**:
```javascript
GET /api/admin/bookings?status=completed&page=1&limit=20
Authorization: Bearer {adminToken}
```

**Response**:
```javascript
{
  bookings: [
    {
      id: 1,
      client: 'João Santos',
      cleaner: 'Maria Silva',
      date: '2026-02-01',
      amount: 150.00,
      status: 'completed',
      rating: 5
    }
  ],
  total: 1203,
  pages: 61
}
```

---

### GET /api/admin/payments
**Função**: Listar pagamentos às faxineiras

**Request**:
```javascript
GET /api/admin/payments?status=pending&page=1&limit=20
Authorization: Bearer {adminToken}
```

**Response**:
```javascript
{
  payments: [
    {
      id: 1,
      cleaner: 'Maria Silva',
      amount: 1500.00,
      status: 'pending',
      date: '2026-01-25',
      method: 'pix'
    }
  ],
  total: 45,
  totalAmount: 67500.00
}
```

---

## 📝 Model Prisma Necessários

Adicionar ao `backend/prisma/schema.prisma`:

```prisma
model CleanerSchedule {
  id              String    @id @default(cuid())
  cleanerId       String    @unique
  cleaner         Cleaner   @relation(fields: [cleanerId], references: [id])
  scheduleType    String    @default("fixed") // fixed ou flexible
  weekDays        Json      // Array de dias da semana
  availableDates  Json      // Array de datas disponíveis
  minBookingInAdvance Int   @default(24) // horas
  maxBookingsPerDay Int     @default(3)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Bonus {
  id              String    @id @default(cuid())
  cleanerId       String
  cleaner         Cleaner   @relation(fields: [cleanerId], references: [id])
  amount          Float     @default(100)
  reason          String    // Ex: \"10 avaliações 5 estrelas\"
  status          String    @default("pending") // completed, pending, failed
  transferDate    DateTime
  createdAt       DateTime  @default(now())
}

model Notification {
  id              String    @id @default(cuid())
  userId          String
  type            String    // booking, payment, bonus, rating, etc
  title           String
  message         String
  data            Json?
  read            Boolean   @default(false)
  readAt          DateTime?
  createdAt       DateTime  @default(now())
}

model DeviceToken {
  id              String    @id @default(cuid())
  userId          String
  token           String
  platform        String    // web, ios, android
  lastUpdated     DateTime  @updatedAt
}
```

---

## 🚀 Ordem de Implementação Recomendada

1. **Scheduler** (2 endpoints)
2. **Bônus** (6 endpoints)
3. **Notificações** (5 endpoints)
4. **Admin** (4 endpoints)

Cada um é independente dos outros.

---

**Status**: Pronto para Implementação
**Data**: 15/02/2026
