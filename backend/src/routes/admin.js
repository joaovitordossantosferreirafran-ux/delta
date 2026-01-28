const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get dashboard stats (admin only)
router.get('/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const [totalUsers, totalCleaners, totalBookings, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.cleaner.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCleaners,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Erro ao obter stats:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        cleaner: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Erro ao listar bookings:', error);
    res.status(500).json({ error: 'Erro ao listar bookings' });
  }
});

// Verify cleaner (admin only)
router.put('/cleaners/:id/verify', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const cleaner = await prisma.cleaner.update({
      where: { id: req.params.id },
      data: { verified: true }
    });

    res.json({
      success: true,
      cleaner
    });
  } catch (error) {
    console.error('Erro ao verificar faxineira:', error);
    res.status(500).json({ error: 'Erro ao verificar faxineira' });
  }
});

// Suspend/unsuspend user (admin only)
router.put('/users/:id/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// Export data as CSV
router.get('/export/bookings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        cleaner: { select: { name: true } }
      }
    });

    let csv = 'ID,Data,Cliente,Email,Faxineira,Endereço,Status,Valor\n';
    bookings.forEach(b => {
      csv += `${b.id},${b.date},${b.user.name},${b.user.email},${b.cleaner.name},${b.address},${b.status},${b.estimatedPrice}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

module.exports = router;
