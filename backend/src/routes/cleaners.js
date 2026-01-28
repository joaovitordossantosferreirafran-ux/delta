const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all cleaners with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { region, minRating, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    let whereClause = { status: 'active', verified: true };

    if (region) {
      whereClause.region = region;
    }

    const cleaners = await prisma.cleaner.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        photo: true,
        region: true,
        bio: true,
        averageRating: true,
        reviewCount: true,
        totalBookings: true
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { averageRating: 'desc' }
    });

    const total = await prisma.cleaner.count({ where: whereClause });

    res.json({
      cleaners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar faxineiras:', error);
    res.status(500).json({ error: 'Erro ao listar faxineiras' });
  }
});

// Get cleaner by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const cleaner = await prisma.cleaner.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        photo: true,
        region: true,
        bio: true,
        age: true,
        averageRating: true,
        reviewCount: true,
        totalBookings: true,
        schedules: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isAvailable: true
          }
        },
        reviews: {
          take: 5,
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!cleaner) {
      return res.status(404).json({ error: 'Faxineira não encontrada' });
    }

    res.json(cleaner);
  } catch (error) {
    console.error('Erro ao obter faxineira:', error);
    res.status(500).json({ error: 'Erro ao obter faxineira' });
  }
});

// Update cleaner profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Sem permissão para atualizar este perfil' });
    }

    const { bio, photo } = req.body;

    const cleaner = await prisma.cleaner.update({
      where: { id: req.params.id },
      data: {
        ...(bio && { bio }),
        ...(photo && { photo })
      }
    });

    res.json({
      success: true,
      cleaner
    });
  } catch (error) {
    console.error('Erro ao atualizar faxineira:', error);
    res.status(500).json({ error: 'Erro ao atualizar faxineira' });
  }
});

// Update cleaner schedule
router.put('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const { schedule } = req.body; // Array of {dayOfWeek, startTime, endTime}

    const updated = [];
    for (const day of schedule) {
      const result = await prisma.cleanerSchedule.update({
        where: {
          cleanerId_dayOfWeek: {
            cleanerId: req.params.id,
            dayOfWeek: day.dayOfWeek
          }
        },
        data: {
          startTime: day.startTime,
          endTime: day.endTime,
          isAvailable: day.isAvailable ?? true
        }
      });
      updated.push(result);
    }

    res.json({
      success: true,
      schedule: updated
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

module.exports = router;
