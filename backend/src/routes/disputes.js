const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create dispute
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, reason, description, evidence } = req.body;

    if (!bookingId || !reason) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const dispute = await prisma.dispute.create({
      data: {
        bookingId,
        userId: req.user.id,
        cleanerId: booking.cleanerId,
        reason,
        description,
        evidence: evidence || [],
        status: 'open'
      }
    });

    res.status(201).json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Erro ao criar disputa:', error);
    res.status(500).json({ error: 'Erro ao criar disputa' });
  }
});

// Get user disputes
router.get('/user/disputes', authenticateToken, async (req, res) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { cleanerId: req.user.id }
        ]
      },
      include: {
        booking: true,
        user: { select: { name: true } },
        cleaner: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(disputes);
  } catch (error) {
    console.error('Erro ao listar disputas:', error);
    res.status(500).json({ error: 'Erro ao listar disputas' });
  }
});

// Resolve dispute (admin only)
router.put('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { resolution } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date()
      }
    });

    res.json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Erro ao resolver disputa:', error);
    res.status(500).json({ error: 'Erro ao resolver disputa' });
  }
});

module.exports = router;
