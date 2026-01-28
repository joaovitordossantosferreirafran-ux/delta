# 💰 Sistema de Pagamento - Documentação Completa

## 🎯 Visão Geral

O sistema funciona assim:

```
CLIENTE                 PLATAFORMA              FAXINEIRA
    |                       |                       |
    |--agendamento--------->|                       |
    |                       |<--notifica------------|
    |<--confirmação---------|                       |
    |                       |                       |
    |--pagamento (cartão)-->|                       |
    |   (R$ 180,00)         |                       |
    |                       |--repassa---(R$ 150)-->|
    |                       |   (via PIX/Boleto)    |
    |<--confirmação---------|                       |
    |                       |                       |
    |<--notificação---------|                       |
    |  (serviço marcado)    |                       |
    |                       |<--conclui serviço------|
    |                       |--recebe pix---------->|
    |<--notificação---------|                       |
    |  (serviço concluído)  |                       |
```

---

## 📋 Dados de Cadastro da Faxineira

### Página de Registro (Atualizado)

```jsx
// Register.jsx - Novos campos para faxineira

{userType === 'cleaner' && (
  <>
    {/* Campos Básicos */}
    <input name="cpf" placeholder="000.000.000-00" required />
    <input name="age" type="number" min="18" required />
    <select name="region" required>
      <option value="">Selecione região</option>
      <option value="Centro">Centro</option>
      {/* ... */}
    </select>
    <input name="photo" type="file" accept="image/*" required />
    
    {/* NOVOS - Dados Bancários */}
    <fieldset>
      <legend>Dados Bancários (para receber pagamentos)</legend>
      
      {/* Banco */}
      <select name="bankCode" required>
        <option value="">Selecione banco</option>
        <option value="001">Banco do Brasil</option>
        <option value="033">Santander</option>
        <option value="237">Bradesco</option>
        <option value="041">Banrisul</option>
        {/* ... */}
      </select>
      
      {/* Tipo de Conta */}
      <select name="accountType" required>
        <option value="">Tipo de conta</option>
        <option value="corrente">Conta Corrente</option>
        <option value="poupanca">Conta Poupança</option>
      </select>
      
      {/* Número da Conta */}
      <input name="accountNumber" placeholder="Número da conta" required />
      <input name="accountDigit" placeholder="Dígito" maxLength="1" />
      
      {/* Nome do Titular */}
      <input name="accountHolderName" placeholder="Nome no banco" required />
      
      {/* OU PIX */}
      <legend>Dados PIX (Recomendado - Mais Rápido)</legend>
      
      <select name="pixKeyType" onChange={handlePixType}>
        <option value="">Tipo de chave PIX</option>
        <option value="cpf">CPF</option>
        <option value="email">Email</option>
        <option value="phone">Telefone</option>
        <option value="random">Chave Aleatória</option>
      </select>
      
      <input name="pixKey" placeholder="Sua chave PIX" required />
      
      {/* Valor por Hora */}
      <input 
        name="hourlyRate" 
        type="number" 
        step="0.01" 
        placeholder="R$ 75,00" 
        value={formData.hourlyRate || 75}
        onChange={handleChange}
      />
      
      {/* Método Preferido */}
      <select name="preferredPaymentMethod">
        <option value="pix">PIX (instantâneo)</option>
        <option value="bankTransfer">Transferência Bancária</option>
        <option value="both">Ambos</option>
      </select>
    </fieldset>
  </>
)}
```

---

## 💵 Cálculo de Preço (SÓ HORAS)

### Regra Simples
```
PREÇO TOTAL = Duração em Horas × Valor da Hora da Faxineira
```

### Exemplo:
```
Faxineira: Hourly Rate = R$ 75,00
Agendamento: 10:00 - 12:00 (2 horas)

Preço Bruto = 2 × R$ 75,00 = R$ 150,00

Com Markup da Plataforma (20%):
Preço Final = R$ 150,00 × 1.20 = R$ 180,00

Divisão:
├─ Faxineira recebe: R$ 150,00 ✅
├─ Plataforma fica: R$ 30,00
└─ Taxa Stripe (~3%): -R$ 5,40
   = Líquido plataforma: R$ 24,60
```

### Backend (Node.js)

