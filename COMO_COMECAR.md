# 🚀 COMO COMEÇAR - Setup Guiado

**Data:** 26 de Janeiro de 2026  
**Tempo estimado:** 15 minutos

---

## 📋 Pré-requisitos

- Node.js 14+ instalado
- PostgreSQL 12+ rodando
- Git configurado
- npm ou yarn

---

## ✅ Passo 1: Preparar Banco de Dados

### 1.1 Ter um banco PostgreSQL rodando

```bash
# Se estiver usando Docker (recomendado)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cleaner_db \
  -p 5432:5432 \
  postgres:14

# Ou com docker-compose (se houver arquivo)
docker-compose up -d
```

### 1.2 Verificar .env

```bash
cd backend
cat .env
```

Deve ter algo como:
```
DATABASE_URL="postgresql://user:password@localhost:5432/cleaner_db"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=5000
```

Se não existir, criar:
```bash
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/cleaner_db"' > .env
echo 'JWT_SECRET="your-secret-key"' >> .env
echo 'NODE_ENV="development"' >> .env
echo 'PORT=5000' >> .env
```

---

## ⚙️ Passo 2: Instalar Dependências

```bash
cd /workspaces/1/backend

# Instalar pacotes
npm install

# Ou se usar yarn
yarn install
```

---

## 🗄️ Passo 3: Executar Migrations

```bash
# Criar/atualizar tabelas no banco
npx prisma migrate dev --name add_new_features

# Isso irá:
# 1. Criar tabelas novas (BookingReschedule, UserRating, CleanerPunishment, RegionPreference)
# 2. Atualizar tabelas existentes (Cleaner, User, Booking)
# 3. Gerar cliente Prisma
```

### Se deu erro:

```bash
# Reset banco (cuidado! deleta dados)
npx prisma migrate reset --force

# Ou verificar status
npx prisma migrate status
```

---

## 🔧 Passo 4: Gerar Cliente Prisma

```bash
npx prisma generate
```

---

## ✨ Passo 5: Iniciar Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Ou produção
npm start
```

Você deve ver:
```
🚀 Server running on port 5000
Environment: development
```

---

## 🧪 Passo 6: Testar Endpoints

Em outro terminal:

```bash
# Teste simples
curl http://localhost:5000/health

# Resposta esperada:
# {"status":"Server is running"}
```

### Testar endpoints específicos:

```bash
# 1. Listar todas regiões (público - sem autenticação)
curl http://localhost:5000/api/features/region/list

# 2. Listar ranking global (público - sem autenticação)
curl http://localhost:5000/api/features/ranking/global

# 3. Testar endpoint que requer autenticação (vai dar erro 401)
curl -X POST http://localhost:5000/api/features/reschedule \
  -H "Content-Type: application/json" \
  -d '{}'

# Resposta esperada (erro porque sem token):
# {"error":"No authorization token provided"}
```

---

## 🔌 Passo 7: Usar Postman/Insomnia (Opcional)

Se tiver Postman ou Insomnia, importar collection:

**Criar collection manualmente:**

1. **New Request** → POST
2. **URL:** `http://localhost:5000/api/features/region/list`
3. **Send**

Ou seguir exemplos em:
- `docs/GUIA_RAPIDO_NOVAS_FUNCIONALIDADES.md`
- `DELIVERABLES.md`

---

## 📚 Passo 8: Ver Banco de Dados (Optional)

### Usar Prisma Studio (UI visual)

```bash
npx prisma studio

# Abre em http://localhost:5555
# Você pode visualizar e editar dados
```

### Ou usar psql (linha de comando)

```bash
psql -U user -h localhost -d cleaner_db

# Dentro do psql:
\dt                    # Listar tabelas
\d BookingReschedule   # Ver estrutura da tabela
SELECT * FROM User;    # Ver dados
```

---

## 👨‍💻 Passo 9: Verificar Arquivos Criados

```bash
# Verificar services criados
ls -la backend/src/services/ | grep -E "(reschedule|rating|punishment|region|ranking)"

# Verificar rotas criadas
cat backend/src/routes/features.js | head -20

# Verificar schema atualizado
grep -c "model" backend/prisma/schema.prisma
```

---

## 📖 Passo 10: Ler Documentação

