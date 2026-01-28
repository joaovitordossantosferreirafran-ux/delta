const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RatingService {
  /**
   * Cria uma avaliação (user avalia cleaner ou vice-versa)
   * @param {object} ratingData - Dados da avaliação
   * @returns {object} - Avaliação criada
   */
  static async createRating(ratingData) {
    try {
      const {
        bookingId,
        givenByUserId = null,
        givenByCleanerId = null,
        toUserId = null,
        toCleanerId = null,
        rating,
        comment = null,
        punctuality = null,
        professionalism = null,
        quality = null,
        communication = null,
      } = ratingData;

      if (!bookingId) {
        throw new Error('bookingId é obrigatório');
      }

      if (!rating || rating < 1 || rating > 5) {
        throw new Error('rating deve estar entre 1 e 5');
      }

      // Verificar se a avaliação já existe
      const existingRating = await prisma.userRating.findUnique({
        where: { bookingId },
      });

      if (existingRating) {
        throw new Error('Avaliação já existe para este agendamento');
      }

      // Buscar o booking
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Agendamento não encontrado');
      }

      // Criar avaliação
      const userRating = await prisma.userRating.create({
        data: {
          bookingId,
          givenByUserId,
          givenByCleanerId,
          toUserId,
          toCleanerId,
          rating,
          comment,
          punctuality,
          professionalism,
          quality,
          communication,
          isPublic: true,
          flagged: false,
        },
        include: {
          booking: true,
        },
      });

      // Atualizar média de avaliação do limpador se aplicável
      if (toCleanerId) {
        await this.updateCleanerAverageRating(toCleanerId);
      }

      return {
        success: true,
        rating: userRating,
        message: 'Avaliação criada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error.message);
      throw error;
    }
  }

  /**
   * Edita uma avaliação existente
   * @param {string} ratingId - ID da avaliação
   * @param {object} updateData - Dados a atualizar
   * @returns {object} - Avaliação atualizada
   */
  static async updateRating(ratingId, updateData) {
    try {
      const rating = await prisma.userRating.findUnique({
        where: { id: ratingId },
      });

      if (!rating) {
        throw new Error('Avaliação não encontrada');
      }

      // Verificar se está dentro de 7 dias
      const createdDate = new Date(rating.createdAt);
      const now = new Date();
      const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        throw new Error(
          'Avaliações só podem ser editadas nos primeiros 7 dias'
        );
      }

      const updatedRating = await prisma.userRating.update({
        where: { id: ratingId },
        data: updateData,
      });

      // Atualizar média se rating foi alterado
      if (
        updateData.rating &&
        updatedRating.toCleanerId
      ) {
        await this.updateCleanerAverageRating(updatedRating.toCleanerId);
      }

      return {
        success: true,
        rating: updatedRating,
        message: 'Avaliação atualizada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error.message);
      throw error;
    }
  }

  /**
   * Deleta uma avaliação
   * @param {string} ratingId - ID da avaliação
   * @returns {object} - Resultado da exclusão
   */
  static async deleteRating(ratingId) {
    try {
      const rating = await prisma.userRating.findUnique({
        where: { id: ratingId },
      });

      if (!rating) {
        throw new Error('Avaliação não encontrada');
      }

      const toCleanerId = rating.toCleanerId;

      await prisma.userRating.delete({
        where: { id: ratingId },
      });

      // Atualizar média se era avaliação de limpador
      if (toCleanerId) {
        await this.updateCleanerAverageRating(toCleanerId);
      }

      return {
        success: true,
        message: 'Avaliação deletada com sucesso',
      };
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error.message);
      throw error;
    }
  }

  /**
   * Flaga uma avaliação como abusiva
   * @param {string} ratingId - ID da avaliação
   * @param {string} reason - Motivo da flag
   * @returns {object} - Avaliação flagada
   */
  static async flagRating(ratingId, reason) {
    try {
      const flaggedRating = await prisma.userRating.update({
        where: { id: ratingId },
        data: {
          flagged: true,
          flagReason: reason,
          isPublic: false,
        },
      });

      return {
        success: true,
        rating: flaggedRating,
        message: 'Avaliação marcada como abusiva',
      };
    } catch (error) {
      console.error('Erro ao flagar avaliação:', error.message);
      throw error;
    }
  }

  /**
   * Obtém todas as avaliações de um limpador
   * @param {string} cleanerId - ID do limpador
   * @param {number} limit - Limite de registros
   * @returns {array} - Array com avaliações
   */
  static async getCleanerRatings(cleanerId, limit = 50, offset = 0) {
    try {
      const ratings = await prisma.userRating.findMany({
        where: {
          toCleanerId: cleanerId,
          isPublic: true,
          flagged: false,
        },
        include: {
          booking: {
            select: {
              id: true,
              date: true,
              serviceType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const totalCount = await prisma.userRating.count({
        where: {
          toCleanerId: cleanerId,
          isPublic: true,
          flagged: false,
        },
      });

      return {
        ratings,
        total: totalCount,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error.message);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de avaliação de um limpador
   * @param {string} cleanerId - ID do limpador
   * @returns {object} - Estatísticas
   */
  static async getCleanerRatingStats(cleanerId) {
    try {
      const ratings = await prisma.userRating.findMany({
        where: {
          toCleanerId: cleanerId,
          isPublic: true,
          flagged: false,
        },
      });

      if (ratings.length === 0) {
        return {
          average: 0,
          total: 0,
          distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
          avgPunctuality: 0,
          avgProfessionalism: 0,
          avgQuality: 0,
          avgCommunication: 0,
        };
      }

      const average =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

      const distribution = {
        5: ratings.filter((r) => r.rating === 5).length,
        4: ratings.filter((r) => r.rating === 4).length,
        3: ratings.filter((r) => r.rating === 3).length,
        2: ratings.filter((r) => r.rating === 2).length,
        1: ratings.filter((r) => r.rating === 1).length,
      };

      const avgPunctuality =
        ratings.filter((r) => r.punctuality).reduce((sum, r) => sum + r.punctuality, 0) /
        ratings.filter((r) => r.punctuality).length || 0;

      const avgProfessionalism =
        ratings.filter((r) => r.professionalism).reduce((sum, r) => sum + r.professionalism, 0) /
        ratings.filter((r) => r.professionalism).length || 0;

      const avgQuality =
        ratings.filter((r) => r.quality).reduce((sum, r) => sum + r.quality, 0) /
        ratings.filter((r) => r.quality).length || 0;

      const avgCommunication =
        ratings.filter((r) => r.communication).reduce((sum, r) => sum + r.communication, 0) /
        ratings.filter((r) => r.communication).length || 0;

      return {
        average: parseFloat(average.toFixed(2)),
        total: ratings.length,
        distribution,
        avgPunctuality: parseFloat(avgPunctuality.toFixed(2)),
        avgProfessionalism: parseFloat(avgProfessionalism.toFixed(2)),
        avgQuality: parseFloat(avgQuality.toFixed(2)),
        avgCommunication: parseFloat(avgCommunication.toFixed(2)),
      };
    } catch (error) {
      console.error('Erro ao buscar stats:', error.message);
      throw error;
    }
  }

  /**
   * Atualiza a média de avaliação do limpador
   * @param {string} cleanerId - ID do limpador
   */
  static async updateCleanerAverageRating(cleanerId) {
    try {
      const stats = await this.getCleanerRatingStats(cleanerId);

      await prisma.cleaner.update({
        where: { id: cleanerId },
        data: {
          averageRating: stats.average,
          reviewCount: stats.total,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar média:', error.message);
    }
  }

  /**
   * Obtém avaliações flagadas para moderação admin
   * @param {number} limit - Limite de registros
   * @returns {array} - Array com avaliações flagadas
   */
  static async getFlaggedRatings(limit = 50) {
    try {
      const flaggedRatings = await prisma.userRating.findMany({
        where: { flagged: true },
        include: {
          booking: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
              cleaner: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return flaggedRatings;
    } catch (error) {
      console.error('Erro ao buscar avaliações flagadas:', error.message);
      throw error;
    }
  }

  /**
   * Aprova (remove flag) de uma avaliação
   * @param {string} ratingId - ID da avaliação
   * @returns {object} - Avaliação aprovada
   */
  static async approveRating(ratingId) {
    try {
      const approvedRating = await prisma.userRating.update({
        where: { id: ratingId },
        data: {
          flagged: false,
          flagReason: null,
          isPublic: true,
        },
      });

      return {
        success: true,
        rating: approvedRating,
        message: 'Avaliação aprovada',
      };
    } catch (error) {
      console.error('Erro ao aprovar avaliação:', error.message);
      throw error;
    }
  }
}

module.exports = RatingService;
