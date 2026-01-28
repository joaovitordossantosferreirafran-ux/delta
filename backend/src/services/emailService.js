const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendBookingConfirmation(email, bookingDetails) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@leidycleaner.com',
      subject: 'Agendamento Confirmado - Leidy Cleaner',
      html: `
        <h2>Agendamento Confirmado!</h2>
        <p>Olá ${bookingDetails.userName},</p>
        <p>Seu agendamento foi confirmado com sucesso!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes do Agendamento</h3>
          <p><strong>Faxineira:</strong> ${bookingDetails.cleanerName}</p>
          <p><strong>Data:</strong> ${bookingDetails.date}</p>
          <p><strong>Horário:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
          <p><strong>Localização:</strong> ${bookingDetails.address}</p>
          <p><strong>Valor:</strong> R$ ${bookingDetails.price.toFixed(2)}</p>
          <p><strong>Status:</strong> Confirmado</p>
        </div>
        
        <p>Você pode gerenciar seu agendamento em: <a href="${process.env.FRONTEND_URL}/bookings/${bookingDetails.bookingId}">Meus Agendamentos</a></p>
        
        <p>Em caso de dúvidas, entre em contato conosco via WhatsApp: +55 51 8030-3740</p>
        
        <p>Obrigado por usar Leidy Cleaner!</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Email de confirmação enviado para:', email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async sendReminderEmail(email, bookingDetails) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@leidycleaner.com',
      subject: 'Lembrete - Agendamento Amanhã - Leidy Cleaner',
      html: `
        <h2>Lembrete de Agendamento</h2>
        <p>Olá ${bookingDetails.userName},</p>
        <p>Este é um lembrete de que você tem um agendamento marcado para amanhã!</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes do Agendamento</h3>
          <p><strong>Faxineira:</strong> ${bookingDetails.cleanerName}</p>
          <p><strong>Horário:</strong> ${bookingDetails.startTime}</p>
          <p><strong>Localização:</strong> ${bookingDetails.address}</p>
        </div>
        
        <p>Se precisar remarcar ou cancelar, acesse: <a href="${process.env.FRONTEND_URL}/bookings/${bookingDetails.bookingId}">Meus Agendamentos</a></p>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      throw error;
    }
  }

  async sendPaymentReceipt(email, paymentDetails) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@leidycleaner.com',
      subject: 'Recibo de Pagamento - Leidy Cleaner',
      html: `
        <h2>Pagamento Confirmado</h2>
        <p>Obrigado por usar Leidy Cleaner!</p>
        
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalhes do Pagamento</h3>
          <p><strong>ID da Transação:</strong> ${paymentDetails.transactionId}</p>
          <p><strong>Valor:</strong> R$ ${paymentDetails.amount.toFixed(2)}</p>
          <p><strong>Método:</strong> ${paymentDetails.method}</p>
          <p><strong>Data:</strong> ${paymentDetails.date}</p>
        </div>
        
        <p>Seu agendamento está confirmado. Uma faxineira entrará em contato em breve.</p>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Erro ao enviar recibo:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
