const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RegionService {
  /**
   * Cria ou atualiza preferências de região de um usuário
   * @param {string} userId - ID do usuário
   * @param {object} regionData - Dados de região
   * @returns {object} - Preferências de região criadas/atualizadas
   */
  static async setRegionPreferences(userId, regionData) {
    try {
      const {
        regions = [],
        cities = [],
        maxDistance = 20,
        isQuickMode = false,
        quickModeRegion = null,
      } = regionData;

      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Procurar preferência existente
      const existingPref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (existingPref) {
        // Atualizar
        const updated = await prisma.regionPreference.update({
          where: { id: existingPref.id },
          data: {
            regions: regions.length > 0 ? regions : existingPref.regions,
            cities: cities.length > 0 ? cities : existingPref.cities,
            maxDistance,
            isQuickMode,
            quickModeRegion,
          },
        });

        return {
          success: true,
          regionPreference: updated,
          message: 'Preferências de região atualizadas',
        };
      } else {
        // Criar nova
        const newPref = await prisma.regionPreference.create({
          data: {
            userId,
            regions,
            cities,
            maxDistance,
            isQuickMode,
            quickModeRegion,
          },
        });

        return {
          success: true,
          regionPreference: newPref,
          message: 'Preferências de região criadas',
        };
      }
    } catch (error) {
      console.error('Erro ao definir preferências:', error.message);
      throw error;
    }
  }

  /**
   * Ativa modo rápido para um usuário (seleciona rapidamente uma região)
   * @param {string} userId - ID do usuário
   * @param {string} region - Região selecionada
   * @returns {object} - Modo rápido ativado
   */
  static async setQuickMode(userId, region) {
    try {
      const pref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (!pref) {
        throw new Error('Preferências de região não encontradas');
      }

      const updated = await prisma.regionPreference.update({
        where: { id: pref.id },
        data: {
          isQuickMode: true,
          quickModeRegion: region,
        },
      });

      return {
        success: true,
        regionPreference: updated,
        message: `Modo rápido ativado para a região: ${region}`,
      };
    } catch (error) {
      console.error('Erro ao ativar modo rápido:', error.message);
      throw error;
    }
  }

  /**
   * Desativa modo rápido para um usuário
   * @param {string} userId - ID do usuário
   * @returns {object} - Modo rápido desativado
   */
  static async disableQuickMode(userId) {
    try {
      const pref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (!pref) {
        throw new Error('Preferências de região não encontradas');
      }

      const updated = await prisma.regionPreference.update({
        where: { id: pref.id },
        data: {
          isQuickMode: false,
          quickModeRegion: null,
        },
      });

      return {
        success: true,
        regionPreference: updated,
        message: 'Modo rápido desativado',
      };
    } catch (error) {
      console.error('Erro ao desativar modo rápido:', error.message);
      throw error;
    }
  }

  /**
   * Obtém preferências de região de um usuário
   * @param {string} userId - ID do usuário
   * @returns {object} - Preferências de região
   */
  static async getUserRegionPreferences(userId) {
    try {
      const pref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (!pref) {
        return {
          userId,
          regions: [],
          cities: [],
          maxDistance: 20,
          isQuickMode: false,
          quickModeRegion: null,
          message: 'Usuário ainda não tem preferências configuradas',
        };
      }

      return pref;
    } catch (error) {
      console.error('Erro ao buscar preferências:', error.message);
      throw error;
    }
  }

  /**
   * Busca limpadores disponíveis por região
   * @param {string} userId - ID do usuário
   * @param {string} region - Região (opcional - se não fornecido, usa modo rápido ou preferências)
   * @param {string} city - Cidade (opcional)
   * @param {number} limit - Limite de registros
   * @returns {array} - Array com limpadores disponíveis
   */
  static async findCleanersByRegion(userId, region = null, city = null, limit = 50) {
    try {
      let searchRegion = region;
      let searchCity = city;

      // Se não forneceu região, buscar das preferências do usuário
      if (!searchRegion) {
        const pref = await this.getUserRegionPreferences(userId);

        if (pref.isQuickMode && pref.quickModeRegion) {
          searchRegion = pref.quickModeRegion;
        } else if (pref.regions && pref.regions.length > 0) {
          searchRegion = pref.regions[0]; // Usar primeira região padrão
        } else {
          throw new Error(
            'Nenhuma região configurada. Configure suas preferências primeiro.'
          );
        }
      }

      // Buscar limpadores
      const cleaners = await prisma.cleaner.findMany({
        where: {
          region: {
            contains: searchRegion,
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
          region: true,
          bio: true,
          photo: true,
          averageRating: true,
          reviewCount: true,
          totalBookings: true,
          topCleanerBadge: true,
          agilityScore: true,
          reputationPoints: true,
        },
        orderBy: [
          { topCleanerBadge: 'desc' },
          { averageRating: 'desc' },
          { reputationPoints: 'desc' },
        ],
        take: limit,
      });

      return {
        success: true,
        region: searchRegion,
        city: searchCity,
        count: cleaners.length,
        cleaners,
      };
    } catch (error) {
      console.error('Erro ao buscar limpadores:', error.message);
      throw error;
    }
  }

  /**
   * Busca limpadores em múltiplas regiões
   * @param {string} userId - ID do usuário
   * @param {array} regions - Array de regiões
   * @param {number} limit - Limite de registros por região
   * @returns {object} - Limpadores agrupados por região
   */
  static async findCleanersByMultipleRegions(userId, regions = null, limit = 30) {
    try {
      let searchRegions = regions;

      // Se não forneceu regiões, buscar das preferências do usuário
      if (!searchRegions || searchRegions.length === 0) {
        const pref = await this.getUserRegionPreferences(userId);

        if (pref.regions && pref.regions.length > 0) {
          searchRegions = pref.regions;
        } else {
          throw new Error(
            'Nenhuma região configurada. Configure suas preferências primeiro.'
          );
        }
      }

      // Buscar limpadores em cada região
      const resultsByRegion = {};

      for (const region of searchRegions) {
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
            region: true,
            bio: true,
            photo: true,
            averageRating: true,
            reviewCount: true,
            totalBookings: true,
            topCleanerBadge: true,
            agilityScore: true,
          },
          orderBy: [
            { topCleanerBadge: 'desc' },
            { averageRating: 'desc' },
          ],
          take: limit,
        });

        resultsByRegion[region] = {
          count: cleaners.length,
          cleaners,
        };
      }

      return {
        success: true,
        regions: searchRegions,
        results: resultsByRegion,
      };
    } catch (error) {
      console.error('Erro ao buscar limpadores:', error.message);
      throw error;
    }
  }

  /**
   * Adiciona uma região às preferências do usuário
   * @param {string} userId - ID do usuário
   * @param {string} region - Região a adicionar
   * @returns {object} - Preferências atualizadas
   */
  static async addRegion(userId, region) {
    try {
      const pref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (!pref) {
        throw new Error('Preferências de região não encontradas');
      }

      const updatedRegions = Array.from(
        new Set([...pref.regions, region])
      );

      const updated = await prisma.regionPreference.update({
        where: { id: pref.id },
        data: { regions: updatedRegions },
      });

      return {
        success: true,
        regionPreference: updated,
        message: `Região ${region} adicionada`,
      };
    } catch (error) {
      console.error('Erro ao adicionar região:', error.message);
      throw error;
    }
  }

  /**
   * Remove uma região das preferências do usuário
   * @param {string} userId - ID do usuário
   * @param {string} region - Região a remover
   * @returns {object} - Preferências atualizadas
   */
  static async removeRegion(userId, region) {
    try {
      const pref = await prisma.regionPreference.findFirst({
        where: { userId },
      });

      if (!pref) {
        throw new Error('Preferências de região não encontradas');
      }

      const updatedRegions = pref.regions.filter((r) => r !== region);

      const updated = await prisma.regionPreference.update({
        where: { id: pref.id },
        data: { regions: updatedRegions },
      });

      return {
        success: true,
        regionPreference: updated,
        message: `Região ${region} removida`,
      };
    } catch (error) {
      console.error('Erro ao remover região:', error.message);
      throw error;
    }
  }

  /**
   * Lista todas as regiões cadastradas (para sistema)
   * @returns {array} - Array com todas as regiões únicas
   */
  static async getAllRegions() {
    try {
      const cleaners = await prisma.cleaner.findMany({
        select: {
          region: true,
        },
        distinct: ['region'],
      });

      const regions = cleaners.map((c) => c.region).sort();

      return {
        success: true,
        count: regions.length,
        regions,
      };
    } catch (error) {
      console.error('Erro ao buscar regiões:', error.message);
      throw error;
    }
  }
}

module.exports = RegionService;
