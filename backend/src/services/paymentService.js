const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mercadopago = require('mercadopago');

// Configure MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

class PaymentService {
  // Stripe Payment Intent
  async createStripePaymentIntent(amount, currency = 'brl', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: process.env.STRIPE_PUBLIC_KEY
      };
    } catch (error) {
      const errorMessage = error?.message || 'Erro ao criar payment intent';
      throw new Error(`[Stripe] ${errorMessage}`);
    }
  }

  // Confirm Stripe Payment
  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      const errorMessage = error?.message || 'Erro ao confirmar pagamento';
      throw new Error(`[Stripe] ${errorMessage}`);
    }
  }

  // MercadoPago Preference (for Checkout Pro)
  async createMercadopagoPreference(bookingDetails) {
    try {
      const preference = {
        items: [
          {
            title: `Serviço de Limpeza - ${bookingDetails.serviceType}`,
            description: `Agendamento em ${bookingDetails.date}`,
            quantity: 1,
            unit_price: bookingDetails.amount
          }
        ],
        payer: {
          email: bookingDetails.email,
          name: bookingDetails.userName
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        external_reference: bookingDetails.bookingId,
        notification_url: `${process.env.API_URL}/api/payments/webhook/mercadopago`
      };

      const response = await mercadopago.preferences.create(preference);
      return {
        preferenceId: response.body.id,
        initPoint: response.body.init_point
      };
    } catch (error) {
      console.error('Erro ao criar preferência MercadoPago:', error);
      throw error;
    }
  }

  // Verify Stripe Webhook
  async verifyStripeWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('Erro ao verificar webhook Stripe:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    return {
      methods: [
        {
          id: 'card',
          name: 'Cartão de Crédito',
          provider: 'stripe',
          icon: 'credit-card'
        },
        {
          id: 'pix',
          name: 'PIX',
          provider: 'mercadopago',
          icon: 'wallet'
        },
        {
          id: 'boleto',
          name: 'Boleto',
          provider: 'mercadopago',
          icon: 'receipt'
        }
      ]
    };
  }
}

module.exports = new PaymentService();
