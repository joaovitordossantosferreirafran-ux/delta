const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  updateFixedSchedule,
  addFlexibleAvailability,
  blockPeriod,
  getSchedule,
  isAvailable,
  getAvailableSlots
} = require('../services/scheduleService');

/**
 * POST /api/schedules/:cleanerId/fixed
 * Criar/atualizar agenda de turnos fixos (segunda-domingo)
 * Body: [{ dayOfWeek: 1, isWorking: true, timeSlots: [{ startTime: "08:00", endTime: "12:00" }] }]
 */
router.post('/:cleanerId/fixed', authMiddleware, async (req, res) => {
  try {
    const { weekDaysData } = req.body;

    if (!weekDaysData || !Array.isArray(weekDaysData)) {
      return res.status(400).json({ error: 'weekDaysData deve ser um array' });
    }

    const schedule = await updateFixedSchedule(req.params.cleanerId, weekDaysData);

    res.json({
      success: true,
      message: 'Agenda de turnos fixa criada/atualizada com sucesso!',
      schedule: {
        id: schedule.id,
        scheduleType: schedule.scheduleType,
        isActive: schedule.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao criar agenda fixa' 
    });
  }
});

/**
 * POST /api/schedules/:cleanerId/flexible
 * Adicionar disponibilidade flexível (dia específico)
 * Body: { date: "2026-02-15", startTime: "08:00", endTime: "18:00" }
 */
router.post('/:cleanerId/flexible', authMiddleware, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'date, startTime e endTime são obrigatórios' 
      });
    }

    const availability = await addFlexibleAvailability(
      req.params.cleanerId,
      date,
      startTime,
      endTime
    );

    res.json({
      success: true,
      message: 'Disponibilidade adicionada com sucesso!',
      availability: {
        date: availability.date,
        startTime: availability.startTime,
        endTime: availability.endTime
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao adicionar disponibilidade' 
    });
  }
});

/**
 * POST /api/schedules/:cleanerId/block
 * Bloquear período (férias, doença, etc)
 * Body: { dateStart: "2026-02-01", dateEnd: "2026-02-10", reason: "férias" }
 */
router.post('/:cleanerId/block', authMiddleware, async (req, res) => {
  try {
    const { dateStart, dateEnd, reason } = req.body;

    if (!dateStart || !dateEnd) {
      return res.status(400).json({ 
        error: 'dateStart e dateEnd são obrigatórios' 
      });
    }

    const results = await blockPeriod(
      req.params.cleanerId,
      dateStart,
      dateEnd,
      reason || 'Período bloqueado'
    );

    res.json({
      success: true,
      message: `${results.length} dias bloqueados com sucesso!`,
      daysBlocked: results.length,
      reason: reason
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao bloquear período' 
    });
  }
});

/**
 * GET /api/schedules/:cleanerId
 * Obter agenda completa (turnos fixos ou flexível)
 */
router.get('/:cleanerId', authMiddleware, async (req, res) => {
  try {
    const schedule = await getSchedule(req.params.cleanerId);

    if (!schedule) {
      return res.json({
        success: false,
        message: 'Nenhuma agenda configurada',
        schedule: null
      });
    }

    res.json({
      success: true,
      schedule: {
        id: schedule.id,
        type: schedule.scheduleType,
        isActive: schedule.isActive,
        weekDays: schedule.weekDays || [],
        availability: schedule.availability || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar agenda' 
    });
  }
});

/**
 * GET /api/schedules/:cleanerId/available?date=2026-02-15&duration=120
 * Obter horários disponíveis em uma data (default 2h = 120 min)
 */
router.get('/:cleanerId/available', authMiddleware, async (req, res) => {
  try {
    const { date, duration = 120 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date é obrigatório (formato: YYYY-MM-DD)' });
    }

    const slots = await getAvailableSlots(
      req.params.cleanerId,
      new Date(date),
      parseInt(duration)
    );

    res.json({
      success: true,
      date: date,
      slotDuration: `${duration} minutos`,
      availableSlots: slots,
      totalSlots: slots.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao buscar horários disponíveis' 
    });
  }
});

/**
 * POST /api/schedules/verify
 * Verificar se horário específico está disponível
 * Body: { cleanerId, date, startTime, endTime }
 */
router.post('/verify', async (req, res) => {
  try {
    const { cleanerId, date, startTime, endTime } = req.body;

    if (!cleanerId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'cleanerId, date, startTime e endTime são obrigatórios' 
      });
    }

    const available = await isAvailable(
      cleanerId,
      new Date(date),
      startTime,
      endTime
    );

    res.json({
      success: available,
      available: available,
      message: available ? 'Horário disponível' : 'Horário indisponível'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Erro ao verificar disponibilidade' 
    });
  }
});

module.exports = router;
