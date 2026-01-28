const redis = require('redis');
const logger = require('./logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hora em segundos
  }

  /**
   * Inicializar conexão com Redis
   */
  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis: Máximo de tentativas de reconexão atingido');
              return null;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis: Conectado com sucesso');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis: Desconectado');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      logger.warn('Redis não disponível - operando sem cache:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Obter valor do cache
   */
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error('Erro ao ler do cache:', error);
      return null;
    }
  }

  /**
   * Definir valor no cache
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Erro ao escrever no cache:', error);
      return false;
    }
  }

  /**
   * Deletar chave do cache
   */
  async del(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error('Erro ao deletar do cache:', error);
      return false;
    }
  }

  /**
   * Deletar múltiplas chaves por padrão
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Cache DEL Pattern: ${pattern} (${keys.length} chaves)`);
      }
      return true;
    } catch (error) {
      logger.error('Erro ao deletar padrão do cache:', error);
      return false;
    }
  }

  /**
   * Verificar se chave existe
   */
  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Erro ao verificar existência no cache:', error);
      return false;
    }
  }

  /**
   * Incrementar contador
   */
  async incr(key, ttl = this.defaultTTL) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.incr(key);
      if (value === 1) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Erro ao incrementar no cache:', error);
      return null;
    }
  }

  /**
   * Wrapper para cachear resultado de função
   */
  async wrap(key, fn, ttl = this.defaultTTL) {
    // Tentar obter do cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Executar função e cachear resultado
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Limpar todo o cache (usar com cuidado!)
   */
  async flush() {
    if (!this.isConnected) return false;

    try {
      await this.client.flushDb();
      logger.warn('Cache: Todos os dados foram limpos');
      return true;
    } catch (error) {
      logger.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Desconectar
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis: Desconectado');
    }
  }
}

// Criar instância singleton
const cacheService = new CacheService();

// Chaves de cache padronizadas
const CacheKeys = {
  cleaner: (id) => `cleaner:${id}`,
  cleanerList: (filters) => `cleaners:${JSON.stringify(filters)}`,
  user: (id) => `user:${id}`,
  booking: (id) => `booking:${id}`,
  userBookings: (userId) => `bookings:user:${userId}`,
  cleanerBookings: (cleanerId) => `bookings:cleaner:${cleanerId}`,
  reviews: (cleanerId) => `reviews:cleaner:${cleanerId}`,
  ranking: (region) => `ranking:${region || 'global'}`,
  stats: (type) => `stats:${type}`,
  payment: (id) => `payment:${id}`
};

// TTLs recomendados
const CacheTTL = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  VERY_LONG: 86400 // 24 horas
};

module.exports = {
  cacheService,
  CacheKeys,
  CacheTTL
};
