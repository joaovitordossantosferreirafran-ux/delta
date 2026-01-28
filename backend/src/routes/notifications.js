const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { cleanerId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Erro ao obter notificações:', error);
    res.status(500).json({ error: 'Erro ao obter notificações' });
  }
});

// Mark as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

module.exports = router;
