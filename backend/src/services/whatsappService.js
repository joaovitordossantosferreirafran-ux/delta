const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class WhatsAppService {
  async sendBookingNotification(phoneNumber, bookingDetails) {
    try {
      const message = `
Oi ${bookingDetails.userName}! 👋

Sua limpeza foi agendada com sucesso! ✅

📅 Data: ${bookingDetails.date}
🕐 Horário: ${bookingDetails.startTime}
📍 Local: ${bookingDetails.address}
💰 Valor: R$ ${bookingDetails.price.toFixed(2)}

Sua faxineira é: ${bookingDetails.cleanerName} ⭐

Qualquer dúvida, estamos aqui! 😊
      `.trim();

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${this.formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER)}`,
        to: `whatsapp:${this.formatPhoneNumber(phoneNumber)}`
      });

      console.log('WhatsApp enviado:', response.sid);
      return { success: true, messageId: response.sid };
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }

  async sendCleanerNotification(phoneNumber, bookingDetails) {
    try {
      const message = `
Oi ${bookingDetails.cleanerName}! 👋

Você tem um novo agendamento! 🎉

📅 Data: ${bookingDetails.date}
🕐 Horário: ${bookingDetails.startTime}
📍 Local: ${bookingDetails.address}
👤 Cliente: ${bookingDetails.userName}
📞 Contato: ${bookingDetails.userPhone}

Aceite ou recuse o agendamento no app.
      `.trim();

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${this.formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER)}`,
        to: `whatsapp:${this.formatPhoneNumber(phoneNumber)}`
      });

      return { success: true, messageId: response.sid };
    } catch (error) {
      console.error('Erro ao enviar notificação para faxineira:', error);
      throw error;
    }
  }

  async sendCancellationNotification(phoneNumber, bookingDetails) {
    try {
      const message = `
Oi ${bookingDetails.userName}! 😢

Seu agendamento foi cancelado.

Agendamento: ${bookingDetails.date} às ${bookingDetails.startTime}
Motivo: ${bookingDetails.reason || 'Solicitado pelo usuário'}

Se foi um engano, você pode agendar novamente!
      `.trim();

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${this.formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER)}`,
        to: `whatsapp:${this.formatPhoneNumber(phoneNumber)}`
      });

      return { success: true, messageId: response.sid };
    } catch (error) {
      console.error('Erro ao enviar cancelamento:', error);
      throw error;
    }
  }

  formatPhoneNumber(phone) {
    // Ensure phone starts with + and only has numbers (except +)
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }
}

module.exports = new WhatsAppService();
