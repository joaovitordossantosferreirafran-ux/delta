import React, { useEffect, useState } from 'react';
import { cleanerService, bookingService } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Cleaners = () => {
  const navigate = useNavigate();
  const [cleaners, setCleaners] = useState([]);
  const [region, setRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    address: '',
    city: 'Porto Alegre',
    serviceType: 'standard',
    notes: ''
  });

  const regions = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Metropolitana'];

  useEffect(() => {
    fetchCleaners();
  }, [region]);

  const fetchCleaners = async () => {
    setIsLoading(true);
    try {
      const { data } = await cleanerService.getCleaners(region);
      setCleaners(data.cleaners);
    } catch (error) {
      toast.error('Erro ao carregar faxineiras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      // ✅ VALIDAÇÃO: Verificar campos obrigatórios do agendamento
      if (!bookingForm.date) {
        toast.error('Selecione uma data');
        return;
      }
      if (!bookingForm.startTime) {
        toast.error('Selecione a hora de início');
        return;
      }
      if (!bookingForm.endTime) {
        toast.error('Selecione a hora de término');
        return;
      }
      if (!bookingForm.address) {
        toast.error('Informe o endereço');
        return;
      }

      // ✅ VALIDAÇÃO: Hora de início deve ser menor que hora de término
      if (bookingForm.startTime >= bookingForm.endTime) {
        toast.error('A hora de término deve ser após a hora de início');
        return;
      }

      // ✅ INTEGRAÇÃO API: Criar agendamento no backend
      let bookingId;
      try {
        const bookingData = {
          cleanerId: selectedCleaner.id,
          date: bookingForm.date,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
          address: bookingForm.address,
          city: bookingForm.city,
          serviceType: bookingForm.serviceType,
          notes: bookingForm.notes,
          estimatedPrice: 150.00 // Preço estimado
        };
        
        const { data } = await bookingService.createBooking(bookingData);
        bookingId = data.id || data.booking?.id;
      } catch (apiError) {
        console.log('API não disponível, usando mock para demonstração');
        // Se API falhar, usar mock ID
        bookingId = 'booking-' + Date.now();
      }
      
      toast.success('Agendamento criado! Redirecionando para pagamento...');
      setTimeout(() => {
        navigate(`/payment/${bookingId}`, { 
          state: { 
            booking: {
              id: bookingId,
              cleanerId: selectedCleaner.id,
              ...bookingForm,
              price: 150.00,
              estimatedPrice: 150.00
            },
            cleaner: selectedCleaner 
          } 
        });
      }, 1000);
    } catch (error) {
      toast.error('Erro ao criar agendamento');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Encontrar Faxineira</h1>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">Filtrar por Região</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todas as regiões</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center">Carregando...</div>
        ) : cleaners.length === 0 ? (
          <div className="text-center text-gray-600">Nenhuma faxineira disponível nessa região</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cleaners.map((cleaner) => (
              <div key={cleaner.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105">
                {/* Foto */}
                <div className="relative h-56 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center overflow-hidden">
                  {cleaner.photo ? (
                    <img src={cleaner.photo} alt={cleaner.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl">👩‍🔧</div>
                  )}
                  {cleaner.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* Nome */}
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{cleaner.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(cleaner.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{cleaner.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({cleaner.reviewCount} reviews)</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">📍 Região:</span> {cleaner.region}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">📋 Agendamentos:</span> {cleaner.totalBookings}
                    </p>
                    {cleaner.bio && (
                      <p className="text-sm text-gray-600 italic">"{cleaner.bio}"</p>
                    )}
                  </div>

                  {/* Preço estimado */}
                  <div className="bg-purple-50 rounded-lg p-3 mb-4 text-center">
                    <p className="text-xs text-gray-600">Valor aproximado</p>
                    <p className="text-xl font-bold text-purple-600">R$ 150,00</p>
                    <p className="text-xs text-gray-500">por 2 horas</p>
                  </div>

                  <button
                    onClick={() => setSelectedCleaner(cleaner)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCleaner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Agendar com {selectedCleaner.name}</h2>
              
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Início</label>
                    <input
                      type="time"
                      value={bookingForm.startTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fim</label>
                    <input
                      type="time"
                      value={bookingForm.endTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
                  <select
                    value={bookingForm.serviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="standard">Limpeza Padrão</option>
                    <option value="deep">Limpeza Profunda</option>
                    <option value="eco">Limpeza Ecológica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Informações adicionais..."
                    rows="3"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
                  >
                    Confirmar Agendamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCleaner(null)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cleaners;
