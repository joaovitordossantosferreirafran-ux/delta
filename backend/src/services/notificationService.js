const admin = require('firebase-admin');

// Initialize Firebase (you need to download the service account JSON from Firebase)
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
} catch (error) {
  console.warn('Firebase not fully configured, notifications may not work');
}

class NotificationService {
  async sendPushNotification(deviceToken, title, message, data = {}) {
    try {
      const payload = {
        notification: {
          title: title,
          body: message
        },
        data: {
          ...data,
          click_action: data.link || '/'
        }
      };

      const response = await admin.messaging().sendToDevice(deviceToken, payload);
      console.log('Push notification enviado:', response.successCount);
      return { success: true, response };
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      throw error;
    }
  }

  async sendMulticastNotification(deviceTokens, title, message, data = {}) {
    try {
      const payload = {
        notification: {
          title: title,
          body: message
        },
        data: data
      };

      const response = await admin.messaging().sendMulticast({
        ...payload,
        tokens: deviceTokens
      });

      console.log(`Push notifications enviados: ${response.successCount}/${deviceTokens.length}`);
      return { success: true, response };
    } catch (error) {
      console.error('Erro ao enviar notificações em massa:', error);
      throw error;
    }
  }

  async subscribeToTopic(deviceToken, topic) {
    try {
      await admin.messaging().subscribeToTopic(deviceToken, topic);
      console.log(`Dispositivo inscrito no tópico: ${topic}`);
      return true;
    } catch (error) {
      console.error('Erro ao inscrever em tópico:', error);
      throw error;
    }
  }

  async sendToTopic(topic, title, message, data = {}) {
    try {
      const payload = {
        notification: {
          title: title,
          body: message
        },
        data: data
      };

      const response = await admin.messaging().sendToTopic(topic, payload);
      console.log('Notificação de tópico enviada:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Erro ao enviar notificação de tópico:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
