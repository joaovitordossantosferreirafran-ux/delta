const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const { checkAndAwardBonus, transferBonus, getBonusHistory, getTotalBonusEarned } = require('../services/bonusService');

const prisma = new PrismaClient();

/**
 * POST /api/bonuses/:cleanerId/check
 * Verifica se faxineira completou 10★ seguidas e concede bônus
 */
router.post('/:cleanerId/check', authMiddleware, async (req, res) => {
  try {
    const bonus = await checkAndAwardBonus(req.params.cleanerId);
    
    if (bonus) {
      res.json({ 
        success: true,
        message: 'Parabéns! Você ganhou R$ 100 de bônus! 🎉',
        bonus: {
          id: bonus.id,
          amount: bonus.amount,
          reason: bonus.reason,
          status: bonus.status
        }
      });
    } else {
      res.json({ 
        success: false,
        message: 'Sem bônus disponível no momento'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao verificar bônus' 
    });
  }
});

/**
 * GET /api/bonuses/:cleanerId/history
 * Retorna histórico de bônus da faxineira
 */
router.get('/:cleanerId/history', authMiddleware, async (req, res) => {
  try {
    const history = await getBonusHistory(req.params.cleanerId);
    
    res.json({
      success: true,
      bonuses: history.map(b => ({
        id: b.id,
        amount: b.amount,
        reason: b.reason,
        status: b.status,
        earnedAt: b.createdAt,
        transferredAt: b.transferredAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar histórico de bônus' 
    });
  }
});

/**
 * GET /api/bonuses/:cleanerId/total
 * Retorna total de bônus ganho (somando só transferências bem-sucedidas)
 */
router.get('/:cleanerId/total', authMiddleware, async (req, res) => {
  try {
    const total = await getTotalBonusEarned(req.params.cleanerId);
    
    res.json({
      success: true,
      totalEarned: total,
      formattedTotal: `R$ ${(total).toFixed(2).replace('.', ',')}`
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao calcular total de bônus' 
    });
  }
});

/**
 * POST /api/bonuses/:bonusId/transfer
 * Transfere bônus pendente para PIX da faxineira
 */
router.post('/:bonusId/transfer', authMiddleware, async (req, res) => {
  try {
    const success = await transferBonus(req.params.bonusId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Bônus transferido com sucesso via PIX! ✅'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Não foi possível transferir o bônus'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao transferir bônus' 
    });
  }
});

/**
 * GET /api/bonuses/cleaner/:cleanerId/badge
 * Retorna informações de badge TOP CLEANER
 */
router.get('/cleaner/:cleanerId/badge', async (req, res) => {
  try {
    const cleaner = await prisma.cleaner.findUnique({
      where: { id: req.params.cleanerId },
      select: {
        topCleanerBadge: true,
        topCleanerUntil: true,
        totalBonusEarned: true,
        lastBonusDate: true
      }
    });

    if (!cleaner) {
      return res.status(404).json({ error: 'Faxineira não encontrada' });
    }

    res.json({
      success: true,
      badge: {
        active: cleaner.topCleanerBadge,
        expiresAt: cleaner.topCleanerUntil,
        daysRemaining: cleaner.topCleanerBadge 
          ? Math.ceil((new Date(cleaner.topCleanerUntil) - new Date()) / (1000 * 60 * 60 * 24))
          : 0,
        totalBonusEarned: cleaner.totalBonusEarned,
        lastBonusDate: cleaner.lastBonusDate
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar badge' 
    });
  }
});

module.exports = router;
