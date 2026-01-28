const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leidy Cleaner API',
      version: '2.0.0',
      description: 'API completa para plataforma de agendamento de limpeza',
      contact: {
        name: 'Suporte Leidy Cleaner',
        email: 'suporte@leidycleaner.com',
        url: 'https://leidycleaner.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api-staging.leidycleaner.com',
        description: 'Servidor de Staging'
      },
      {
        url: 'https://api.leidycleaner.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no endpoint /api/auth/login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            details: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Detalhes adicionais do erro'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            path: {
              type: 'string'
            }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            phone: {
              type: 'string',
              description: 'Telefone no formato internacional'
            },
            cpf: {
              type: 'string',
              pattern: '^\\d{11}$',
              description: 'CPF (11 dígitos)'
            },
            address: {
              type: 'string',
              description: 'Endereço completo'
            },
            city: {
              type: 'string',
              description: 'Cidade'
            },
            state: {
              type: 'string',
              description: 'Estado (UF)'
            },
            profilePhoto: {
              type: 'string',
              format: 'url',
              description: 'URL da foto de perfil'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Cleaner: {
          type: 'object',
          required: ['email', 'password', 'name', 'phone', 'cpf', 'dateOfBirth', 'region'],
          properties: {
            id: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            name: {
              type: 'string'
            },
            phone: {
              type: 'string'
            },
            cpf: {
              type: 'string',
              pattern: '^\\d{11}$'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date'
            },
            age: {
              type: 'integer',
              minimum: 18,
              maximum: 100
            },
            region: {
              type: 'string',
              description: 'Região de atuação'
            },
            bio: {
              type: 'string',
              maxLength: 500
            },
            photo: {
              type: 'string',
              format: 'url'
            },
            averageRating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5
            },
            reviewCount: {
              type: 'integer'
            },
            totalBookings: {
              type: 'integer'
            },
            agilityScore: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 10,
              description: 'Score de agilidade (0-10)'
            },
            reputationPoints: {
              type: 'integer',
              description: 'Pontos de reputação (começa com 100)'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'verified']
            },
            verified: {
              type: 'boolean'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['cleanerId', 'date', 'timeSlot', 'serviceType', 'duration', 'price', 'address'],
          properties: {
            id: {
              type: 'string'
            },
            userId: {
              type: 'string'
            },
            cleanerId: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            timeSlot: {
              type: 'string',
              pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
              example: '14:00'
            },
            serviceType: {
              type: 'string',
              enum: ['basic', 'deep', 'moving', 'commercial', 'custom']
            },
            duration: {
              type: 'integer',
              minimum: 1,
              maximum: 24,
              description: 'Duração em horas'
            },
            price: {
              type: 'number',
              format: 'float',
              minimum: 0.01,
              maximum: 10000
            },
            address: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'refunded', 'failed']
            }
          }
        },
        Review: {
          type: 'object',
          required: ['bookingId', 'rating'],
          properties: {
            id: {
              type: 'string'
            },
            bookingId: {
              type: 'string'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Avaliação de 1 a 5 estrelas'
            },
            comment: {
              type: 'string',
              maxLength: 1000
            },
            flagged: {
              type: 'boolean',
              description: 'Se a avaliação foi reportada como abusiva'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de autenticação ausente ou inválido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Token inválido ou expirado',
                timestamp: '2026-01-27T10:30:00Z',
                path: '/api/bookings'
              }
            }
          }
        },
        ValidationError: {
          description: 'Dados de entrada inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Dados inválidos',
                details: [
                  {
                    field: 'email',
                    message: 'Email inválido'
                  }
                ]
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Recurso não encontrado',
                message: 'O recurso solicitado não existe'
              }
            }
          }
        },
        RateLimitError: {
          description: 'Limite de requisições excedido',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Muitas requisições',
                message: 'Por favor, aguarde antes de tentar novamente'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints de login, registro e validação de tokens'
      },
      {
        name: 'Usuários',
        description: 'Gerenciamento de usuários (clientes)'
      },
      {
        name: 'Faxineiras',
        description: 'Listagem e gerenciamento de faxineiras'
      },
      {
        name: 'Agendamentos',
        description: 'Criação e gerenciamento de agendamentos'
      },
      {
        name: 'Pagamentos',
        description: 'Processamento de pagamentos (Stripe, MercadoPago)'
      },
      {
        name: 'Avaliações',
        description: 'Sistema de avaliações mútuas'
      },
      {
        name: 'Admin',
        description: 'Endpoints administrativos'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
