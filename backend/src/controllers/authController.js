const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthController {
  async registerUser(req, res) {
    try {
      const { email, password, name, phone } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password e name são obrigatórios' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone
        }
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async registerCleaner(req, res) {
    try {
      const { email, password, name, phone, cpf, dateOfBirth, age, region, bio } = req.body;

      // Validate input
      if (!email || !password || !name || !cpf || !dateOfBirth || !age || !region) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      // Check if cleaner exists
      const existingCleaner = await prisma.cleaner.findFirst({
        where: { OR: [{ email }, { cpf }] }
      });
      if (existingCleaner) {
        return res.status(400).json({ error: 'Email ou CPF já cadastrado' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create cleaner
      const cleaner = await prisma.cleaner.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          cpf,
          dateOfBirth: new Date(dateOfBirth),
          age,
          region,
          bio,
          status: 'active'
        }
      });

      // Create default schedule
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (const day of daysOfWeek) {
        await prisma.cleanerSchedule.create({
          data: {
            cleanerId: cleaner.id,
            dayOfWeek: day,
            startTime: '08:00',
            endTime: '18:00',
            isAvailable: true
          }
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: cleaner.id, email: cleaner.email, role: 'cleaner' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(201).json({
        success: true,
        token,
        cleaner: {
          id: cleaner.id,
          email: cleaner.email,
          name: cleaner.name,
          region: cleaner.region,
          verified: cleaner.verified
        }
      });
    } catch (error) {
      console.error('Erro ao registrar faxineira:', error);
      res.status(500).json({ error: 'Erro ao registrar faxineira' });
    }
  }

  async login(req, res) {
    try {
      const { email, password, userType } = req.body; // userType: 'user' ou 'cleaner'

      if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Email, password e userType são obrigatórios' });
      }

      let account;
      let role;

      if (userType === 'cleaner') {
        account = await prisma.cleaner.findUnique({ where: { email } });
        role = 'cleaner';
      } else {
        account = await prisma.user.findUnique({ where: { email } });
        role = 'user';
      }

      if (!account) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, account.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Generate token
      const token = jwt.sign(
        { id: account.id, email: account.email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: account.id,
          email: account.email,
          name: account.name,
          role
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async validateToken(req, res) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  }
}

module.exports = new AuthController();
