const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Serviço de Conquistas (Achievements)
 * Gerencia badges, conquistas e progressão de usuários e faxineiros
 */

class AchievementService {
  /**
   * Desbloquear conquista do usuário
   * @param {string} userId - ID do usuário
   * @param {string} type - Tipo de conquista
   * @param {object} data - Dados da conquista
   */
  async unlockUserAchievement(userId, type, data = {}) {
    try {
      const achievements = {
        first_booking: {
          name: 'Primeiro Agendamento',
          description: 'Você realizou seu primeiro agendamento na plataforma!',
          icon: '🎉',
          bonusPoints: 5
        },
        five_bookings: {
          name: '5 Agendamentos',
          description: 'Você já agendou 5 limpezas. Você é cliente fiel!',
          icon: '⭐',
          bonusPoints: 10
        },
        fifty_bookings: {
          name: '50 Agendamentos',
          description: 'Parabéns! Você já fez 50 agendamentos.',
          icon: '🏆',
          bonusPoints: 25
        },
        hundred_bookings: {
          name: '100 Agendamentos',
          description: 'Centésimo agendamento desbloqueado! Você é um poder-usuário.',
          icon: '👑',
          bonusPoints: 50
        },
        perfect_rating: {
          name: 'Avaliação Perfeita',
          description: '5 avaliações 5 estrelas consecutivas!',
          icon: '✨',
          bonusPoints: 15
        },
        trusted_user: {
          name: 'Usuário Confiável',
          description: 'Manteve reputação acima de 90 por 30 dias.',
          icon: '🤝',
          bonusPoints: 20
        },
        bonus_hunter: {
          name: 'Caçador de Bônus',
          description: 'Ganhou 10 bônus em um mês.',
          icon: '🎁',
          bonusPoints: 25
        },
        power_user: {
          name: 'Poder-Usuário',
          description: 'Atingiu nível máximo em todas as métricas.',
          icon: '⚡',
          bonusPoints: 50
        }
      };

      const achievementData = achievements[type] || {};
      
      // Verificar se já tem essa conquista
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_type: {
            userId,
            type
          }
        }
      });

      if (existing) {
        // Subir nível se já desbloqueada
        let newLevel = existing.level + 1;
        if (newLevel > 3) newLevel = 3; // máximo 3 (gold)

        return await prisma.userAchievement.update({
          where: { id: existing.id },
          data: {
            level: newLevel,
            progress: 0,
            bonusPoints: achievementData.bonusPoints || 0,
            updatedAt: new Date()
          }
        });
      }

      // Criar nova conquista
      return await prisma.userAchievement.create({
        data: {
          userId,
          type,
          name: achievementData.name || 'Conquista Desbloqueada',
          description: achievementData.description || '',
          icon: achievementData.icon || '🎯',
          level: 1,
          progress: 0,
          bonusPoints: achievementData.bonusPoints || 0
        }
      });
    } catch (error) {
      console.error('Erro ao desbloquear conquista do usuário:', error);
      throw error;
    }
  }

  /**
   * Desbloquear conquista do faxineiro
   * @param {string} cleanerId - ID do faxineiro
   * @param {string} type - Tipo de conquista
   * @param {object} data - Dados adicionais
   */
  async unlockCleanerAchievement(cleanerId, type, data = {}) {
    try {
      const achievements = {
        first_booking: {
          name: 'Primeiro Cliente',
          description: 'Você completou seu primeiro agendamento!',
          icon: '🎉',
          bonusPoints: 10,
          bonusEarnings: 0.05 // 5% extra
        },
        five_star_master: {
          name: 'Mestre 5 Estrelas',
          description: '10 avaliações 5 estrelas consecutivas!',
          icon: '⭐',
          bonusPoints: 20,
          bonusEarnings: 0.10
        },
        speed_demon: {
          name: 'Demônio da Velocidade',
          description: 'Respondeu em menos de 5 minutos por 30 dias seguidos.',
          icon: '🚀',
          bonusPoints: 15,
          bonusEarnings: 0.05
        },
        completion_master: {
          name: 'Mestre de Conclusão',
          description: '98% de taxa de conclusão de agendamentos.',
          icon: '✅',
          bonusPoints: 25,
          bonusEarnings: 0.15
        },
        top_performer: {
          name: 'Melhor Desempenho',
          description: 'Top 5% de faxineiros da plataforma!',
          icon: '🏆',
          bonusPoints: 50,
          bonusEarnings: 0.25
        },
        master_cleaner: {
          name: 'Faxineiro Master',
          description: 'Atingiu 100 agendamentos com 4.8+ estrelas.',
          icon: '👑',
          bonusPoints: 50,
          bonusEarnings: 0.30
        },
        reputation_guardian: {
          name: 'Guardião de Reputação',
          description: 'Manteve 100 pontos de reputação por 60 dias.',
          icon: '🛡️',
          bonusPoints: 30,
          bonusEarnings: 0.10
        },
        specialist: {
          name: 'Especialista',
          description: 'Oferece 5 tipos diferentes de serviços.',
          icon: '🎯',
          bonusPoints: 20,
          bonusEarnings: 0.08
        }
      };

      const achievementData = achievements[type] || {};

      // Verificar se já tem
      const existing = await prisma.cleanerAchievement.findUnique({
        where: {
          cleanerId_type: {
            cleanerId,
            type
          }
        }
      });

      if (existing) {
        // Subir nível
        let newLevel = existing.level + 1;
        if (newLevel > 3) newLevel = 3;

        return await prisma.cleanerAchievement.update({
          where: { id: existing.id },
          data: {
            level: newLevel,
            progress: 0,
            bonusEarnings: achievementData.bonusEarnings || 0,
            bonusPoints: achievementData.bonusPoints || 0,
            updatedAt: new Date()
          }
        });
      }

      // Criar nova
      return await prisma.cleanerAchievement.create({
        data: {
          cleanerId,
          type,
          name: achievementData.name || 'Conquista Desbloqueada',
          description: achievementData.description || '',
          icon: achievementData.icon || '🎯',
          level: 1,
          progress: 0,
          bonusPoints: achievementData.bonusPoints || 0,
          bonusEarnings: achievementData.bonusEarnings || 0,
          awardedFor: data.awardedFor || 'system',
          awardedBy: data.awardedBy || 'system'
        }
      });
    } catch (error) {
      console.error('Erro ao desbloquear conquista do faxineiro:', error);
      throw error;
    }
  }

  /**
   * Atualizar progresso de uma conquista
   * @param {string} achievementId - ID da conquista
   * @param {number} newProgress - Novo progresso (0-100)
   */
  async updateProgress(achievementId, newProgress, isUserAchievement = true) {
    try {
      const model = isUserAchievement ? 'userAchievement' : 'cleanerAchievement';
      
      const data = {
        progress: Math.min(newProgress, 100),
        updatedAt: new Date()
      };

      // Se completou (100%), considerar como próximo nível
      if (newProgress >= 100) {
        data.progress = 0;
        data.level = { increment: 1 };
      }

      if (isUserAchievement) {
        return await prisma.userAchievement.update({
          where: { id: achievementId },
          data
        });
      } else {
        return await prisma.cleanerAchievement.update({
          where: { id: achievementId },
          data
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  /**
   * Obter todas as conquistas de um usuário
   * @param {string} userId - ID do usuário
   */
  async getUserAchievements(userId) {
    try {
      return await prisma.userAchievement.findMany({
        where: { userId },
        orderBy: [
          { unlockedAt: 'desc' },
          { type: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      throw error;
    }
  }

  /**
   * Obter todas as conquistas de um faxineiro
   * @param {string} cleanerId - ID do faxineiro
   */
  async getCleanerAchievements(cleanerId) {
    try {
      return await prisma.cleanerAchievement.findMany({
        where: { cleanerId },
        orderBy: [
          { unlockedAt: 'desc' },
          { type: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Erro ao buscar conquistas do faxineiro:', error);
      throw error;
    }
  }

  /**
   * Obter conquistas desbloqueadas (apenas níveis finais)
   * @param {string} userId - ID do usuário
   */
  async getUnlockedUserAchievements(userId) {
    try {
      return await prisma.userAchievement.findMany({
        where: {
          userId,
          level: { gte: 1 }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar conquistas desbloqueadas:', error);
      throw error;
    }
  }

  /**
   * Obter badges principais de um faxineiro
   * @param {string} cleanerId - ID do faxineiro
   */
  async getCleanerMainBadges(cleanerId) {
    try {
      // Pegar conquistas de maior nível
      const achievements = await prisma.cleanerAchievement.findMany({
        where: { cleanerId },
        orderBy: [
          { level: 'desc' },
          { unlockedAt: 'desc' }
        ],
        take: 5
      });

      return achievements.map(a => ({
        name: a.name,
        icon: a.icon,
        level: a.level,
        type: a.type,
        bonusEarnings: a.bonusEarnings
      }));
    } catch (error) {
      console.error('Erro ao buscar badges principais:', error);
      throw error;
    }
  }

  /**
   * Calcular bônus total de uma conquista
   * @param {string} cleanerId - ID do faxineiro
   */
  async calculateTotalAchievementBonus(cleanerId) {
    try {
      const achievements = await prisma.cleanerAchievement.findMany({
        where: { cleanerId }
      });

      let totalBonus = 0;
      achievements.forEach(a => {
        totalBonus += (a.bonusEarnings * 100); // converter para % de bônus
      });

      // Máximo 30% de bônus
      return Math.min(totalBonus, 30);
    } catch (error) {
      console.error('Erro ao calcular bônus:', error);
      throw error;
    }
  }

  /**
   * Atualizar conquista baseado em métrica
   * Verifica automaticamente se alguma conquista foi desbloqueada
   */
  async checkAndUnlockAchievements(userId, cleanerId, metric) {
    try {
      if (userId) {
        // Para usuários
        if (metric.totalBookings === 1) {
          await this.unlockUserAchievement(userId, 'first_booking');
        } else if (metric.totalBookings === 5) {
          await this.unlockUserAchievement(userId, 'five_bookings');
        } else if (metric.totalBookings === 50) {
          await this.unlockUserAchievement(userId, 'fifty_bookings');
        } else if (metric.totalBookings === 100) {
          await this.unlockUserAchievement(userId, 'hundred_bookings');
        }

        // Verificar avaliação perfeita
        if (metric.consecutiveRatings === 5) {
          await this.unlockUserAchievement(userId, 'perfect_rating');
        }

        // Usuário confiável
        if (metric.reputationPoints > 90 && metric.daysAbove90 === 30) {
          await this.unlockUserAchievement(userId, 'trusted_user');
        }
      }

      if (cleanerId) {
        // Para faxineiros
        if (metric.totalBookings === 1) {
          await this.unlockCleanerAchievement(cleanerId, 'first_booking');
        } else if (metric.consecutiveStars === 10) {
          await this.unlockCleanerAchievement(cleanerId, 'five_star_master');
        } else if (metric.avgResponseTime < 5 && metric.daysMaintained === 30) {
          await this.unlockCleanerAchievement(cleanerId, 'speed_demon');
        } else if (metric.completionRate >= 0.98) {
          await this.unlockCleanerAchievement(cleanerId, 'completion_master');
        }

        // Top performer (top 5%)
        if (metric.topPerformer) {
          await this.unlockCleanerAchievement(cleanerId, 'top_performer', {
            awardedFor: 'top_performer_ranking'
          });
        }

        // Master cleaner
        if (metric.totalBookings >= 100 && metric.avgRating >= 4.8) {
          await this.unlockCleanerAchievement(cleanerId, 'master_cleaner');
        }

        // Especialista
        if (metric.serviceTypesOffered >= 5) {
          await this.unlockCleanerAchievement(cleanerId, 'specialist');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      // Não lançar erro, apenas registrar
    }
  }

  /**
   * Obter ranking de usuários por conquistas
   */
  async getUserAchievementRanking(limit = 10) {
    try {
      const users = await prisma.user.findMany({
        include: {
          achievements: {
            take: 3,
            orderBy: { level: 'desc' }
          }
        },
        orderBy: {
          achievements: {
            _count: 'desc'
          }
        },
        take: limit
      });

      return users.map(u => ({
        id: u.id,
        name: u.name,
        achievementCount: u.achievements.length,
        badges: u.achievements.slice(0, 3)
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  }

  /**
   * Obter ranking de faxineiros por conquistas
   */
  async getCleanerAchievementRanking(limit = 10) {
    try {
      const cleaners = await prisma.cleaner.findMany({
        include: {
          achievements: {
            take: 3,
            orderBy: { level: 'desc' }
          }
        },
        orderBy: {
          achievements: {
            _count: 'desc'
          }
        },
        take: limit
      });

      return cleaners.map(c => ({
        id: c.id,
        name: c.name,
        achievementCount: c.achievements.length,
        badges: c.achievements.slice(0, 3),
        totalBonusEarnings: c.achievements.reduce((sum, a) => sum + a.bonusEarnings, 0)
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking de faxineiros:', error);
      throw error;
    }
  }
}

module.exports = new AchievementService();
