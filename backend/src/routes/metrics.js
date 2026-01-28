const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  calculateAgilityScore,
  saveMonthlyMetrics,
  getMetricsHistory,
  getTopCleaners,
  getCleanerDashboard
} = require('../services/metricsService');

/**
 * GET /api/metrics/:cleanerId/current
 * Obter dashboard completo da faxineira (métricas + bônus + ranking)
 */
router.get('/:cleanerId/current', authMiddleware, async (req, res) => {
  try {
    const dashboard = await getCleanerDashboard(req.params.cleanerId);

    if (!dashboard.cleaner) {
      return res.status(404).json({ error: 'Faxineira não encontrada' });
    }

    res.json({
      success: true,
      dashboard: {
        cleaner: {
          id: dashboard.cleaner.id,
          name: dashboard.cleaner.name,
          photo: dashboard.cleaner.photo,
          rating: dashboard.cleaner.averageRating,
          totalBookings: dashboard.cleaner.totalBookings,
          topCleanerBadge: dashboard.cleaner.topCleanerBadge,
          topCleanerUntil: dashboard.cleaner.topCleanerUntil
        },
        metrics: dashboard.currentMetrics ? {
          month: `${dashboard.currentMetrics.month}/${dashboard.currentMetrics.year}`,
          totalCalls: dashboard.currentMetrics.totalCalls,
          acceptanceRate: `${dashboard.currentMetrics.acceptanceRate.toFixed(1)}%`,
          completionRate: `${dashboard.currentMetrics.completionRate.toFixed(1)}%`,
          avgResponseTime: `${Math.round(dashboard.currentMetrics.avgResponseTime / 60)} min`,
          agilityScore: dashboard.currentMetrics.agilityScore,
          topPercentile: dashboard.currentMetrics.topPercentile,
          ranking: dashboard.currentMetrics.ranking
        } : null,
        bonuses: {
          totalEarned: `R$ ${dashboard.totalEarnings.toFixed(2)}`,
          recentBonuses: dashboard.bonusHistory.slice(0, 5).map(b => ({
            amount: `R$ ${b.amount.toFixed(2)}`,
            reason: b.reason,
            date: b.createdAt,
            transferred: b.status === 'transferred'
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar dashboard' 
    });
  }
});

/**
 * POST /api/metrics/:cleanerId/calculate
 * Calcula e salva métricas do mês para uma faxineira
 * Body: { year: 2026, month: 1 }
 */
router.post('/:cleanerId/calculate', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.body;
    const now = new Date();

    const calcYear = year || now.getFullYear();
    const calcMonth = month || now.getMonth() + 1;

    const metrics = await saveMonthlyMetrics(
      req.params.cleanerId,
      calcYear,
      calcMonth
    );

    res.json({
      success: true,
      message: 'Métricas calculadas e salvas com sucesso!',
      metrics: {
        month: `${metrics.month}/${metrics.year}`,
        agilityScore: metrics.agilityScore,
        acceptanceRate: `${metrics.acceptanceRate}%`,
        completionRate: `${metrics.completionRate}%`,
        avgResponseTime: `${Math.round(metrics.avgResponseTime / 60)} min`,
        topPercentile: metrics.topPercentile,
        totalCalls: metrics.totalCalls,
        completedJobs: metrics.completedJobs
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao calcular métricas' 
    });
  }
});

/**
 * GET /api/metrics/:cleanerId/history?months=6
 * Obter histórico de métricas (últimos N meses)
 */
router.get('/:cleanerId/history', authMiddleware, async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const history = await getMetricsHistory(
      req.params.cleanerId,
      parseInt(months)
    );

    res.json({
      success: true,
      history: history.map(m => ({
        period: `${m.month}/${m.year}`,
        agilityScore: m.agilityScore,
        acceptanceRate: `${m.acceptanceRate}%`,
        completionRate: `${m.completionRate}%`,
        totalCalls: m.totalCalls,
        avgRating: m.avgRating,
        topPercentile: m.topPercentile
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar histórico de métricas' 
    });
  }
});

/**
 * GET /api/metrics/top/cleaners?limit=10
 * Obter top cleaners do mês por agilidade (com badge TOP CLEANER)
 */
router.get('/top/cleaners', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();

    const topCleaners = await getTopCleaners(
      now.getFullYear(),
      now.getMonth() + 1,
      parseInt(limit)
    );

    res.json({
      success: true,
      topCleaners: topCleaners.map((item, idx) => ({
        position: idx + 1,
        cleaner: {
          id: item.cleaner.id,
          name: item.cleaner.name,
          photo: item.cleaner.photo,
          rating: item.cleaner.averageRating,
          topCleanerBadge: item.cleaner.topCleanerBadge
        },
        metrics: {
          agilityScore: item.agilityScore,
          acceptanceRate: `${item.acceptanceRate}%`,
          completionRate: `${item.completionRate}%`,
          totalCalls: item.totalCalls
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar top cleaners' 
    });
  }
});

/**
 * GET /api/metrics/:cleanerId/score
 * Retorna apenas o score de agilidade atual da faxineira
 */
router.get('/:cleanerId/score', async (req, res) => {
  try {
    const now = new Date();

    const metrics = await calculateAgilityScore(
      req.params.cleanerId,
      now.getFullYear(),
      now.getMonth() + 1
    );

    res.json({
      success: true,
      score: metrics.agilityScore,
      maxScore: 10,
      metrics: {
        acceptanceRate: `${metrics.acceptanceRate}%`,
        responseTime: `${Math.round(metrics.avgResponseTime / 60)} min`,
        completionRate: `${metrics.completionRate}%`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao calcular score' 
    });
  }
});

module.exports = router;
