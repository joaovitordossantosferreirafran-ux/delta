const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const geoService = require('../services/geoService');

const prisma = new PrismaClient();

// Create booking
router.post('/', authenticateToken, authorizeRole(['user']), async (req, res) => {
  try {
    const {
      cleanerId,
      date,
      startTime,
      endTime,
      address,
      city,
      serviceType,
      notes,
      estimatedPrice
    } = req.body;

    // Validate input
    if (!cleanerId || !date || !startTime || !endTime || !address || !city) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    // Geocode address
    const geoData = await geoService.geocodeAddress(address, city);

    // Check cleaner availability
    const cleaner = await prisma.cleaner.findUnique({
      where: { id: cleanerId },
      select: { id: true, name: true, email: true, phone: true }
    });

    if (!cleaner) {
      return res.status(404).json({ error: 'Faxineira não encontrada' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        cleanerId,
        date: new Date(date),
        startTime,
        endTime,
        address,
        city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        serviceType,
        notes,
        estimatedPrice,
        duration: calculateDuration(startTime, endTime),
        status: 'confirmed',
        paymentStatus: 'pending'
      }
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, email: true, phone: true }
    });

    // Send notifications
    try {
      await emailService.sendBookingConfirmation(user.email, {
        userName: user.name,
        cleanerName: cleaner.name,
        date: new Date(date).toLocaleDateString('pt-BR'),
        startTime,
        endTime,
        address,
        price: estimatedPrice,
        bookingId: booking.id
      });

      await whatsappService.sendBookingNotification(user.phone, {
        userName: user.name,
        cleanerName: cleaner.name,
        date: new Date(date).toLocaleDateString('pt-BR'),
        startTime,
        address,
        price: estimatedPrice
      });
    } catch (notificationError) {
      console.warn('Erro ao enviar notificações:', notificationError);
      // Don't fail the booking if notifications fail
    }

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Get user bookings
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: req.params.userId },
      include: {
        cleaner: {
          select: { id: true, name: true, photo: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

// Get cleaner bookings
router.get('/cleaner/:cleanerId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.cleanerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const bookings = await prisma.booking.findMany({
      where: { cleanerId: req.params.cleanerId },
      include: {
        user: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    });

    res.json({
      success: true,
      booking: updated
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour - startHour) * 60 + (endMin - startMin);
}

module.exports = router;
