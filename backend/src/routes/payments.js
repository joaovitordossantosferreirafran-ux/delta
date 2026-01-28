const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get payment methods
router.get('/methods', authenticateToken, async (req, res) => {
  try {
    const methods = await paymentService.getPaymentMethods();
    res.json(methods);
  } catch (error) {
    console.error('Erro ao listar métodos de pagamento:', error);
    res.status(500).json({ error: 'Erro ao listar métodos' });
  }
});

// Create Stripe payment intent
router.post('/stripe/intent', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const result = await paymentService.createStripePaymentIntent(amount, 'brl', {
      bookingId,
      userId: req.user.id
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao criar Stripe intent:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const isSuccessful = await paymentService.confirmStripePayment(paymentIntentId);

    if (!isSuccessful) {
      return res.status(400).json({ error: 'Pagamento não foi confirmado' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: 0, // Will be updated
        method: 'card',
        paymentGateway: 'stripe',
        transactionId: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        status: 'completed'
      }
    });

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'completed' }
    });

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento Stripe:', error);
    res.status(500).json({ error: 'Erro ao confirmar pagamento' });
  }
});

// Create MercadoPago preference
router.post('/mercadopago/preference', authenticateToken, async (req, res) => {
  try {
    const { bookingId, amount, email, userName } = req.body;

    const result = await paymentService.createMercadopagoPreference({
      bookingId,
      amount,
      email,
      userName,
      serviceType: 'Limpeza',
      date: new Date().toLocaleDateString('pt-BR')
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao criar preferência MercadoPago:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// Webhook for MercadoPago
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Update payment status in your database
      const payment = await prisma.payment.findFirst({
        where: { mercadopagoPaymentId: paymentId }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'completed' }
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'completed' }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook MercadoPago:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

module.exports = router;
