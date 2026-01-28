const express = require('express');
const router = express.Router();
const RescheduleService = require('../services/rescheduleService');
const RatingService = require('../services/ratingService');
const PunishmentService = require('../services/punishmentService');
const RegionService = require('../services/regionService');
const RankingService = require('../services/rankingService');
const { authenticate } = require('../middleware/auth');

// ==================== REAGENDAMENTO ====================

/**
 * POST /api/reschedule
 * Cria um novo reagendamento
 */
router.post('/reschedule', authenticate, async (req, res) => {
  try {
    const { bookingId, newDate, newStartTime, newEndTime, reason, initiatedBy } = req.body;

    if (!bookingId || !newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        error: 'bookingId, newDate, newStartTime e newEndTime são obrigatórios',
      });
    }

    const result = await RescheduleService.rescheduleBooking(
      bookingId,
      newDate,
      newStartTime,
      newEndTime,
      reason,
      initiatedBy || 'user'
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reschedule/:bookingId
 * Obtém histórico de reagendamentos de um agendamento
 */
router.get('/reschedule/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const reschedules = await RescheduleService.getRescheduleHistory(bookingId);

    res.json({
      success: true,
      reschedules,
      count: reschedules.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reschedule/cleaner/:cleanerId
 * Obtém reagendamentos de um limpador
 */
router.get('/reschedule/cleaner/:cleanerId', authenticate, async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const { limit = 50 } = req.query;

    const reschedules = await RescheduleService.getCleanerReschedules(
      cleanerId,
      parseInt(limit)
    );

    res.json({
      success: true,
      reschedules,
      count: reschedules.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== AVALIAÇÕES MÚTUAS ====================

/**
 * POST /api/ratings
 * Cria uma nova avaliação
 */
router.post('/ratings', authenticate, async (req, res) => {
  try {
    const result = await RatingService.createRating(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/ratings/:ratingId
 * Edita uma avaliação
 */
router.put('/ratings/:ratingId', authenticate, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const result = await RatingService.updateRating(ratingId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/ratings/:ratingId
 * Deleta uma avaliação
 */
router.delete('/ratings/:ratingId', authenticate, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const result = await RatingService.deleteRating(ratingId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/ratings/:ratingId/flag
 * Flaga uma avaliação como abusiva
 */
router.post('/ratings/:ratingId/flag', authenticate, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;

    const result = await RatingService.flagRating(ratingId, reason);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/ratings/cleaner/:cleanerId
 * Obtém avaliações de um limpador
 */
router.get('/ratings/cleaner/:cleanerId', async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await RatingService.getCleanerRatings(
      cleanerId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/ratings/stats/:cleanerId
 * Obtém estatísticas de avaliação
 */
router.get('/ratings/stats/:cleanerId', async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const stats = await RatingService.getCleanerRatingStats(cleanerId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PUNIÇÃO ====================

/**
 * POST /api/punishment
 * Aplica uma punição a um limpador
 */
router.post('/punishment', authenticate, async (req, res) => {
  try {
    const {
      cleanerId,
      type,
      reason,
      relatedBookingId,
      relatedDisputeId,
      givenByAdmin = false,
      adminId = null,
    } = req.body;

    if (!cleanerId || !type || !reason) {
      return res.status(400).json({
        error: 'cleanerId, type e reason são obrigatórios',
      });
    }

    const result = await PunishmentService.applyPunishment(
      cleanerId,
      type,
      reason,
      { bookingId: relatedBookingId, disputeId: relatedDisputeId },
      givenByAdmin,
      adminId
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/punishment/:punishmentId
 * Remove uma punição
 */
router.delete('/punishment/:punishmentId', authenticate, async (req, res) => {
  try {
    const { punishmentId } = req.params;
    const { adminId, reason } = req.body;

    const result = await PunishmentService.removePunishment(
      punishmentId,
      adminId,
      reason
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/punishment/cleaner/:cleanerId
 * Obtém punições ativas de um limpador
 */
router.get('/punishment/cleaner/:cleanerId', authenticate, async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const punishments = await PunishmentService.getActivePunishments(
      cleanerId
    );

    res.json({
      success: true,
      punishments,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/punishment/history/:cleanerId
 * Obtém histórico de punições
 */
router.get('/punishment/history/:cleanerId', authenticate, async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const { limit = 50 } = req.query;

    const result = await PunishmentService.getPunishmentHistory(
      cleanerId,
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/punishment/check/:cleanerId
 * Verifica se um limpador está bloqueado
 */
router.get('/punishment/check/:cleanerId', authenticate, async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const result = await PunishmentService.checkBlockedStatus(cleanerId);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== REGIÃO E MODO RÁPIDO ====================

/**
 * POST /api/region/preferences
 * Define preferências de região
 */
router.post('/region/preferences', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const result = await RegionService.setRegionPreferences(userId, req.body);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/region/preferences
 * Obtém preferências de região do usuário
 */
router.get('/region/preferences', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const prefs = await RegionService.getUserRegionPreferences(userId);

    res.json({
      success: true,
      preferences: prefs,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/region/quick-mode
 * Ativa modo rápido
 */
router.post('/region/quick-mode', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ error: 'region é obrigatório' });
    }

    const result = await RegionService.setQuickMode(userId, region);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/region/quick-mode
 * Desativa modo rápido
 */
router.delete('/region/quick-mode', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const result = await RegionService.disableQuickMode(userId);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/region/add
 * Adiciona uma região às preferências
 */
router.post('/region/add', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { region } = req.body;

    if (!region) {
      return res.status(400).json({ error: 'region é obrigatório' });
    }

    const result = await RegionService.addRegion(userId, region);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/region/:region
 * Remove uma região
 */
router.delete('/region/:region', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { region } = req.params;

    const result = await RegionService.removeRegion(userId, region);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/region/cleaners
 * Busca limpadores por região
 */
router.get('/region/cleaners', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { region, city, limit = 50 } = req.query;

    const result = await RegionService.findCleanersByRegion(
      userId,
      region,
      city,
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/region/cleaners/multiple
 * Busca limpadores em múltiplas regiões
 */
router.get('/region/cleaners/multiple', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { regions, limit = 30 } = req.query;

    const parsedRegions = regions
      ? regions.split(',').map((r) => r.trim())
      : null;

    const result = await RegionService.findCleanersByMultipleRegions(
      userId,
      parsedRegions,
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/region/list
 * Lista todas as regiões do sistema
 */
router.get('/region/list', async (req, res) => {
  try {
    const result = await RegionService.getAllRegions();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== RANKING E GRADE ====================

/**
 * GET /api/ranking/global
 * Obtém ranking global
 */
router.get('/ranking/global', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await RankingService.getGlobalRanking(
      parseInt(limit),
      parseInt(offset)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/ranking/cleaner/:cleanerId
 * Obtém ranking de um limpador específico
 */
router.get('/ranking/cleaner/:cleanerId', async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const result = await RankingService.getCleanerRank(cleanerId);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/ranking/region/:region
 * Obtém ranking de uma região
 */
router.get('/ranking/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20 } = req.query;

    const result = await RankingService.getRegionalRanking(
      region,
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/ranking/grade/:cleanerId
 * Obtém grade/card de desempenho do limpador
 */
router.get('/ranking/grade/:cleanerId', async (req, res) => {
  try {
    const { cleanerId } = req.params;
    const result = await RankingService.getCleanerGradeCard(cleanerId);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/ranking/monthly
 * Calcula ranking mensal (admin)
 */
router.post('/ranking/monthly', authenticate, async (req, res) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({
        error: 'year e month são obrigatórios',
      });
    }

    const result = await RankingService.calculateMonthlyRanking(year, month);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
