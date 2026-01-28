import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, cleaner } = location.state || {};
  const [step, setStep] = useState('summary'); // summary, payment, confirmation

  if (!booking || !cleaner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Agendamento não encontrado</p>
          <button
            onClick={() => navigate('/cleaners')}
            className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg"
          >
            Voltar para Faxineiras
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePaymentClick = () => {
    navigate(`/payment/${booking.id || 'new'}`, {
      state: { booking, cleaner }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cleaners')}
            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Resumo do Agendamento</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Agendamento */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card da Faxineira */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Faxineira Selecionada</h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {cleaner.photo ? (
                    <img src={cleaner.photo} alt={cleaner.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '👩‍🔧'
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{cleaner.name}</h3>
                  <div className="flex items-center gap-2 text-yellow-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{cleaner.averageRating.toFixed(1)} ({cleaner.reviewCount} avaliações)</p>
                  {cleaner.verified && (
                    <p className="text-sm text-green-600 font-semibold mt-2">✓ Verificada</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do Agendamento */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detalhes do Agendamento</h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">📅 Data</span>
                  <span className="text-gray-800 font-semibold">{formatDate(booking.date)}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">⏰ Horário</span>
                  <span className="text-gray-800 font-semibold">
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">📍 Local</span>
                  <span className="text-gray-800 font-semibold text-right max-w-xs">{booking.address}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">🧹 Tipo de Serviço</span>
                  <span className="text-gray-800 font-semibold">
                    {booking.serviceType === 'standard' && 'Limpeza Padrão'}
                    {booking.serviceType === 'deep' && 'Limpeza Profunda'}
                    {booking.serviceType === 'eco' && 'Limpeza Ecológica'}
                  </span>
                </div>
                {booking.notes && (
                  <div>
                    <span className="text-gray-600 font-medium">📝 Observações</span>
                    <p className="text-gray-800 mt-2">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo de Preço (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo do Pagamento</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Serviço de limpeza</span>
                  <span>R$ 120,00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxa de plataforma</span>
                  <span>R$ 12,00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Imposto</span>
                  <span>R$ 18,00</span>
                </div>
                
                <div className="border-t-2 border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">R$ 150,00</span>
                </div>
              </div>

              <button
                onClick={handlePaymentClick}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition text-lg"
              >
                Ir para Pagamento
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Você poderá cancelar sem custos até 24h antes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
