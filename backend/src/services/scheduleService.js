const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service para gerenciar agendas de faxineiras (turnos fixos ou flexível)
 */

/**
 * Criar ou atualizar agenda de turnos fixos (segunda-domingo)
 */
async function updateFixedSchedule(cleanerId, weekDaysData) {
  try {
    // Primeiro, verifica ou cria schedule principal
    let schedule = await prisma.cleanerSchedule.findUnique({
      where: { cleanerId },
      include: { weekDays: true }
    });

    if (!schedule) {
      schedule = await prisma.cleanerSchedule.create({
        data: {
          cleanerId,
          scheduleType: 'fixed',
          isActive: true
        }
      });
    }

    // Atualiza schedule como fixed
    schedule = await prisma.cleanerSchedule.update({
      where: { id: schedule.id },
      data: {
        scheduleType: 'fixed'
      }
    });

    // Atualiza dias da semana
    for (const dayData of weekDaysData) {
      const { dayOfWeek, isWorking, timeSlots } = dayData;

      // Procura ou cria dia da semana
      let weekDay = await prisma.cleanerWeekDay.findFirst({
        where: {
          scheduleId: schedule.id,
          dayOfWeek
        }
      });

      if (!weekDay) {
        weekDay = await prisma.cleanerWeekDay.create({
          data: {
            scheduleId: schedule.id,
            cleanerId,
            dayOfWeek,
            isWorking
          }
        });
      } else {
        weekDay = await prisma.cleanerWeekDay.update({
          where: { id: weekDay.id },
          data: { isWorking }
        });
      }

      // Deleta time slots antigos
      await prisma.cleanerTimeSlot.deleteMany({
        where: { weekDayId: weekDay.id }
      });

      // Cria novos time slots se dia está ativo
      if (isWorking && timeSlots && timeSlots.length > 0) {
        for (const slot of timeSlots) {
          await prisma.cleanerTimeSlot.create({
            data: {
              weekDayId: weekDay.id,
              startTime: slot.startTime,
              endTime: slot.endTime
            }
          });
        }
      }
    }

    return schedule;
  } catch (error) {
    console.error('Erro ao atualizar agenda fixa:', error);
    throw error;
  }
}

/**
 * Adicionar disponibilidade flexível (dia específico)
 */
async function addFlexibleAvailability(cleanerId, date, startTime, endTime) {
  try {
    // Verifica ou cria schedule como flexible
    let schedule = await prisma.cleanerSchedule.findUnique({
      where: { cleanerId }
    });

    if (!schedule) {
      schedule = await prisma.cleanerSchedule.create({
        data: {
          cleanerId,
          scheduleType: 'flexible',
          isActive: true
        }
      });
    }

    // Se era fixed, muda para flexible
    if (schedule.scheduleType !== 'flexible') {
      await prisma.cleanerSchedule.update({
        where: { id: schedule.id },
        data: { scheduleType: 'flexible' }
      });
    }

    // Cria ou atualiza disponibilidade
    const availability = await prisma.cleanerAvailability.upsert({
      where: {
        cleanerId_date: {
          cleanerId,
          date
        }
      },
      update: {
        startTime,
        endTime,
        isBlocked: false
      },
      create: {
        cleanerId,
        date,
        startTime,
        endTime,
        isBlocked: false
      }
    });

    return availability;
  } catch (error) {
    console.error('Erro ao adicionar disponibilidade flexível:', error);
    throw error;
  }
}

/**
 * Bloquear período (férias, doença, etc)
 */
async function blockPeriod(cleanerId, dateStart, dateEnd, reason) {
  try {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);
    const blockDates = [];

    // Gera lista de datas entre start e end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      blockDates.push(dateStr);
    }

    // Bloqueia cada data
    const results = await Promise.all(
      blockDates.map(date =>
        prisma.cleanerAvailability.upsert({
          where: {
            cleanerId_date: { cleanerId, date }
          },
          update: {
            isBlocked: true,
            reason
          },
          create: {
            cleanerId,
            date,
            startTime: '00:00',
            endTime: '00:00',
            isBlocked: true,
            reason
          }
        })
      )
    );

    console.log(`✅ ${blockDates.length} datas bloqueadas para ${cleanerId}`);
    return results;
  } catch (error) {
    console.error('Erro ao bloquear período:', error);
    throw error;
  }
}

