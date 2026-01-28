const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Serviço de Descrição de Serviços
 * Gerencia descrições detalhadas dos serviços oferecidos por faxineiros
 */

class ServiceDescriptionService {
  /**
   * Criar descrição de serviço
   * @param {string} cleanerId - ID do faxineiro
   * @param {object} data - Dados do serviço
   */
  async createServiceDescription(cleanerId, data) {
    try {
      // Validar dados obrigatórios
      if (!data.serviceType || !data.title || !data.basePrice) {
        throw new Error('Dados incompletos: serviceType, title e basePrice são obrigatórios');
      }

      // Verificar se cleaner existe
      const cleaner = await prisma.cleaner.findUnique({
        where: { id: cleanerId }
      });

      if (!cleaner) {
        throw new Error('Faxineiro não encontrado');
      }

      // Verificar se já existe descrição deste tipo
      const existing = await prisma.serviceDescription.findUnique({
        where: {
          cleanerId_serviceType: {
            cleanerId,
            serviceType: data.serviceType
          }
        }
      });

      if (existing) {
        throw new Error('Já existe descrição para este tipo de serviço');
      }

      return await prisma.serviceDescription.create({
        data: {
          cleanerId,
          serviceType: data.serviceType,
          title: data.title,
          description: data.description || '',
          basePrice: data.basePrice,
          pricePerHour: data.pricePerHour || null,
          estimatedDuration: data.estimatedDuration || 120, // 2h padrão
          whatIncluded: data.whatIncluded || [],
          requirements: data.requirements || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          weekdaysOnly: data.weekdaysOnly || false,
          minNotice: data.minNotice || 24
        }
      });
    } catch (error) {
      console.error('Erro ao criar descrição de serviço:', error);
      throw error;
    }
  }

  /**
   * Atualizar descrição de serviço
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {object} data - Dados a atualizar
   */
  async updateServiceDescription(serviceDescriptionId, data) {
    try {
      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          title: data.title,
          description: data.description,
          basePrice: data.basePrice,
          pricePerHour: data.pricePerHour,
          estimatedDuration: data.estimatedDuration,
          whatIncluded: data.whatIncluded,
          requirements: data.requirements,
          isActive: data.isActive,
          weekdaysOnly: data.weekdaysOnly,
          minNotice: data.minNotice,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar descrição de serviço:', error);
      throw error;
    }
  }

  /**
   * Obter descrição de serviço por ID
   * @param {string} serviceDescriptionId - ID da descrição
   */
  async getServiceDescription(serviceDescriptionId) {
    try {
      return await prisma.serviceDescription.findUnique({
        where: { id: serviceDescriptionId }
      });
    } catch (error) {
      console.error('Erro ao buscar descrição de serviço:', error);
      throw error;
    }
  }

