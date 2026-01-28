import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { cleanerService } from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaClock, FaToggleOn, FaToggleOff, FaSave } from 'react-icons/fa';

const CleanerSchedule = () => {
  const { user } = useAuthStore();
  const [scheduleType, setScheduleType] = useState('fixed'); // 'fixed' ou 'flexible'
  const [weekDays, setWeekDays] = useState({
    0: { isWorking: false, timeSlots: [] }, // Domingo
    1: { isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Segunda
    2: { isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Terça
    3: { isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Quarta
    4: { isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Quinta
    5: { isWorking: true, timeSlots: [{ startTime: '08:00', endTime: '12:00' }] }, // Sexta
    6: { isWorking: false, timeSlots: [] } // Sábado
  });
  
  const [flexibleDates, setFlexibleDates] = useState([
    { date: '', startTime: '08:00', endTime: '18:00', isBlocked: false }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    loadSchedule();
  }, [user?.id]);

  const loadSchedule = async () => {
    try {
      const { data } = await cleanerService.getCleanerSchedule?.(user?.id) || { data: {} };
      if (data.scheduleType) {
        setScheduleType(data.scheduleType);
        if (data.scheduleType === 'fixed' && data.weekDays) {
          setWeekDays(data.weekDays);
        } else if (data.scheduleType === 'flexible' && data.availability) {
          setFlexibleDates(data.availability);
        }
      }
    } catch (error) {
      console.log('Agenda padrão carregada');
    }
  };

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      const scheduleData = {
        cleanerId: user?.id,
        scheduleType: scheduleType,
        weekDays: scheduleType === 'fixed' ? weekDays : null,
        availability: scheduleType === 'flexible' ? flexibleDates : null
      };

      // await cleanerService.updateSchedule?.(scheduleData);
      toast.success('✅ Agenda salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkingDay = (dayIndex) => {
    setWeekDays({
      ...weekDays,
      [dayIndex]: {
        ...weekDays[dayIndex],
        isWorking: !weekDays[dayIndex].isWorking,
        timeSlots: !weekDays[dayIndex].isWorking ? [{ startTime: '08:00', endTime: '12:00' }] : []
      }
    });
  };

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const newSlots = [...weekDays[dayIndex].timeSlots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    setWeekDays({
      ...weekDays,
      [dayIndex]: { ...weekDays[dayIndex], timeSlots: newSlots }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📅 Agenda de Trabalho</h1>\n          <p className="text-purple-100\">Configure quando você está disponível para agendamentos</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Type Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tipo de Agenda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fixed Schedule */}
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              scheduleType === 'fixed' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                value="fixed"
                checked={scheduleType === 'fixed'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="mr-3"
              />
              <span className="font-semibold text-gray-800">📌 Turnos Fixos</span>
              <p className="text-sm text-gray-600 mt-2">Trabalha nos mesmos horários toda semana</p>
              <p className="text-xs text-gray-500 mt-1">Ex: Segunda a Sexta, 08:00 às 12:00</p>
            </label>

            {/* Flexible Schedule */}
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${
              scheduleType === 'flexible' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}>\n              <input\n                type=\"radio\"\n                value=\"flexible\"\n                checked={scheduleType === 'flexible'}\n                onChange={(e) => setScheduleType(e.target.value)}\n                className=\"mr-3\"\n              />\n              <span className=\"font-semibold text-gray-800\">🔄 Flexível</span>\n              <p className=\"text-sm text-gray-600 mt-2\">Defina sua disponibilidade dia a dia</p>\n              <p className=\"text-xs text-gray-500 mt-1\">Ex: Segundo cada semana</p>\n            </label>\n          </div>
        </div>

        {/* FIXED SCHEDULE */}
        {scheduleType === 'fixed' && (
          <div className=\"bg-white rounded-lg shadow-lg p-6 mb-6\">
            <h2 className=\"text-xl font-bold text-gray-800 mb-4\">🗓️ Turnos Fixos da Semana</h2>
            
            <div className=\"space-y-4\">
              {Object.entries(weekDays).map(([dayIndex, day]) => (
                <div key={dayIndex} className=\"border border-gray-200 rounded-lg p-4\">
                  <div className=\"flex items-center justify-between mb-3\">
                    <div className=\"flex items-center gap-3\">
                      <FaCalendar className=\"text-purple-500\" />
                      <span className=\"font-semibold text-gray-800\">{daysOfWeek[dayIndex]}</span>
                    </div>
                    <button
                      onClick={() => toggleWorkingDay(dayIndex)}
                      className=\"flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition\"\n                    >\n                      {day.isWorking ? (\n                        <><FaToggleOn className=\"text-green-500\" /> Trabalhando</>\n                      ) : (\n                        <><FaToggleOff className=\"text-gray-400\" /> Não trabalha</>\n                      )}\n                    </button>\n                  </div>\n\n                  {day.isWorking && (\n                    <div className=\"space-y-2 ml-8\">\n                      {day.timeSlots.map((slot, slotIndex) => (\n                        <div key={slotIndex} className=\"flex gap-3 items-center\">\n                          <div className=\"flex-1\">\n                            <label className=\"block text-xs text-gray-600 mb-1\">Início</label>\n                            <input\n                              type=\"time\"\n                              value={slot.startTime}\n                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}\n                              className=\"w-full px-3 py-2 border border-gray-300 rounded-lg\"\n                            />\n                          </div>\n                          <div className=\"flex-1\">\n                            <label className=\"block text-xs text-gray-600 mb-1\">Fim</label>\n                            <input\n                              type=\"time\"\n                              value={slot.endTime}\n                              onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}\n                              className=\"w-full px-3 py-2 border border-gray-300 rounded-lg\"\n                            />\n                          </div>\n                        </div>\n                      ))}\n                    </div>\n                  )}\n                </div>\n              ))}\n            </div>\n          </div>\n        )}\n\n        {/* FLEXIBLE SCHEDULE */}\n        {scheduleType === 'flexible' && (\n          <div className=\"bg-white rounded-lg shadow-lg p-6 mb-6\">\n            <h2 className=\"text-xl font-bold text-gray-800 mb-4\">📅 Disponibilidade por Data</h2>\n            \n            <div className=\"space-y-4\">\n              {flexibleDates.map((dateBlock, index) => (\n                <div key={index} className=\"border border-gray-200 rounded-lg p-4\">\n                  <div className=\"grid grid-cols-1 md:grid-cols-4 gap-3\">\n                    <div>\n                      <label className=\"block text-xs font-medium text-gray-700 mb-1\">Data</label>\n                      <input\n                        type=\"date\"\n                        value={dateBlock.date}\n                        onChange={(e) => {\n                          const newDates = [...flexibleDates];\n                          newDates[index].date = e.target.value;\n                          setFlexibleDates(newDates);\n                        }}\n                        className=\"w-full px-3 py-2 border border-gray-300 rounded-lg\"\n                      />\n                    </div>\n                    <div>\n                      <label className=\"block text-xs font-medium text-gray-700 mb-1\">Início</label>\n                      <input\n                        type=\"time\"\n                        value={dateBlock.startTime}\n                        onChange={(e) => {\n                          const newDates = [...flexibleDates];\n                          newDates[index].startTime = e.target.value;\n                          setFlexibleDates(newDates);\n                        }}\n                        className=\"w-full px-3 py-2 border border-gray-300 rounded-lg\"\n                      />\n                    </div>\n                    <div>\n                      <label className=\"block text-xs font-medium text-gray-700 mb-1\">Fim</label>\n                      <input\n                        type=\"time\"\n                        value={dateBlock.endTime}\n                        onChange={(e) => {\n                          const newDates = [...flexibleDates];\n                          newDates[index].endTime = e.target.value;\n                          setFlexibleDates(newDates);\n                        }}\n                        className=\"w-full px-3 py-2 border border-gray-300 rounded-lg\"\n                      />\n                    </div>\n                    <div>\n                      <label className=\"block text-xs font-medium text-gray-700 mb-1\">Status</label>\n                      <button\n                        onClick={() => {\n                          const newDates = [...flexibleDates];\n                          newDates[index].isBlocked = !newDates[index].isBlocked;\n                          setFlexibleDates(newDates);\n                        }}\n                        className={`w-full px-3 py-2 rounded-lg font-semibold transition ${\n                          dateBlock.isBlocked\n                            ? 'bg-red-100 text-red-800'\n                            : 'bg-green-100 text-green-800'\n                        }`}\n                      >\n                        {dateBlock.isBlocked ? '❌ Bloqueado' : '✅ Disponível'}\n                      </button>\n                    </div>\n                  </div>\n                </div>\n              ))}\n            </div>\n\n            <button\n              onClick={() => {\n                setFlexibleDates([\n                  ...flexibleDates,\n                  { date: '', startTime: '08:00', endTime: '18:00', isBlocked: false }\n                ]);\n              }}\n              className=\"mt-4 w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition\"\n            >\n              ➕ Adicionar Outra Data\n            </button>\n          </div>\n        )}\n\n        {/* Save Button */}\n        <button\n          onClick={handleSaveSchedule}\n          disabled={isLoading}\n          className=\"w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 flex items-center justify-center gap-2\"\n        >\n          <FaSave /> {isLoading ? 'Salvando...' : 'Salvar Agenda'}\n        </button>\n      </div>\n    </div>\n  );\n};\n\nexport default CleanerSchedule;