/**
 * Obter agenda da faxineira (turnos ou flexível)
 */
async function getSchedule(cleanerId) {
  try {
    const schedule = await prisma.cleanerSchedule.findUnique({
      where: { cleanerId },
      include: {
        weekDays: {
          include: {
            timeSlots: true
          }
        },
        cleaner: {
          select: {
            availability: {
              where: {
                isBlocked: false
              }
            }
          }
        }
      }
    });

    if (!schedule) {
      return null;
    }

    // Se flexible, busca disponibilidades próximas (30 dias)
    if (schedule.scheduleType === 'flexible') {
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const availability = await prisma.cleanerAvailability.findMany({
        where: {
          cleanerId,
          date: {
            gte: today.toISOString().split('T')[0],
            lte: in30Days.toISOString().split('T')[0]
          },
          isBlocked: false
        },
        orderBy: { date: 'asc' }
      });

      return {
        ...schedule,
        weekDays: [],
        availability
      };
    }

    return schedule;
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    throw error;
  }
}

/**
 * Verificar se faxineira está disponível em data/hora específica
 */
async function isAvailable(cleanerId, date, startTime, endTime) {
  try {
    const schedule = await prisma.cleanerSchedule.findUnique({
      where: { cleanerId },
      include: {
        weekDays: {
          include: { timeSlots: true }
        }
      }
    });

    if (!schedule) {
      return false;
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Se fixed: procura no dia da semana
    if (schedule.scheduleType === 'fixed') {
      const daySchedule = schedule.weekDays.find(w => w.dayOfWeek === dayOfWeek);
      
      if (!daySchedule || !daySchedule.isWorking) {
        return false;
      }

      // Verifica se o horário está dentro de algum slot
      return daySchedule.timeSlots.some(slot => {
        return startTime >= slot.startTime && endTime <= slot.endTime;
      });
    }

    // Se flexible: procura em disponibilidades específicas
    const dateStr = date.toISOString().split('T')[0];
    const availability = await prisma.cleanerAvailability.findUnique({
      where: {
        cleanerId_date: { cleanerId, date: dateStr }
      }
    });

    if (!availability || availability.isBlocked) {
      return false;
    }

    return startTime >= availability.startTime && endTime <= availability.endTime;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}

/**
 * Obter horários disponíveis em uma data
 */
async function getAvailableSlots(cleanerId, date, slotDuration = 120) {
  try {
    const schedule = await prisma.cleanerSchedule.findUnique({
      where: { cleanerId },
      include: {
        weekDays: {
          include: { timeSlots: true }
        }
      }
    });

    if (!schedule) {
      return [];
    }

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const slots = [];

    if (schedule.scheduleType === 'fixed') {
      const daySchedule = schedule.weekDays.find(w => w.dayOfWeek === dayOfWeek);
      
      if (!daySchedule || !daySchedule.isWorking) {
        return [];
      }

      // Gera slots a partir dos timeSlots
      daySchedule.timeSlots.forEach(slot => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);

        for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
          slots.push({
            startTime: minutesToTime(time),
            endTime: minutesToTime(time + slotDuration)
          });
        }
      });
    } else {
      // Flexible: usar disponibilidade do dia
      const dateStr = date.toISOString().split('T')[0];
      const availability = await prisma.cleanerAvailability.findUnique({
        where: {
          cleanerId_date: { cleanerId, date: dateStr }
        }
      });

      if (!availability || availability.isBlocked) {
        return [];
      }

      const startMinutes = timeToMinutes(availability.startTime);
      const endMinutes = timeToMinutes(availability.endTime);

      for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
        slots.push({
          startTime: minutesToTime(time),
          endTime: minutesToTime(time + slotDuration)
        });
      }
    }

    return slots;
  } catch (error) {
    console.error('Erro ao obter slots disponíveis:', error);
    return [];
  }
}

// Funções auxiliares
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

module.exports = {
  updateFixedSchedule,
  addFlexibleAvailability,
  blockPeriod,
  getSchedule,
  isAvailable,
  getAvailableSlots
};
