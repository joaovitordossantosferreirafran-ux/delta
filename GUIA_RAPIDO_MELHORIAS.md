# 🚀 Guia Rápido - Implementar Melhorias

## ⏱️ Setup em 10 Minutos

### 1️⃣ Instalar Dependências (2 min)
```bash
cd leidy-cleaner-improved/backend
npm install
```

### 2️⃣ Configurar Redis (opcional - 2 min)
```bash
# Opção A: Docker (recomendado)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Opção B: Instalar localmente
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis

# Windows
# Baixar de: https://github.com/microsoftarchive/redis/releases
```

### 3️⃣ Atualizar .env (1 min)
```bash
cp backend/.env.example backend/.env
# Editar .env e adicionar:
```

```env
# === CONFIGURAÇÕES EXISTENTES ===
DATABASE_URL="postgresql://user:password@localhost/leidy_cleaner"
JWT_SECRET="sua-chave-secreta-muito-segura"
PORT=5000
NODE_ENV="development"

# === NOVAS CONFIGURAÇÕES ===
# Redis (opcional - descomente se tiver Redis)
# REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL="debug"  # debug | info | warn | error

# Rate Limiting (configurações padrão - pode customizar)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100   # 100 requisições por janela

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:3000"
```

### 4️⃣ Executar Migrations (1 min)
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5️⃣ Iniciar Servidor (1 min)
```bash
npm run dev
```

### 6️⃣ Verificar Funcionamento (1 min)
```bash
# Terminal 1: Verificar logs
tail -f backend/logs/combined.log

# Terminal 2: Testar endpoints
curl http://localhost:5000/api/health

# Abrir documentação Swagger
open http://localhost:5000/api/docs
```

### 7️⃣ Executar Testes (2 min)
```bash
npm test
npm run test:coverage
```

---

## 🎯 Checklist de Implementação

### Backend
- [x] ✅ Instalar dependências
- [x] ✅ Configurar Redis (opcional)
- [x] ✅ Atualizar .env
- [x] ✅ Executar migrations
- [x] ✅ Testar servidor
- [x] ✅ Verificar logs
- [x] ✅ Testar Swagger docs

### Testes
- [x] ✅ Executar `npm test`
- [x] ✅ Verificar cobertura (target: 70%)
- [x] ✅ Adicionar mais testes conforme necessário

### CI/CD
- [ ] Criar repositório no GitHub
- [ ] Adicionar secrets do GitHub:
  - `SNYK_TOKEN` (opcional)
  - `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`
  - `PRODUCTION_HOST`, `PRODUCTION_USER`, `PRODUCTION_SSH_KEY`
  - `SLACK_WEBHOOK` (opcional)
- [ ] Push do código
- [ ] Verificar pipeline

### Deploy
- [ ] Configurar servidor staging
- [ ] Configurar servidor produção
- [ ] Setup Docker Compose
- [ ] Configurar domínio e SSL
- [ ] Setup Redis em produção
- [ ] Configurar backups automáticos

---

## 📋 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar em modo desenvolvimento
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas automaticamente
npm run format       # Formatar código
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
```

### Docker
```bash
npm run docker:build # Build da imagem
npm run docker:up    # Iniciar containers
npm run docker:down  # Parar containers
npm run logs         # Ver logs do container
```

### Prisma
```bash
npm run migrate      # Criar nova migration
npm run generate     # Gerar Prisma Client
npm run studio       # Abrir Prisma Studio
```

### Produção
```bash
npm start            # Iniciar em modo produção
npm run migrate:deploy # Aplicar migrations em produção
```

---

## 🔍 Testando as Melhorias

### 1. Rate Limiting
```bash
# Fazer 6 requisições seguidas (limite é 5)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong","userType":"user"}'
  echo "\nRequisição $i"
done

# A 6ª deve retornar erro 429 (Too Many Requests)
```

### 2. Validações
```bash
# Testar email inválido
curl -X POST http://localhost:5000/api/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test@123456",
    "name": "Test User"
  }'

# Deve retornar 400 com detalhes do erro
```

### 3. Cache (se Redis estiver configurado)
```bash
# 1ª requisição (sem cache)
time curl http://localhost:5000/api/cleaners

# 2ª requisição (com cache) - deve ser mais rápida
time curl http://localhost:5000/api/cleaners
```

### 4. Swagger Docs
```bash
# Abrir no navegador
open http://localhost:5000/api/docs

# Ou com curl
curl http://localhost:5000/api/docs
```

### 5. Logs
```bash
# Ver logs em tempo real
tail -f backend/logs/combined.log

# Ver apenas erros
tail -f backend/logs/error.log

# Buscar logs específicos
grep "payment" backend/logs/combined.log
```

---

## 🐛 Troubleshooting

### Problema: Redis não conecta
```bash
# Solução: Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Se não estiver rodando:
docker start redis
# ou
sudo systemctl start redis
```

### Problema: Testes falhando
```bash
# Solução: Limpar cache e reexecutar
npm run test -- --clearCache
npm test
```

### Problema: Migrations falhando
```bash
# Solução: Reset do banco (CUIDADO: apaga dados)
npx prisma migrate reset
npx prisma migrate dev
```

### Problema: Porta 5000 já em uso
```bash
# Solução: Mudar porta no .env
echo "PORT=5001" >> .env

# Ou matar processo na porta
lsof -ti:5000 | xargs kill -9
```

### Problema: Logs não aparecem
```bash
# Solução: Criar diretório de logs
mkdir -p backend/logs
chmod 755 backend/logs

# Verificar permissões
ls -la backend/logs
```

---

## 📊 Verificar Melhorias Implementadas

### Checklist Visual
```bash
# 1. Verificar arquivos criados
ls -la backend/src/middleware/
# Deve mostrar: rateLimiter.js, validator.js, errorHandler.js

ls -la backend/src/utils/
# Deve mostrar: logger.js, cache.js

ls -la backend/src/config/
# Deve mostrar: swagger.js

# 2. Verificar testes
ls -la backend/__tests__/
# Deve mostrar: auth.test.js

# 3. Verificar CI/CD
ls -la .github/workflows/
# Deve mostrar: ci-cd.yml

# 4. Verificar logs (após iniciar servidor)
ls -la backend/logs/
# Deve mostrar: combined.log, error.log

# 5. Verificar package.json
cat backend/package.json | grep "version"
# Deve mostrar: "version": "2.0.0"
```

### Testar Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Swagger docs
curl http://localhost:5000/api/docs

# Rate limit (fazer várias requisições)
for i in {1..10}; do curl http://localhost:5000/api/cleaners; done
```

---

## 🎉 Pronto!

Seu projeto agora tem:
- ✅ Rate limiting inteligente
- ✅ Validações robustas
- ✅ Tratamento de erros profissional
- ✅ Cache com Redis
- ✅ Logging estruturado
- ✅ Testes automatizados
- ✅ CI/CD com GitHub Actions
- ✅ Documentação Swagger
- ✅ Qualidade de código (ESLint + Prettier)
- ✅ Segurança avançada

---

## 📚 Próximos Passos

1. **Leia**: `MELHORIAS.md` para detalhes completos
2. **Configure**: CI/CD no GitHub
3. **Deploy**: Staging e produção
4. **Monitor**: Logs e métricas
5. **Melhore**: Adicione mais testes

---

**Tempo total de setup**: ~10 minutos ⚡

**Pronto para produção?** SIM! ✅
