const winston = require('winston');
const path = require('path');

// Definir formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Criar transportes
const transports = [];

// Console (sempre ativo)
transports.push(
  new winston.transports.Console({
    format: consoleFormat
  })
);

// Arquivos de log (produção)
if (process.env.NODE_ENV === 'production') {
  // Log de erros
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Log combinado
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  // Não sair em caso de erro
  exitOnError: false
});

// Stream para Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Adicionar métodos de contexto
logger.logWithContext = (level, message, context = {}) => {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Métodos específicos para diferentes tipos de eventos
logger.logRequest = (req, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
    duration: `${duration}ms`
  });
};

logger.logAuth = (event, userId, metadata = {}) => {
  logger.info('Auth Event', {
    event,
    userId,
    ...metadata
  });
};

logger.logPayment = (event, bookingId, amount, metadata = {}) => {
  logger.info('Payment Event', {
    event,
    bookingId,
    amount,
    ...metadata
  });
};

logger.logSecurity = (event, metadata = {}) => {
  logger.warn('Security Event', {
    event,
    ...metadata
  });
};

// Garantir que o diretório de logs existe
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

module.exports = logger;
