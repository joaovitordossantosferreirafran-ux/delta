const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RankingService {
  /**
   * Calcula o ranking mensal de limpadores baseado em métricas
   * @param {number} year - Ano (ex: 2026)
   * @param {number} month - Mês (1-12)
   * @returns {object} - Ranking mensal
   */
  static async calculateMonthlyRanking(year, month) {
    try {
      // Buscar todas as métricas do mês
      const metrics = await prisma.cleanerMetrics.findMany({
        where: {
          year,
          month,
        },
        include: {
          cleaner: {
            select: {
              id: true,
              name: true,
              email: true,
              photo: true,
              region: true,
              averageRating: true,
              reputationPoints: true,
            },
          },
        },
        orderBy: [
          { agilityScore: 'desc' },
          { cleaner: { averageRating: 'desc' } },
        ],
      });

      // Adicionar ranking
      const rankedMetrics = metrics.map((metric, index) => ({
        ...metric,
        ranking: index + 1,
      }));

      // Identificar top performers (top 5%)
      const topPercentileCount = Math.max(1, Math.ceil(metrics.length * 0.05));
      const topPercentileThreshold = topPercentileCount - 1;

      // Atualizar ranking no banco de dados
      for (const metric of rankedMetrics) {
        await prisma.cleanerMetrics.update({
          where: { id: metric.id },
          data: {
            ranking: metric.ranking,
            topPercentile: metric.ranking <= topPercentileCount,
          },
        });
      }

      return {
        success: true,
        year,
        month,
        totalCleaners: metrics.length,
        topPercentileCount,
        ranking: rankedMetrics,
      };
    } catch (error) {
      console.error('Erro ao calcular ranking:', error.message);
      throw error;
    }
  }

  /**
   * Obtém o ranking global (todos os tempos) de limpadores
   * @param {number} limit - Limite de registros
   * @param {number} offset - Offset
   * @returns {array} - Ranking global
   */
  static async getGlobalRanking(limit = 50, offset = 0) {
    try {
      const cleaners = await prisma.cleaner.findMany({
        where: {
          status: {
            in: ['active', 'verified'],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          region: true,
          averageRating: true,
          reviewCount: true,
          totalBookings: true,
          agilityScore: true,
          reputationPoints: true,
          topCleanerBadge: true,
          topCleanerUntil: true,
        },
        orderBy: [
          { topCleanerBadge: 'desc' },
          { agilityScore: 'desc' },
          { averageRating: 'desc' },
          { totalBookings: 'desc' },
        ],
        take: limit,
        skip: offset,
      });

      // Adicionar ranking
      const rankedCleaners = cleaners.map((cleaner, index) => ({
        ...cleaner,
        globalRank: offset + index + 1,
      }));

      const totalCount = await prisma.cleaner.count({
        where: {
          status: {
            in: ['active', 'verified'],
          },
        },
      });

      return {
        success: true,
        total: totalCount,
        limit,
        offset,
        ranking: rankedCleaners,
      };
    } catch (error) {
      console.error('Erro ao buscar ranking global:', error.message);
      throw error;
    }
  }

  /**
   * Obtém ranking de um limpador específico
   * @param {string} cleanerId - ID do limpador
   * @returns {object} - Informações de ranking
   */
  static async getCleanerRank(cleanerId) {
    try {
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: cleanerId },
        select: {
          id: true,
          name: true,
          averageRating: true,
          reviewCount: true,
          totalBookings: true,
          agilityScore: true,
          reputationPoints: true,
          topCleanerBadge: true,
          topCleanerUntil: true,
          currentRank: true,
          metrics: {
            where: {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
            },
            select: {
              ranking: true,
              topPercentile: true,
              acceptanceRate: true,
              completionRate: true,
              avgRating: true,
              agilityScore: true,
            },
          },
        },
      });

      if (!cleaner) {
        throw new Error('Limpador não encontrado');
      }

      // Buscar posição no ranking global
      const globalRanking = await prisma.cleaner.count({
        where: {
          agilityScore: { gt: cleaner.agilityScore },
          status: { in: ['active', 'verified'] },
        },
      });

      return {
        success: true,
        cleaner: {
          ...cleaner,
          globalRank: globalRanking + 1,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar rank:', error.message);
      throw error;
    }
  }

  /**
   * Obtém ranking por região
   * @param {string} region - Região
   * @param {number} limit - Limite de registros
   * @returns {array} - Ranking da região
   */
  static async getRegionalRanking(region, limit = 20) {
    try {
      const cleaners = await prisma.cleaner.findMany({
        where: {
          region: {
            contains: region,
            mode: 'insensitive',
          },
          status: {
            in: ['active', 'verified'],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          region: true,
          averageRating: true,
          reviewCount: true,
          totalBookings: true,
          agilityScore: true,
          reputationPoints: true,
          topCleanerBadge: true,
        },
        orderBy: [
          { topCleanerBadge: 'desc' },
          { agilityScore: 'desc' },
          { averageRating: 'desc' },
        ],
        take: limit,
      });

      // Adicionar ranking regional
      const rankedCleaners = cleaners.map((cleaner, index) => ({
        ...cleaner,
        regionalRank: index + 1,
      }));

      return {
        success: true,
        region,
        total: cleaners.length,
        ranking: rankedCleaners,
      };
    } catch (error) {
      console.error('Erro ao buscar ranking regional:', error.message);
      throw error;
    }
  }

  /**
   * Atualiza o score de agilidade de um limpador
   * Baseado em: aceitação de convites, tempo de resposta, taxa de conclusão
   * @param {string} cleanerId - ID do limpador
   * @returns {object} - Score atualizado
   */
  static async updateAgilityScore(cleanerId) {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Buscar métricas do mês
      const metrics = await prisma.cleanerMetrics.findUnique({
        where: {
          cleanerId_year_month: {
            cleanerId,
            year,
            month,
          },
        },
      });

      if (!metrics) {
        throw new Error('Métricas do mês não encontradas');
      }

      // Calcular score de agilidade (0-10)
      // 40% aceitação + 30% tempo resposta + 30% conclusão
      const acceptanceScore = (metrics.acceptanceRate / 100) * 4; // 0-4
      const responseScore =
        Math.max(0, (300 - Math.min(metrics.avgResponseTime, 300)) / 300) * 3; // 0-3
      const completionScore = (metrics.completionRate / 100) * 3; // 0-3

      const agilityScore =
        parseFloat((acceptanceScore + responseScore + completionScore).toFixed(2));

      // Atualizar score
      const updated = await prisma.cleanerMetrics.update({
        where: {
          id: metrics.id,
        },
        data: {
          agilityScore,
        },
      });

      // Atualizar score do cleaner
      await prisma.cleaner.update({
        where: { id: cleanerId },
        data: { agilityScore },
      });

      return {
        success: true,
        agilityScore,
        breakdown: {
          acceptanceScore: parseFloat(acceptanceScore.toFixed(2)),
          responseScore: parseFloat(responseScore.toFixed(2)),
          completionScore: parseFloat(completionScore.toFixed(2)),
        },
      };
    } catch (error) {
      console.error('Erro ao atualizar agilidade score:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de limpador para grade/dashboard
   * @param {string} cleanerId - ID do limpador
   * @returns {object} - Estatísticas completas
   */
  static async getCleanerGradeCard(cleanerId) {
    try {
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: cleanerId },
        include: {
          metrics: {
            where: {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
            },
            select: {
              totalCalls: true,
              acceptanceRate: true,
              completionRate: true,
              avgRating: true,
              agilityScore: true,
              ranking: true,
              topPercentile: true,
            },
          },
        },
      });

      if (!cleaner) {
        throw new Error('Limpador não encontrado');
      }

      const currentMetrics = cleaner.metrics[0] || {
        totalCalls: 0,
        acceptanceRate: 0,
        completionRate: 0,
        avgRating: 0,
        agilityScore: 0,
      };

      // Buscar posição global
      const globalRank = await prisma.cleaner.count({
        where: {
          agilityScore: { gt: cleaner.agilityScore },
          status: { in: ['active', 'verified'] },
        },
      });

      // Determinar grade (A, B, C, D, F)
      let grade = 'F';
      if (currentMetrics.agilityScore >= 9) grade = 'A';
      else if (currentMetrics.agilityScore >= 8) grade = 'B';
      else if (currentMetrics.agilityScore >= 7) grade = 'C';
      else if (currentMetrics.agilityScore >= 6) grade = 'D';

      return {
        success: true,
        grade,
        cleaner: {
          id: cleaner.id,
          name: cleaner.name,
          photo: cleaner.photo,
          region: cleaner.region,
        },
        metrics: {
          currentMonthCalls: currentMetrics.totalCalls,
          acceptanceRate: currentMetrics.acceptanceRate,
          completionRate: currentMetrics.completionRate,
          avgRating: currentMetrics.avgRating,
          agilityScore: currentMetrics.agilityScore,
          monthlyRanking: currentMetrics.ranking,
        },
        reputation: {
          points: cleaner.reputationPoints,
          status:
            cleaner.reputationPoints >= 80
              ? 'Excelente'
              : cleaner.reputationPoints >= 60
              ? 'Bom'
              : 'Precisa Melhorar',
        },
        global: {
          rank: globalRank + 1,
          topPerformer: currentMetrics.topPercentile,
          badge: cleaner.topCleanerBadge ? 'TOP CLEANER' : 'Regular',
        },
      };
    } catch (error) {
      console.error('Erro ao buscar grade:', error.message);
      throw error;
    }
  }
}

module.exports = RankingService;