  /**
   * Obter descrições de serviço de um faxineiro
   * @param {string} cleanerId - ID do faxineiro
   */
  async getCleanerServices(cleanerId, onlyActive = true) {
    try {
      return await prisma.serviceDescription.findMany({
        where: {
          cleanerId,
          ...(onlyActive && { isActive: true })
        },
        orderBy: { serviceType: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar serviços do faxineiro:', error);
      throw error;
    }
  }

  /**
   * Obter um serviço específico de um faxineiro
   * @param {string} cleanerId - ID do faxineiro
   * @param {string} serviceType - Tipo de serviço
   */
  async getCleanerServiceByType(cleanerId, serviceType) {
    try {
      return await prisma.serviceDescription.findUnique({
        where: {
          cleanerId_serviceType: {
            cleanerId,
            serviceType
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar serviço específico:', error);
      throw error;
    }
  }

  /**
   * Listar serviços por tipo em toda plataforma
   * @param {string} serviceType - Tipo de serviço
   */
  async getServicesByType(serviceType, limit = 20) {
    try {
      return await prisma.serviceDescription.findMany({
        where: {
          serviceType,
          isActive: true
        },
        include: {
          cleaner: {
            select: {
              id: true,
              name: true,
              photo: true,
              region: true,
              averageRating: true,
              reviewCount: true
            }
          }
        },
        orderBy: { basePrice: 'asc' },
        take: limit
      });
    } catch (error) {
      console.error('Erro ao buscar serviços por tipo:', error);
      throw error;
    }
  }

  /**
   * Deletar descrição de serviço
   * @param {string} serviceDescriptionId - ID da descrição
   */
  async deleteServiceDescription(serviceDescriptionId) {
    try {
      return await prisma.serviceDescription.delete({
        where: { id: serviceDescriptionId }
      });
    } catch (error) {
      console.error('Erro ao deletar descrição de serviço:', error);
      throw error;
    }
  }

  /**
   * Alternar atividade de um serviço
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {boolean} isActive - Novo status
   */
  async toggleServiceActive(serviceDescriptionId, isActive) {
    try {
      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          isActive,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao alternar atividade do serviço:', error);
      throw error;
    }
  }

  /**
   * Obter serviços disponíveis em uma região
   * @param {string} region - Região
   * @param {string} serviceType - Tipo de serviço (opcional)
   */
  async getServicesByRegion(region, serviceType = null) {
    try {
      return await prisma.serviceDescription.findMany({
        where: {
          isActive: true,
          cleaner: {
            region,
            status: 'active',
            verified: true
          },
          ...(serviceType && { serviceType })
        },
        include: {
          cleaner: {
            select: {
              id: true,
              name: true,
              photo: true,
              averageRating: true,
              reviewCount: true,
              totalBookings: true
            }
          }
        },
        orderBy: [
          { cleaner: { averageRating: 'desc' } },
          { basePrice: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Erro ao buscar serviços por região:', error);
      throw error;
    }
  }

  /**
   * Buscar serviços com filtros complexos
   * @param {object} filters - Filtros de busca
   */
  async searchServices(filters) {
    try {
      const {
        serviceType,
        region,
        maxPrice,
        minRating,
        verified = true,
        onlyActive = true
      } = filters;

      return await prisma.serviceDescription.findMany({
        where: {
          ...(serviceType && { serviceType }),
          ...(maxPrice && { basePrice: { lte: maxPrice } }),
          ...(onlyActive && { isActive: true }),
          cleaner: {
            ...(region && { region }),
            ...(verified && { verified: true }),
            status: 'active',
            ...(minRating && { averageRating: { gte: minRating } })
          }
        },
        include: {
          cleaner: {
            select: {
              id: true,
              name: true,
              photo: true,
              region: true,
              averageRating: true,
              reviewCount: true,
              totalBookings: true
            }
          }
        },
        orderBy: [
          { cleaner: { averageRating: 'desc' } },
          { basePrice: 'asc' }
        ]
      });
    } catch (error) {
      console.error('Erro ao buscar serviços com filtros:', error);
      throw error;
    }
  }

  /**
   * Calcular preço final com base em duração
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {number} durationMinutes - Duração em minutos
   */
  async calculateServicePrice(serviceDescriptionId, durationMinutes) {
    try {
      const service = await this.getServiceDescription(serviceDescriptionId);

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      let finalPrice = service.basePrice;

      // Se tem preço por hora, calcular com base em duração
      if (service.pricePerHour) {
        const hours = durationMinutes / 60;
        const hourlyPrice = service.pricePerHour * hours;
        finalPrice = Math.max(service.basePrice, hourlyPrice);
      }

      return {
        basePrice: service.basePrice,
        pricePerHour: service.pricePerHour,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        durationMinutes
      };
    } catch (error) {
      console.error('Erro ao calcular preço do serviço:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de um serviço
   * @param {string} cleanerId - ID do faxineiro
   */
  async getCleanerServiceStats(cleanerId) {
    try {
      const services = await prisma.serviceDescription.findMany({
        where: { cleanerId }
      });

      const activeCount = services.filter(s => s.isActive).length;
      const avgPrice = services.length > 0
        ? services.reduce((sum, s) => sum + s.basePrice, 0) / services.length
        : 0;

      const serviceTypes = new Set(services.map(s => s.serviceType));

      return {
        totalServices: services.length,
        activeServices: activeCount,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        serviceTypes: Array.from(serviceTypes),
        services: services
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de serviços:', error);
      throw error;
    }
  }

  /**
   * Adicionar item ao "o que inclui"
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {string} item - Item a adicionar
   */
  async addWhatIncluded(serviceDescriptionId, item) {
    try {
      const service = await this.getServiceDescription(serviceDescriptionId);

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const updated = new Set(service.whatIncluded);
      updated.add(item);

      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          whatIncluded: Array.from(updated),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar item ao "o que inclui":', error);
      throw error;
    }
  }

  /**
   * Remover item do "o que inclui"
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {string} item - Item a remover
   */
  async removeWhatIncluded(serviceDescriptionId, item) {
    try {
      const service = await this.getServiceDescription(serviceDescriptionId);

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const updated = service.whatIncluded.filter(i => i !== item);

      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          whatIncluded: updated,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao remover item do "o que inclui":', error);
      throw error;
    }
  }

  /**
   * Adicionar requisito
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {string} requirement - Requisito a adicionar
   */
  async addRequirement(serviceDescriptionId, requirement) {
    try {
      const service = await this.getServiceDescription(serviceDescriptionId);

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const updated = new Set(service.requirements);
      updated.add(requirement);

      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          requirements: Array.from(updated),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar requisito:', error);
      throw error;
    }
  }

  /**
   * Remover requisito
   * @param {string} serviceDescriptionId - ID da descrição
   * @param {string} requirement - Requisito a remover
   */
  async removeRequirement(serviceDescriptionId, requirement) {
    try {
      const service = await this.getServiceDescription(serviceDescriptionId);

      if (!service) {
        throw new Error('Serviço não encontrado');
      }

      const updated = service.requirements.filter(r => r !== requirement);

      return await prisma.serviceDescription.update({
        where: { id: serviceDescriptionId },
        data: {
          requirements: updated,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao remover requisito:', error);
      throw error;
    }
  }
}

module.exports = new ServiceDescriptionService();
