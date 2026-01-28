const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para processar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validações para autenticação
 */
const validateRegister = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter: maiúscula, minúscula, número e caractere especial'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Telefone inválido (use formato internacional: +5551999999999)'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  body('userType')
    .isIn(['user', 'cleaner', 'admin'])
    .withMessage('Tipo de usuário inválido'),
  handleValidationErrors
];

/**
 * Validações para faxineiras
 */
const validateCleanerRegister = [
  ...validateRegister,
  body('cpf')
    .trim()
    .matches(/^\d{11}$/)
    .withMessage('CPF deve conter 11 dígitos'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Data de nascimento inválida')
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / 31557600000);
      if (age < 18) throw new Error('Deve ter no mínimo 18 anos');
      if (age > 100) throw new Error('Idade inválida');
      return true;
    }),
  body('region')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Região é obrigatória'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Biografia deve ter no máximo 500 caracteres'),
  handleValidationErrors
];

/**
 * Validações para agendamentos
 */
const validateBooking = [
  body('cleanerId')
    .trim()
    .notEmpty()
    .withMessage('ID da faxineira é obrigatório')
    .isLength({ min: 20, max: 30 })
    .withMessage('ID da faxineira inválido'),
  body('date')
    .isISO8601()
    .withMessage('Data inválida')
    .custom((value) => {
      const bookingDate = new Date(value);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3); // Máximo 3 meses no futuro

      if (bookingDate < now) {
        throw new Error('Data não pode ser no passado');
      }
      if (bookingDate > maxDate) {
        throw new Error('Data não pode ser mais de 3 meses no futuro');
      }
      return true;
    }),
  body('timeSlot')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Horário inválido (use formato HH:MM)'),
  body('serviceType')
    .isIn(['basic', 'deep', 'moving', 'commercial', 'custom'])
    .withMessage('Tipo de serviço inválido'),
  body('duration')
    .isInt({ min: 1, max: 24 })
    .withMessage('Duração deve ser entre 1 e 24 horas'),
  body('price')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Preço deve ser entre R$ 0,01 e R$ 10.000'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Endereço deve ter entre 10 e 200 caracteres'),
  handleValidationErrors
];

/**
 * Validações para avaliações
 */
const validateReview = [
  body('bookingId')
    .trim()
    .notEmpty()
    .withMessage('ID do agendamento é obrigatório'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Avaliação deve ser entre 1 e 5 estrelas'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comentário deve ter no máximo 1000 caracteres')
    .custom((value) => {
      // Prevenir spam e conteúdo ofensivo
      const bannedWords = ['spam', 'scam', 'fake']; // Expandir lista conforme necessário
      const lowerValue = value.toLowerCase();
      for (const word of bannedWords) {
        if (lowerValue.includes(word)) {
          throw new Error('Comentário contém palavras não permitidas');
        }
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Validações para pagamentos
 */
const validatePayment = [
  body('bookingId')
    .trim()
    .notEmpty()
    .withMessage('ID do agendamento é obrigatório'),
  body('method')
    .isIn(['stripe', 'mercadopago', 'pix', 'credit_card', 'debit_card'])
    .withMessage('Método de pagamento inválido'),
  body('amount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Valor deve ser entre R$ 0,01 e R$ 10.000'),
  handleValidationErrors
];

/**
 * Validações para disputas
 */
const validateDispute = [
  body('bookingId')
    .trim()
    .notEmpty()
    .withMessage('ID do agendamento é obrigatório'),
  body('reason')
    .isIn(['no_show', 'poor_quality', 'damage', 'overcharge', 'other'])
    .withMessage('Motivo da disputa inválido'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Descrição deve ter entre 20 e 2000 caracteres'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidências devem ser um array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Máximo de 10 arquivos de evidência');
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Validações para cupons
 */
const validateCoupon = [
  body('code')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z0-9]{4,20}$/)
    .withMessage('Código do cupom inválido (use 4-20 caracteres alfanuméricos)'),
  body('discount')
    .isFloat({ min: 0.01, max: 100 })
    .withMessage('Desconto deve ser entre 0,01 e 100'),
  body('type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Tipo de desconto inválido'),
  body('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Máximo de usos deve ser pelo menos 1'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Data de expiração inválida')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Data de expiração não pode ser no passado');
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Validações para parâmetros de URL
 */
const validateId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('ID é obrigatório')
    .isLength({ min: 20, max: 30 })
    .withMessage('ID inválido'),
  handleValidationErrors
];

/**
 * Validações para queries de busca
 */
const validateSearch = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página deve ser entre 1 e 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('sort')
    .optional()
    .isIn(['asc', 'desc', 'rating', 'price', 'distance', 'popularity'])
    .withMessage('Ordenação inválida'),
  handleValidationErrors
];

/**
 * Sanitização de entrada (prevenir XSS)
 */
const sanitizeInput = (req, res, next) => {
  // Remover tags HTML de todos os campos de texto
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateCleanerRegister,
  validateBooking,
  validateReview,
  validatePayment,
  validateDispute,
  validateCoupon,
  validateId,
  validateSearch,
  sanitizeInput
};
