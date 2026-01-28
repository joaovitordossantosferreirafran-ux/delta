const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Criar cliente Redis (opcional - fallback para memória se Redis não estiver disponível)
let redisClient;
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 5000
    }
  });

  redisClient.on('error', (err) => {
    console.warn('Redis Client Error (usando fallback em memória):', err.message);
  });

  redisClient.connect().catch(() => {
    console.warn('Redis não disponível - usando rate limiting em memória');
  });
} catch (error) {
  console.warn('Redis não configurado - usando rate limiting em memória');
}

// Rate limiter geral para API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar Redis se disponível
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:general:'
    })
  })
});

// Rate limiter estrito para autenticação (prevenir brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas de login
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.'
  },
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  standardHeaders: true,
  legacyHeaders: false,
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:auth:'
    })
  })
});

// Rate limiter para criação de recursos (prevenir spam)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Limite de 10 criações por hora
  message: {
    error: 'Muitas criações em pouco tempo. Por favor, aguarde antes de criar mais recursos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:create:'
    })
  })
});

// Rate limiter para uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Limite de 20 uploads por hora
  message: {
    error: 'Muitos uploads em pouco tempo. Por favor, aguarde antes de fazer mais uploads.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:upload:'
    })
  })
});

// Rate limiter para pagamentos (extra proteção)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Limite de 3 tentativas de pagamento por hora
  message: {
    error: 'Muitas tentativas de pagamento. Por favor, aguarde antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(redisClient && {
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:payment:'
    })
  })
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  uploadLimiter,
  paymentLimiter,
  redisClient
};