```javascript
// services/bookingService.js

function calculateBookingPrice(booking) {
  const { cleaner, startTime, endTime } = booking;
  
  // 1. Calcular duração em horas
  const start = new Date(`2026-01-25 ${startTime}`);
  const end = new Date(`2026-01-25 ${endTime}`);
  const durationMs = end - start;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // 2. Preço bruto (SÓ HORAS)
  const cleanerEarnings = durationHours * cleaner.bankDetails.hourlyRate;
  
  // 3. Markup da plataforma (20%)
  const markup = 0.20;
  const totalPrice = cleanerEarnings * (1 + markup);
  
  // 4. Taxa da operadora (Stripe: ~2.99%)
  const stripeRate = 0.0299;
  const stripeFee = totalPrice * stripeRate;
  
  // 5. Retorno
  return {
    cleanerEarnings: cleanerEarnings,      // R$ 150,00
    platformMarkup: totalPrice - cleanerEarnings, // R$ 30,00
    totalClientPays: totalPrice,            // R$ 180,00
    stripeFee: stripeFee,                  // R$ 5,40
    platformLiquid: totalPrice - cleanerEarnings - stripeFee, // R$ 24,60
    durationHours: durationHours
  };
}
```

---

## 💳 Fluxo de Pagamento (Todas as Instâncias)

### 1️⃣ Cliente Faz Agendamento

```javascript
POST /bookings
{
  cleanerId: "cleaner-123",
  date: "2026-01-25",
  startTime: "10:00",
  endTime: "12:00",
  address: "Rua das Flores, 123",
  serviceType: "standard",
  notes: "Preferir sem produtos químicos"
}

Response:
{
  id: "booking-001",
  status: "pending",
  prices: {
    cleanerEarnings: 150.00,
    totalClientPays: 180.00,
    durationHours: 2
  }
}
```

### 2️⃣ Cliente Realiza Pagamento

```javascript
POST /payments/intent
{
  bookingId: "booking-001",
  method: "card", // card, pix, boleto
  amount: 180.00,
  currency: "BRL",
  cardToken: "tok_visa..."
}

Response:
{
  paymentId: "pay-001",
  status: "succeeded",
  amount: 180.00
}

Neste ponto:
├─ Stripe recebe R$ 180,00
├─ Cobra taxa (3%): -R$ 5,40
└─ Credita plataforma: R$ 174,60
```

### 3️⃣ Plataforma Agenda Transferência

```javascript
// Automático após confirmação de pagamento
POST /payments/transfer
{
  paymentId: "pay-001",
  bookingId: "booking-001",
  cleanerId: "cleaner-123",
  amount: 150.00, // SÓ O QUE A FAXINEIRA GANHA
  method: "pix" // Via PIX (instantâneo)
}

// Uso os dados do cleanerId:
const cleaner = await prisma.cleaner.findUnique({
  where: { id: "cleaner-123" },
  include: { bankDetails: true }
});

// Se PIX:
transferViaPix({
  pixKey: cleaner.bankDetails.pixKey,
  amount: 150.00,
  description: "Agendamento 25/01/2026 10:00-12:00"
});

// Se Transferência Bancária:
transferViaBankAccount({
  bankCode: cleaner.bankDetails.bankCode,
  accountNumber: cleaner.bankDetails.accountNumber,
  accountDigit: cleaner.bankDetails.accountDigit,
  accountHolderName: cleaner.bankDetails.accountHolderName,
  amount: 150.00
});
```

### 4️⃣ Faxineira Recebe Notificação

```javascript
// Enviar notificação
await sendNotification({
  cleanerId: "cleaner-123",
  type: "payment_received",
  title: "Pagamento Recebido",
  message: "Você recebeu R$ 150,00 via PIX",
  data: {
    amount: 150.00,
    method: "pix",
    bookingId: "booking-001"
  }
});
```

### 5️⃣ Após Conclusão do Serviço

```javascript
// Cliente marca serviço como concluído
PATCH /bookings/booking-001/complete
{
  status: "completed",
  rating: 5,
  review: "Excelente serviço!"
}

// Faxineira recebe confirmação final (opcional pagamento adicional se aplicável)
```

---

## 📊 Modelo de Dados Atualizado

