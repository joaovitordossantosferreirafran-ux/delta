const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service para calcular métricas de agilidade e performance
 * Agilidade = taxa de resposta + tempo resposta + taxa conclusão
 */

const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

/**
 * Calcula agilidade mensal para uma faxineira
 * Score: 0-10
 *   - Taxa de aceitação: 30% (quanto % aceita de chamadas)
 *   - Tempo de resposta: 40% (quanto rápido responde)
 *   - Taxa conclusão: 30% (quanto % completa trabalhos)
 */
async function calculateAgilityScore(cleanerId, year, month) {
  try {
    // Pega bookings do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        cleanerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        reviews: true,
        history: true
      }
    });

    // Calcula métricas
    const totalCalls = bookings.length;
    const acceptedCalls = bookings.filter(b => b.status !== 'cancelled').length;
    const rejectedCalls = totalCalls - acceptedCalls;
    const acceptanceRate = totalCalls > 0 ? (acceptedCalls / totalCalls) * 100 : 0;

    const completedJobs = bookings.filter(b => b.status === 'completed').length;
    const cancelledJobs = bookings.filter(b => b.status === 'cancelled').length;
    const noShowJobs = bookings.filter(b => b.status === 'no-show').length;
    const completionRate = acceptedCalls > 0 ? (completedJobs / acceptedCalls) * 100 : 0;

    // Calcula tempo médio de resposta (em segundos)
    let avgResponseTime = 0;
    if (bookings.length > 0) {
      const responseTimesSum = bookings.reduce((sum, booking) => {
        // Simular tempo de resposta (entre 5s e 5min)
        return sum + Math.random() * 295 * 1000; // 0-5 min em ms
      }, 0);
      avgResponseTime = Math.round(responseTimesSum / bookings.length / 1000); // converter para segundos
    }

    // Avaliações
    const reviews = bookings.flatMap(b => b.reviews);
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    const fiveStarReviews = reviews.filter(r => r.rating === 5).length;

    // Calcula score de agilidade (0-10)
    const acceptanceScore = (acceptanceRate / 100) * 10;
    const responseScore = Math.min(10, (300 / Math.max(avgResponseTime, 1)) * 10); // Ideal 5 min = 300s
    const completionScore = (completionRate / 100) * 10;

    const agilityScore = (
      acceptanceScore * 0.3 +
      responseScore * 0.4 +
      completionScore * 0.3
    );

    // Verifica se está no top 5%
    const percentile = await getCleanerPercentile(cleanerId, agilityScore);
    const topPercentile = percentile <= 5;

    return {
      totalCalls,
      acceptedCalls,
      rejectedCalls,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      avgResponseTime,
      completedJobs,
      cancelledJobs,
      noShowJobs,
      completionRate: Math.round(completionRate * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviewsReceived: reviews.length,
      fiveStarReviews,
      agilityScore: Math.round(agilityScore * 10) / 10,
      topPercentile,
      ranking: null // Será preenchido ao salvar
    };
  } catch (error) {
    console.error('Erro ao calcular agilidade:', error);
    throw error;
  }
}

/**
 * Obter percentil da faxineira comparado com outras
 */
async function getCleanerPercentile(cleanerId, score) {
  try {
    const totalCleaners = await prisma.cleaner.count();
    
    // Contar quantos têm score melhor
    const betterScores = await prisma.cleaner.count({
      where: {
        agilityScore: { gt: score }
      }
    });

    const percentile = ((betterScores / totalCleaners) * 100);
    return Math.round(percentile);
  } catch (error) {
    return 50; // Default 50 se erro
  }
}

/**
 * Salva/atualiza métricas do mês para uma faxineira
 */
async function saveMonthlyMetrics(cleanerId, year, month) {
  try {
    const metrics = await calculateAgilityScore(cleanerId, year, month);

    const saved = await prisma.cleanerMetrics.upsert({
      where: {
        cleanerId_year_month: {
          cleanerId,
          year,
          month
        }
      },
      update: {
        ...metrics,
        updatedAt: new Date()
      },
      create: {
        cleanerId,
        year,
        month,
        ...metrics
      }
    });

    // Atualiza score na tabela Cleaner também (para busca rápida)
    await prisma.cleaner.update({
      where: { id: cleanerId },
      data: {
        agilityScore: metrics.agilityScore,
        currentMonthCalls: metrics.totalCalls,
        currentMonthAcceptance: metrics.acceptanceRate
      }
    });

    console.log(`✅ Métricas salvas para cleaner ${cleanerId}: ${metrics.agilityScore}/10`);
    return saved;
  } catch (error) {
    console.error('Erro ao salvar métricas:', error);
    throw error;
  }
}

/**
 * Obter histórico de métricas (últimos 6 meses)
 */
async function getMetricsHistory(cleanerId, months = 6) {
  try {
    const now = new Date();
    const history = [];

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const metrics = await prisma.cleanerMetrics.findUnique({
        where: {
          cleanerId_year_month: {
            cleanerId,
            year,
            month
          }
        }
      });

      if (metrics) {
        history.push(metrics);
      }
    }

    return history;
  } catch (error) {
    console.error('Erro ao buscar histórico de métricas:', error);
    throw error;
  }
}

/**
 * Retorna top cleaners do mês por agilidade
 */
async function getTopCleaners(year, month, limit = 10) {
  try {
    const topCleaners = await prisma.cleanerMetrics.findMany({
      where: {
        year,
        month,
        topPercentile: true
      },
      orderBy: {
        agilityScore: 'desc'
      },
      take: limit,
      include: {
        cleaner: {
          select: {
            id: true,
            name: true,
            photo: true,
            averageRating: true,
            totalBookings: true,
            topCleanerBadge: true
          }
        }
      }
    });

    return topCleaners;
  } catch (error) {
    console.error('Erro ao buscar top cleaners:', error);
    throw error;
  }
}

/**
 * Retorna dashboard de métricas para uma faxineira
 */
async function getCleanerDashboard(cleanerId) {
  try {
    const cleaner = await prisma.cleaner.findUnique({
      where: { id: cleanerId },
      select: {
        id: true,
        name: true,
        photo: true,
        averageRating: true,
        totalBookings: true,
        topCleanerBadge: true,
        topCleanerUntil: true,
        totalBonusEarned: true,
        agilityScore: true
      }
    });

    const thisMonth = new Date();
    const currentMetrics = await prisma.cleanerMetrics.findUnique({
      where: {
        cleanerId_year_month: {
          cleanerId,
          year: thisMonth.getFullYear(),
          month: thisMonth.getMonth() + 1
        }
      }
    });

    const bonusHistory = await prisma.cleanerBonus.findMany({
      where: {
        cleanerId,
        status: 'transferred'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      cleaner,
      currentMetrics: currentMetrics || null,
      bonusHistory,
      totalEarnings: cleaner?.totalBonusEarned || 0
    };
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    throw error;
  }
}

module.exports = {
  calculateAgilityScore,
  saveMonthlyMetrics,
  getMetricsHistory,
  getTopCleaners,
  getCleanerDashboard,
  getCleanerPercentile
};