1. **Primeiro:** Leia `RESUMO_EXECUTIVO.md` (5 min)
2. **Depois:** Leia `docs/GUIA_RAPIDO_NOVAS_FUNCIONALIDADES.md` (10 min)
3. **Detalhes:** Leia `docs/NOVAS_FUNCIONALIDADES_2_0.md` se precisar

---

## 🎯 Próximas Atividades

### Implementar Frontend

```bash
cd /workspaces/1/frontend

npm install

# Copiar exemplos de:
# FeatureIntegration.jsx

# Criar componentes em src/components/
```

### Escrever Testes

```bash
cd /workspaces/1/backend

# Instalar Jest
npm install --save-dev jest

# Criar testes em tests/
npm test
```

### Fazer Deploy

```bash
# Ver instruções em:
# docs/GUIA_MIGRACAO_HOSTING.md
```

---

## 🔗 Arquivos Importantes

| Arquivo | O que é | Por que |
|---------|---------|---------|
| `.env` | Variáveis de ambiente | Credenciais do banco |
| `schema.prisma` | Modelos de dados | Estrutura do banco |
| `features.js` | Todas as rotas | API endpoints |
| `rescheduleService.js` | Lógica de reagendamento | Core da funcionalidade |
| `ratingService.js` | Lógica de avaliações | Core da funcionalidade |
| `punishmentService.js` | Lógica de punição | Core da funcionalidade |
| `regionService.js` | Lógica de região | Core da funcionalidade |
| `rankingService.js` | Lógica de ranking | Core da funcionalidade |

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module 'prisma'"
```bash
npm install
```

### Erro: "Connection refused" (banco não está rodando)
```bash
# Verificar se postgres está rodando
psql -U postgres -h localhost

# Se não funcionar, iniciar:
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14
```

### Erro: "Port 5000 already in use"
```bash
# Matar processo na porta 5000
lsof -ti:5000 | xargs kill -9

# Ou usar outra porta
PORT=5001 npm run dev
```

### Erro: "No such file or directory" (.env)
```bash
cd backend
touch .env
# Adicionar variáveis (ver passo 1.2)
```

### Erro em migration
```bash
# Reset banco
npx prisma migrate reset --force

# Ou verificar status
npx prisma db push --force-reset
```

---

## ✅ Checklist de Setup

- [ ] Node.js instalado (`node -v`)
- [ ] PostgreSQL rodando (`psql --version`)
- [ ] `.env` configurado
- [ ] `npm install` executado
- [ ] Migration executada
- [ ] `npm run dev` rodando
- [ ] Testou endpoint (curl)
- [ ] Leu documentação
- [ ] Pronto para implementar frontend

---

## 💡 Dicas

1. **Usar terminal separado** para server (não fechar)
2. **Verificar logs** para erros
3. **Usar Postman** para testar endpoints
4. **Ler documentação** antes de implementar
5. **Fazer commits** frequentes
6. **Criar branch** para cada feature

---

## 🚀 Próximos Comandos

Depois de setup concluído:

```bash
# Ver all endpoints
curl http://localhost:5000/api/features/region/list | jq

# Listar métricas do servidor
curl http://localhost:5000/health | jq

# Entrar em Prisma Studio
npx prisma studio

# Rodar testes (quando implementar)
npm test

# Build para produção
npm run build
```

---

## 📞 Precisa de Ajuda?

1. **Erro no setup:** Veja "Troubleshooting" acima
2. **Dúvida de API:** Leia `docs/GUIA_RAPIDO_NOVAS_FUNCIONALIDADES.md`
3. **Código não funciona:** Verifique `docs/NOVAS_FUNCIONALIDADES_2_0.md`
4. **Não entende estrutura:** Leia `INDICE_DOCUMENTACAO.md`

---

## 🎉 Parabéns!

Você completou o setup. Agora você tem:

✅ Backend rodando  
✅ Banco de dados preparado  
✅ 34 endpoints funcionando  
✅ Documentação completa  
✅ Exemplos de código  

**Próximo passo:** Implementar frontend ou escrever testes!

---

**Tempo total:** ~15 minutos ⏱️  
**Dificuldade:** Fácil 😊  
**Suporte:** Completo 📚

Bora começar! 🚀
