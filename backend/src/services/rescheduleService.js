const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RescheduleService {
  /**
   * Cria um novo reagendamento de uma faxina
   * @param {string} bookingId - ID do agendamento
   * @param {string} newDate - Nova data (ISO format)
   * @param {string} newStartTime - Novo horário de início (ex: "14:00")
   * @param {string} newEndTime - Novo horário de término (ex: "16:00")
   * @param {string} reason - Motivo do reagendamento
   * @param {string} initiatedBy - Quem iniciou ("user" ou "cleaner")
   * @returns {object} - Objeto com o novo agendamento
   */
  static async rescheduleBooking(
    bookingId,
    newDate,
    newStartTime,
    newEndTime,
    reason = null,
    initiatedBy = "user"
  ) {
    try {
      // Buscar agendamento original
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          cleaner: true,
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Agendamento não encontrado');
      }

      if (booking.status === 'completed') {
        throw new Error('Não é possível reagendar um agendamento já concluído');
      }

      // Verificar disponibilidade do limpador para a nova data/hora
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          cleanerId: booking.cleanerId,
          date: new Date(newDate),
          status: { in: ['confirmed', 'completed'] },
          id: { not: bookingId },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new Error(
          'Limpador não está disponível neste horário. Escolha outro horário.'
        );
      }

      // Registrar o reagendamento no histórico
      const reschedule = await prisma.bookingReschedule.create({
        data: {
          bookingId,
          originalDate: booking.date,
          originalStartTime: booking.startTime,
          originalEndTime: booking.endTime,
          newDate: new Date(newDate),
          newStartTime,
          newEndTime,
          reason,
          initiatedBy,
        },
      });

      // Atualizar o agendamento principal
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          date: new Date(newDate),
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'confirmed',
          updatedAt: new Date(),
        },
        include: {
          user: true,
          cleaner: true,
        },
      });

      // Registrar no histórico de mudanças
      await prisma.bookingHistory.create({
        data: {
          bookingId,
          action: 'rescheduled',
          details: JSON.stringify({
            from: {
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime,
            },
            to: {
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
            },
            reason,
            initiatedBy,
          }),
        },
      });

      return {
        success: true,
        booking: updatedBooking,
        reschedule,
        message: `Agendamento reagendado com sucesso para ${newDate} de ${newStartTime} a ${newEndTime}`,
      };
    } catch (error) {
      console.error('Erro ao reagendar:', error.message);
      throw error;
    }
  }

  /**
   * Obtém histórico de reagendamentos de um agendamento
   * @param {string} bookingId - ID do agendamento
   * @returns {array} - Array com todos os reagendamentos
   */
  static async getRescheduleHistory(bookingId) {
    try {
      const reschedules = await prisma.bookingReschedule.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
      });

      return reschedules;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error.message);
      throw error;
    }
  }

  /**
   * Obtém todos os reagendamentos de um limpador
   * @param {string} cleanerId - ID do limpador
   * @returns {array} - Array com todos os reagendamentos
   */
  static async getCleanerReschedules(cleanerId, limit = 50) {
    try {
      const reschedules = await prisma.bookingReschedule.findMany({
        where: {
          booking: {
            cleanerId,
          },
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return reschedules;
    } catch (error) {
      console.error('Erro ao buscar reagendamentos:', error.message);
      throw error;
    }
  }

  /**
   * Obtém todos os reagendamentos de um usuário
   * @param {string} userId - ID do usuário
   * @returns {array} - Array com todos os reagendamentos
   */
  static async getUserReschedules(userId, limit = 50) {
    try {
      const reschedules = await prisma.bookingReschedule.findMany({
        where: {
          booking: {
            userId,
          },
        },
        include: {
          booking: {
            include: {
              cleaner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return reschedules;
    } catch (error) {
      console.error('Erro ao buscar reagendamentos:', error.message);
      throw error;
    }
  }

  /**
   * Verifica quantas vezes um agendamento foi reagendado
   * @param {string} bookingId - ID do agendamento
   * @returns {number} - Número de reagendamentos
   */
  static async getResheduleCount(bookingId) {
    try {
      const count = await prisma.bookingReschedule.count({
        where: { bookingId },
      });

      return count;
    } catch (error) {
      console.error('Erro ao contar reagendamentos:', error.message);
      throw error;
    }
  }
}

module.exports = RescheduleService;
