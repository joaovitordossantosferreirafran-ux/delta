const request = require('supertest');
const app = require('../src/app'); // Assumindo que teremos um app.js separado
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Authentication API', () => {
  beforeAll(async () => {
    // Limpar banco de testes antes de executar
    await prisma.user.deleteMany();
    await prisma.cleaner.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register/user', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@123456',
        name: 'Test User',
        phone: '+5551999999999'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email.toLowerCase());
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro com email inválido', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test@123456',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Email inválido'
          })
        ])
      );
    });

    it('deve retornar erro com senha fraca', async () => {
      const userData = {
        email: 'test2@example.com',
        password: '123456',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro com email duplicado', async () => {
      const userData = {
        email: 'test@example.com', // Mesmo email do primeiro teste
        password: 'Test@123456',
        name: 'Another User'
      };

      const response = await request(app)
        .post('/api/auth/register/user')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('duplicado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test@123456',
        userType: 'user'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email.toLowerCase());
    });

    it('deve retornar erro com senha incorreta', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
        userType: 'user'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro com usuário inexistente', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test@123456',
        userType: 'user'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/validate', () => {
    let validToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123456',
          userType: 'user'
        });
      validToken = loginResponse.body.token;
    });

    it('deve validar token correto', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });

    it('deve retornar erro sem token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Cleaner Registration', () => {
  it('deve registrar uma faxineira com todos os campos obrigatórios', async () => {
    const cleanerData = {
      email: 'cleaner@example.com',
      password: 'Cleaner@123456',
      name: 'Maria Silva',
      phone: '+5551988888888',
      cpf: '12345678901',
      dateOfBirth: '1990-01-15',
      region: 'Porto Alegre - Zona Sul',
      bio: 'Profissional com 10 anos de experiência em limpeza residencial'
    };

    const response = await request(app)
      .post('/api/auth/register/cleaner')
      .send(cleanerData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('cleaner');
    expect(response.body.cleaner.email).toBe(cleanerData.email.toLowerCase());
    expect(response.body.cleaner.age).toBeGreaterThanOrEqual(18);
  });

  it('deve retornar erro com CPF inválido', async () => {
    const cleanerData = {
      email: 'cleaner2@example.com',
      password: 'Cleaner@123456',
      name: 'Maria Silva',
      phone: '+5551988888888',
      cpf: '123', // CPF inválido
      dateOfBirth: '1990-01-15',
      region: 'Porto Alegre'
    };

    const response = await request(app)
      .post('/api/auth/register/cleaner')
      .send(cleanerData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('deve retornar erro com idade menor que 18 anos', async () => {
    const cleanerData = {
      email: 'cleaner3@example.com',
      password: 'Cleaner@123456',
      name: 'Maria Silva',
      phone: '+5551988888888',
      cpf: '98765432101',
      dateOfBirth: '2010-01-15', // Menor de idade
      region: 'Porto Alegre'
    };

    const response = await request(app)
      .post('/api/auth/register/cleaner')
      .send(cleanerData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
