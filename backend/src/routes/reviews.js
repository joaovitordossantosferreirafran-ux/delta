const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, cleanerId, rating, comment, punctuality, professionalism, quality } = req.body;

    if (!bookingId || !cleanerId || !rating) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve estar entre 1 e 5' });
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({ where: { bookingId } });
    if (existingReview) {
      return res.status(400).json({ error: 'Avaliação já foi feita para este agendamento' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        cleanerId,
        bookingId,
        rating,
        comment,
        punctuality,
        professionalism,
        quality
      }
    });

    // Update cleaner rating
    const reviews = await prisma.review.findMany({
      where: { cleanerId }
    });

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.cleaner.update({
      where: { id: cleanerId },
      data: {
        averageRating,
        reviewCount: reviews.length
      }
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
});

// Get reviews for cleaner
router.get('/cleaner/:cleanerId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { cleanerId: req.params.cleanerId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Erro ao obter avaliações:', error);
    res.status(500).json({ error: 'Erro ao obter avaliações' });
  }
});

module.exports = router;
