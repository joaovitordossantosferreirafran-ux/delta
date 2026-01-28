import React, { useState } from 'react';
import { FaHistory, FaFilter, FaDownload, FaStar } from 'react-icons/fa';

const BookingHistory = () => {
  const [filter, setFilter] = useState({ status: 'all', days: 30 });
  const [bookings] = useState([
    { id: 1, client: 'Maria Silva', address: 'Rua A, 123', type: 'Limpeza Profunda', date: '2026-01-20', time: '09:00', duration: '3h', amount: 150, rating: 5.0, comment: 'Excelente!' },
    { id: 2, client: 'João Santos', address: 'Av B, 456', type: 'Faxina Normal', date: '2026-01-19', time: '14:00', duration: '2h', amount: 100, rating: 4.8, comment: 'Muito bom!' },
    { id: 3, client: 'Ana Costa', address: 'Rua C, 789', type: 'Limpeza Express', date: '2026-01-18', time: '10:30', duration: '1h30m', amount: 70, rating: 5.0, comment: 'Perfeito!' },
  ]);

  const stats = {
    total: 45,
    completed: 42,
    earnings: 5250,
    avgRating: 4.9
  };

  const exportCSV = () => {
    let csv = 'Data,Cliente,Endereço,Tipo,Valor,Avaliação\n';
    bookings.forEach(b => {
      csv += `${b.date},${b.client},${b.address},${b.type},R$ ${b.amount},${b.rating}⭐\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agendamentos.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <FaHistory className="text-blue-600" /> Histórico de Agendamentos
          </h1>
          <p className="text-gray-600">Acompanhe todos seus agendamentos passados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-semibold">Total de Agendamentos</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-semibold">Concluídos</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-gray-600 text-sm font-semibold">Ganhos</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">R$ {stats.earnings}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="text-gray-600 text-sm font-semibold">Avaliação Média</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.avgRating} ⭐</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaFilter /> Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Período</label>
              <select
                value={filter.days}
                onChange={(e) => setFilter({ ...filter, days: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
                <option value={0}>Todo período</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FaDownload /> Exportar CSV (Imposto)
          </button>
        </div>

        {/* Bookings */}
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{booking.client}</h3>
                  <p className="text-gray-600 mb-1">📍 {booking.address}</p>
                  <p className="text-gray-600 mb-3">🧹 {booking.type}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Data</p>
                      <p className="font-semibold text-gray-800">{booking.date}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Horário</p>
                      <p className="font-semibold text-gray-800">{booking.time}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Duração</p>
                      <p className="font-semibold text-gray-800">{booking.duration}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-gray-600">Valor</p>
                      <p className="font-semibold text-green-600">R$ {booking.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Avaliação do Cliente</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-yellow-500">{booking.rating}</span>
                      <div className="text-yellow-400">
                        {'⭐'.repeat(Math.floor(booking.rating))}
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{booking.comment}"</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                      Ver Detalhes
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition">
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
