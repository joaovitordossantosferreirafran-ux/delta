import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const api = axios.create({ baseURL: API_BASE_URL });

// Registrar token de push notification
export const registerPushToken = async (userId, token) => {
  try {
    const response = await api.post('/notifications/register-token', {
      userId,
      token,
      platform: 'web'
    });
    return response.data;
  } catch (error) {
    console.log('Erro ao registrar token:', error);
    return { success: false };
  }
};

// Solicitar permissão e iniciar push notifications
export const initializePushNotifications = async (userId) => {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.log('Push notifications não suportadas');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Se tiver Firebase disponível, seria usado aqui
      // Por enquanto, usando mock
      console.log('Push notifications habilitadas');
      
      // Registrar token simulado
      await registerPushToken(userId, 'mock-token-' + Date.now());
      return true;
    }
  } catch (error) {
    console.log('Erro ao inicializar push:', error);
  }
  return false;
};

// Enviar notificação local para teste
export const sendLocalNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/logo192.png',
      ...options
    });
  }
};

// Notificação: Novo agendamento
export const notifyNewBooking = (cleaner, date, amount) => {
  sendLocalNotification('Novo Agendamento! 📅', {
    body: `${cleaner} agendou para ${date}. Valor: R$ ${amount}`,
    tag: 'booking-' + Date.now(),
    requireInteraction: true
  });
};

// Notificação: Pagamento recebido
export const notifyPaymentReceived = (amount) => {
  sendLocalNotification('Pagamento Recebido! 💰', {
    body: `Você recebeu R$ ${amount} pela sua limpeza`,
    tag: 'payment-' + Date.now()
  });
};

// Notificação: Bônus desbloqueado
export const notifyBonusUnlocked = () => {
  sendLocalNotification('🏆 Bônus Desbloqueado!', {
    body: 'Você atingiu 10 avaliações 5 estrelas e ganhou R$ 100!',
    tag: 'bonus-' + Date.now(),
    requireInteraction: true
  });
};

// Notificação: TOP CLEANER status
export const notifyTopCleanerStatus = () => {
  sendLocalNotification('👑 Você é TOP CLEANER!', {
    body: 'Parabéns! Você alcançou o status de TOP CLEANER por 30 dias',
    tag: 'top-cleaner-' + Date.now(),
    requireInteraction: true
  });
};

// Notificação: Avaliação ruim
export const notifyLowRating = (rating) => {
  sendLocalNotification('⚠️ Nova Avaliação', {
    body: `Você recebeu uma avaliação de ${rating} estrelas. Verifique para melhorar seu serviço`,
    tag: 'rating-' + Date.now()
  });
};

// Notificação: Cancelamento
export const notifyCancellation = (userName) => {
  sendLocalNotification('❌ Agendamento Cancelado', {
    body: `${userName} cancelou seu agendamento`,
    tag: 'cancellation-' + Date.now()
  });
};

// Notificação: Mensagem do admin
export const notifyAdminMessage = (title, message) => {
  sendLocalNotification(`📢 ${title}`, {
    body: message,
    tag: 'admin-' + Date.now(),
    requireInteraction: true
  });
};

// Ouvir mensagens do service worker
export const setupNotificationListener = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Notificação recebida:', event.data);
    });
  }
};

// Obter histórico de notificações
export const getNotificationHistory = async (userId, limit = 10) => {
  try {
    const response = await api.get(`/notifications/history/${userId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.log('Erro ao obter histórico:', error);
    // Mock
    return {
      notifications: [
        {
          id: 1,
          type: 'booking',
          title: 'Novo Agendamento',
          message: 'Maria agendou para amanhã',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
};

// Marcar notificação como lida
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.log('Erro ao marcar como lida:', error);
    return { success: false };
  }
};

// Deletar notificação
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.log('Erro ao deletar notificação:', error);
    return { success: false };
  }
};

export const notificationService = {
  registerPushToken,
  initializePushNotifications,
  sendLocalNotification,
  notifyNewBooking,
  notifyPaymentReceived,
  notifyBonusUnlocked,
  notifyTopCleanerStatus,
  notifyLowRating,
  notifyCancellation,
  notifyAdminMessage,
  setupNotificationListener,
  getNotificationHistory,
  markNotificationAsRead,
  deleteNotification
};

export default notificationService;
