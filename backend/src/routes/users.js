const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        cpf: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        profilePhoto: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, cpf, address, city, state, postalCode, profilePhoto } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(cpf && { cpf }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(profilePhoto && { profilePhoto })
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    res.status(500).json({ error: 'Erro ao obter notificações' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

module.exports = router;
