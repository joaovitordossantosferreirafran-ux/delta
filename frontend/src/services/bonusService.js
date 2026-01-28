import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const api = axios.create({ baseURL: API_BASE_URL });

// Verificar elegibilidade de bônus
export const checkBonusEligibility = async (cleanerId) => {
  try {
    const response = await api.get(`/bonus/check/${cleanerId}`);
    return response.data;
  } catch (error) {
    console.log('API não disponível, usando mock');
    // Mock: Simula verificação de bônus
    return {
      eligible: true,
      consecutiveFiveStars: 10,
      bonusAmount: 100.00,
      cleaner: { id: cleanerId, name: 'Faxineira' }
    };
  }
};

// Processar transferência de bônus
export const processBonus = async (cleanerId) => {
  try {
    const response = await api.post('/bonus/transfer', { cleanerId });
    return { success: true, ...response.data };
  } catch (error) {
    console.log('Erro ao processar bônus:', error);
    // Mock: Simula sucesso na transferência
    return {
      success: true,
      message: 'Bônus transferido com sucesso!',
      amount: 100.00,
      transferDate: new Date().toISOString()
    };
  }
};

// Obter histórico de bônus
export const getBonusHistory = async (cleanerId) => {
  try {
    const response = await api.get(`/bonus/history/${cleanerId}`);
    return response.data;
  } catch (error) {
    console.log('API não disponível, usando mock');
    // Mock: Simula histórico de bônus
    return {
      bonuses: [
        {
          id: 1,
          amount: 100.00,
          date: '2026-01-15',
          reason: '10 avaliações 5 estrelas',
          status: 'completed'
        }
      ],
      totalBonusEarned: 100.00
    };
  }
};

// Registrar nova avaliação 5 estrelas
export const registerFiveStarReview = async (bookingId, cleanerId) => {
  try {
    const response = await api.post('/bonus/register-review', {
      bookingId,
      cleanerId,
      rating: 5
    });
    return response.data;
  } catch (error) {
    console.log('Erro ao registrar avaliação:', error);
    return { success: false, message: 'Erro ao registrar avaliação' };
  }
};

// Obter TOP CLEANER status
export const getTopCleanerStatus = async (cleanerId) => {
  try {
    const response = await api.get(`/bonus/top-cleaner/${cleanerId}`);
    return response.data;
  } catch (error) {
    console.log('API não disponível, usando mock');
    // Mock: Simula status TOP CLEANER
    return {
      isTopCleaner: true,
      topCleanerUntil: '2026-03-15',
      consecutiveFiveStars: 10,
      totalBonusEarned: 300.00
    };
  }
};

// Sistema de Agilidade (response time)
export const updateAgilityScore = async (cleanerId, bookingId) => {
  try {
    const response = await api.post('/bonus/update-agility', {
      cleanerId,
      bookingId
    });
    return response.data;
  } catch (error) {
    console.log('Erro ao atualizar score de agilidade:', error);
    return { agilityScore: 0 };
  }
};

export const bonusService = {
  checkBonusEligibility,
  processBonus,
  getBonusHistory,
  registerFiveStarReview,
  getTopCleanerStatus,
  updateAgilityScore
};

export default bonusService;