```prisma
model Cleaner {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  phone         String
  cpf           String    @unique
  dateOfBirth   DateTime
  age           Int
  region        String
  photo         String?
  
  // NOVO - Relacionamento com dados bancários
  bankDetails   BankDetail?
  
  // ... outros campos
}

model BankDetail {
  id        String   @id @default(cuid())
  cleanerId String   @unique
  cleaner   Cleaner  @relation(fields: [cleanerId], references: [id])
  
  // Banco
  bankCode  String?          // "001", "033", "237"
  bankName  String?          // "Banco do Brasil"
  accountType String?        // "corrente", "poupança"
  accountNumber String?      // "12345678"
  accountDigit  String?      // "9"
  accountHolderName String?  // "Maria Silva"
  
  // PIX
  pixKey    String?          // "51980303740@example.com"
  pixKeyType String?         // "email", "cpf", "phone", "random"
  
  // Preço
  hourlyRate Float @default(75.00) // Valor por hora
  
  // Método de Pagamento
  preferredPaymentMethod String @default("pix") // "pix", "bankTransfer", "both"
  
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Payment {
  id        String   @id @default(cuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id])
  
  // Valores
  clientAmount Float       // O que cliente paga (R$ 180,00)
  cleanerAmount Float      // O que faxineira recebe (R$ 150,00)
  platformFee Float        // O que plataforma fica (R$ 30,00)
  stripeFee Float          // Taxa de processamento
  
  // Métodos
  clientPaymentMethod String // "card", "pix", "boleto"
  cleanerPaymentMethod String // "pix", "bankTransfer"
  
  // Status
  status String @default("pending") // pending, succeeded, failed, refunded
  
  // Referências
  stripePaymentId String?
  mercadopagoPaymentId String?
  pixTransactionId String?
  bankTransferId String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([bookingId])
  @@index([status])
}
```

---

## 🔄 Fluxo Completo Resumido

```
┌─────────────────────────────────────────────────────────┐
│ 1. FAXINEIRA SE REGISTRA                               │
├─────────────────────────────────────────────────────────┤
│ • CPF, Idade, Região                                    │
│ • Foto de perfil                                        │
│ • PIX: 51980303740@example.com                         │
│   OU Banco: 001, CC, 12345678-9                        │
│ • Valor por hora: R$ 75,00                             │
└────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. CLIENTE AGENDA                                       │
├─────────────────────────────────────────────────────────┤
│ • 25/01/2026, 10:00-12:00 (2 horas)                   │
│ • Preço calculado: 2 × R$ 75 = R$ 150,00             │
│ • Com markup 20%: R$ 180,00 (final)                    │
└────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CLIENTE PAGA (via Stripe)                           │
├─────────────────────────────────────────────────────────┤
│ • Cartão de crédito: R$ 180,00                         │
│ • Stripe cobra 2,99%: -R$ 5,40                         │
│ • Entra na conta da plataforma: R$ 174,60              │
└────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. PAGAMENTO À FAXINEIRA (Automático em 1s)            │
├─────────────────────────────────────────────────────────┤
│ • Plataforma transfere via PIX: R$ 150,00              │
│ • Para: 51980303740@example.com                        │
│ • Status: ✅ Faxineira Recebe (instantâneo)            │
└────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PLATAFORMA RETÉM                                     │
├─────────────────────────────────────────────────────────┤
│ • Markup faxineira: R$ 30,00                           │
│ • Menos taxa Stripe: -R$ 5,40                          │
│ • Líquido plataforma: R$ 24,60                         │
└────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. SERVIÇO REALIZADO                                    │
├─────────────────────────────────────────────────────────┤
│ • Faxineira vai e faz limpeza                          │
│ • Cliente marca como concluído                         │
│ • Faxineira recebe avaliação                           │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Implementação Mínima

**Etapa 1:** Adicionar campos bancários ao registro (já feito ✅)

**Etapa 2:** Atualizar banco de dados
```bash
cd backend
npx prisma migrate dev --name add_bank_details
```

**Etapa 3:** Criar endpoint de transferência
```javascript
// backend/src/routes/payments.js
POST /payments/transfer
```

**Etapa 4:** Integrar com Stripe/MercadoPago para transferências

**Etapa 5:** Testes manuais

---

## ⚠️ Considerações Importantes

1. **PIX é instantâneo** ✅ Faxineira recebe em 1-2 segundos
2. **Transferência bancária demora** ⏳ Até 24 horas (conforme banco)
3. **Não armazenar dados sensíveis** 🔒 Usar Stripe/MercadoPago tokenization
4. **Validação de CPF/CNPJ** ✅ Fazer no backend
5. **Comprovante de pagamento** 📄 Gerar para faxineira

---

**Status:** Pronto para implementar  
**Próxima etapa:** Executar migration e criar endpoints
