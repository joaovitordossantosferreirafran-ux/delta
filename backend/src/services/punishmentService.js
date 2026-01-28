const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PunishmentService {
  /**
   * Tipos de punição definidos
   */
  static PUNISHMENT_TYPES = {
    NO_SHOW: 'no_show', // Faltou no agendamento
    CANCELLATION_BOTH: 'cancellation_both', // Ambos cancelaram muito
    LOW_RATING: 'low_rating', // Avaliação muito baixa
  };

  /**
   * Configuração padrão de punições
   */
  static PUNISHMENT_CONFIG = {
    no_show: {
      pointsDeducted: 25,
      blockDays: 2,
      description: 'Punição por não comparecimento',
    },
    cancellation_both: {
      pointsDeducted: 25,
      blockDays: 2,
      description: 'Punição por múltiplos cancelamentos',
    },
    low_rating: {
      pointsDeducted: 15,
      blockDays: 1,
      description: 'Punição por múltiplas avaliações baixas',
    },
  };

  /**
   * Aplica uma punição a um limpador
   * @param {string} cleanerId - ID do limpador
   * @param {string} type - Tipo de punição
   * @param {string} reason - Motivo da punição
   * @param {object} relatedData - Dados relacionados (bookingId, disputeId, etc)
   * @param {boolean} givenByAdmin - Se foi dado por admin
   * @param {string} adminId - ID do admin (se aplicável)
   * @returns {object} - Punição aplicada
   */
  static async applyPunishment(
    cleanerId,
    type,
    reason,
    relatedData = {},
    givenByAdmin = false,
    adminId = null
  ) {
    try {
      // Validar tipo
      if (!Object.values(this.PUNISHMENT_TYPES).includes(type)) {
        throw new Error(`Tipo de punição inválido: ${type}`);
      }

      // Buscar limpador
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: cleanerId },
      });

      if (!cleaner) {
        throw new Error('Limpador não encontrado');
      }

      // Configuração da punição
      const config = this.PUNISHMENT_CONFIG[type];
      const blockUntilDate = new Date();
      blockUntilDate.setDate(blockUntilDate.getDate() + config.blockDays);

      // Criar punição
      const punishment = await prisma.cleanerPunishment.create({
        data: {
          cleanerId,
          type,
          reason,
          pointsDeducted: config.pointsDeducted,
          isActive: true,
          blockedUntil: blockUntilDate,
          relatedBookingId: relatedData.bookingId || null,
          relatedDisputeId: relatedData.disputeId || null,
          givenByAdmin,
          adminId,
          description: `${config.description}. Motivo: ${reason}`,
        },
      });

      // Atualizar pontos de reputação do limpador
      const newReputationPoints = Math.max(0, cleaner.reputationPoints - config.pointsDeducted);

      const updatedCleaner = await prisma.cleaner.update({
        where: { id: cleanerId },
        data: {
          reputationPoints: newReputationPoints,
          status:
            newReputationPoints === 0 ? 'suspended' : cleaner.status,
        },
      });

      // Criar notificação para o limpador
      await prisma.notification.create({
        data: {
          cleanerId,
          title: '⚠️ Você recebeu uma penalidade',
          message: `Você foi penalizado com ${config.pointsDeducted} pontos. Motivo: ${reason}. Bloqueado até ${blockUntilDate.toLocaleDateString('pt-BR')}`,
          type: 'punishment_applied',
          read: false,
        },
      });

      return {
        success: true,
        punishment,
        cleaner: updatedCleaner,
        message: `Punição aplicada com sucesso. Limpador bloqueado até ${blockUntilDate.toLocaleDateString('pt-BR')}`,
      };
    } catch (error) {
      console.error('Erro ao aplicar punição:', error.message);
      throw error;
    }
  }

  /**
   * Remove uma punição (admin)
   * @param {string} punishmentId - ID da punição
   * @param {string} adminId - ID do admin que está removendo
   * @param {string} reason - Motivo da remoção
   * @returns {object} - Punição removida
   */
  static async removePunishment(punishmentId, adminId, reason = 'Removida por admin') {
    try {
      const punishment = await prisma.cleanerPunishment.findUnique({
        where: { id: punishmentId },
      });

      if (!punishment) {
        throw new Error('Punição não encontrada');
      }

      // Remover punição
      const removedPunishment = await prisma.cleanerPunishment.update({
        where: { id: punishmentId },
        data: {
          isActive: false,
          blockedUntil: new Date(), // Remove o bloqueio
        },
      });

      // Restaurar pontos de reputação
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: punishment.cleanerId },
      });

      const restoredPoints = Math.min(
        100,
        cleaner.reputationPoints + punishment.pointsDeducted
      );

      await prisma.cleaner.update({
        where: { id: punishment.cleanerId },
        data: {
          reputationPoints: restoredPoints,
          status: 'active', // Reativar se estava suspenso
        },
      });

      // Notificar limpador
      await prisma.notification.create({
        data: {
          cleanerId: punishment.cleanerId,
          title: '✅ Sua penalidade foi removida',
          message: `Sua penalidade foi removida. ${reason}. Pontos restaurados: ${punishment.pointsDeducted}`,
          type: 'punishment_removed',
          read: false,
        },
      });

      return {
        success: true,
        punishment: removedPunishment,
        message: 'Punição removida com sucesso',
      };
    } catch (error) {
      console.error('Erro ao remover punição:', error.message);
      throw error;
    }
  }

  /**
   * Obtém punições ativas de um limpador
   * @param {string} cleanerId - ID do limpador
   * @returns {array} - Array com punições ativas
   */
  static async getActivePunishments(cleanerId) {
    try {
      const now = new Date();
      
      const punishments = await prisma.cleanerPunishment.findMany({
        where: {
          cleanerId,
          isActive: true,
          blockedUntil: {
            gt: now, // Bloqueio ainda é válido
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return punishments;
    } catch (error) {
      console.error('Erro ao buscar punições:', error.message);
      throw error;
    }
  }

  /**
   * Obtém histórico de punições de um limpador
   * @param {string} cleanerId - ID do limpador
   * @param {number} limit - Limite de registros
   * @returns {object} - Histórico de punições
   */
  static async getPunishmentHistory(cleanerId, limit = 50) {
    try {
      const punishments = await prisma.cleanerPunishment.findMany({
        where: { cleanerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const active = punishments.filter(
        (p) => p.isActive && new Date(p.blockedUntil) > new Date()
      );

      return {
        total: punishments.length,
        active: active.length,
        punishments,
      };
    } catch (error) {
      console.error('Erro ao buscar histórico:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se um limpador está bloqueado
   * @param {string} cleanerId - ID do limpador
   * @returns {object} - Status do bloqueio
   */
  static async checkBlockedStatus(cleanerId) {
    try {
      const activePunishments = await this.getActivePunishments(cleanerId);

      if (activePunishments.length === 0) {
        return {
          isBlocked: false,
          punishments: [],
        };
      }

      return {
        isBlocked: true,
        punishments: activePunishments,
        blockedUntil: activePunishments[0].blockedUntil,
        message: `Você está bloqueado até ${activePunishments[0].blockedUntil.toLocaleDateString('pt-BR')} por: ${activePunishments[0].reason}`,
      };
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error.message);
      throw error;
    }
  }

  /**
   * Verifica punições expiradas e as desativa automaticamente
   * @param {string} cleanerId - ID do limpador (optional - se não fornecido, verifica todos)
   */
  static async checkExpiredPunishments(cleanerId = null) {
    try {
      const now = new Date();

      const where = cleanerId
        ? { cleanerId, isActive: true }
        : { isActive: true };

      const expiredPunishments = await prisma.cleanerPunishment.findMany({
        where: {
          ...where,
          blockedUntil: {
            lte: now,
          },
        },
      });

      if (expiredPunishments.length === 0) {
        return { updated: 0 };
      }

      // Desativar punições expiradas
      await prisma.cleanerPunishment.updateMany({
        where: {
          id: { in: expiredPunishments.map((p) => p.id) },
        },
        data: { isActive: false },
      });

      return {
        updated: expiredPunishments.length,
        message: `${expiredPunishments.length} punição(ões) expirada(s) foram desativadas`,
      };
    } catch (error) {
      console.error('Erro ao verificar punições expiradas:', error.message);
      throw error;
    }
  }

  /**
   * Obtém todas as punições ativas do sistema (admin)
   * @param {number} limit - Limite de registros
   * @returns {array} - Array com punições ativas
   */
  static async getAllActivePunishments(limit = 100) {
    try {
      const now = new Date();

      const punishments = await prisma.cleanerPunishment.findMany({
        where: {
          isActive: true,
          blockedUntil: {
            gt: now,
          },
        },
        include: {
          cleaner: {
            select: {
              id: true,
              name: true,
              email: true,
              reputationPoints: true,
            },
          },
        },
        orderBy: { blockedUntil: 'asc' },
        take: limit,
      });

      return punishments;
    } catch (error) {
      console.error('Erro ao buscar punições:', error.message);
      throw error;
    }
  }
}

module.exports = PunishmentService;
