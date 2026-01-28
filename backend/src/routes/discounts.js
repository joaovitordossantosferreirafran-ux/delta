const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get discount by code
router.get('/:code', async (req, res) => {
  try {
    const discount = await prisma.discount.findUnique({
      where: { code: req.params.code.toUpperCase() }
    });

    if (!discount || !discount.active) {
      return res.status(404).json({ error: 'Cupom não encontrado ou inválido' });
    }

    if (discount.validUntil < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return res.status(400).json({ error: 'Cupom já foi totalmente utilizado' });
    }

    res.json({
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minBookingAmount: discount.minBookingAmount
    });
  } catch (error) {
    console.error('Erro ao obter cupom:', error);
    res.status(500).json({ error: 'Erro ao obter cupom' });
  }
});

module.exports = router;
