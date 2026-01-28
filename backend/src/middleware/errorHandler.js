const logger = require('../utils/logger');

/**
 * Classe personalizada para erros da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Erros operacionais esperados
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      timestamp: err.timestamp,
      path: req.originalUrl
    });
  }

  // Erros do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Registro duplicado',
      field: err.meta?.target?.[0] || 'unknown',
      message: `${err.meta?.target?.[0] || 'Este campo'} já está em uso`
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado',
      message: 'O recurso solicitado não existe'
    });
  }

  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Erro no banco de dados',
      message: 'Ocorreu um erro ao processar sua requisição'
    });
  }

  // Erros de validação do JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'O token de autenticação fornecido é inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'Sua sessão expirou. Faça login novamente'
    });
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'O corpo da requisição contém JSON mal formatado'
    });
  }

  // Erros do Multer (upload de arquivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande',
        message: 'O arquivo enviado excede o tamanho máximo permitido'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Muitos arquivos',
        message: 'Você enviou mais arquivos do que o permitido'
      });
    }
    return res.status(400).json({
      error: 'Erro no upload',
      message: 'Ocorreu um erro ao fazer upload do arquivo'
    });
  }

  // Erros de integração externa (Stripe, SendGrid, etc)
  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({
      error: 'Erro no pagamento',
      message: 'Não foi possível processar o pagamento. Verifique os dados do cartão'
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    logger.error('External service unavailable:', err);
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível',
      message: 'Não foi possível conectar a um serviço externo. Tente novamente em alguns instantes'
    });
  }

  // Erro genérico não tratado
  // Em produção, não expor detalhes internos
  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: isDevelopment
      ? err.message
      : 'Ocorreu um erro inesperado. Nossa equipe foi notificada',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * Middleware para rota não encontrada (404)
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route not found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register/user',
      'POST /api/auth/register/cleaner',
      'GET /api/cleaners',
      'POST /api/bookings',
      'GET /api/docs'
    ]
  });
};

/**
 * Wrapper para funções assíncronas (evita try-catch repetitivo)
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar tipos de conteúdo
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      return next(new AppError('Content-Type header é obrigatório', 400));
    }

    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return next(new AppError('Content-Type deve ser application/json ou multipart/form-data', 415));
    }
  }
  next();
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateContentType
};
