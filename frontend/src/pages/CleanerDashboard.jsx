import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { cleanerService, bookingService, paymentService } from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaMoneyBillWave, FaStar, FaTrophy, FaClock, FaCheckCircle } from 'react-icons/fa';

const CleanerDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    currentMonthEarnings: 0,
    averageRating: 0,
    reviewCount: 0,
    consecutiveFiveStars: 0,
    topCleanerBadge: false,
    totalBonusEarned: 0,
    agilityScore: 0,
    nextBonus: 0
  });
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // ✅ Buscar agendamentos do limpador
      const { data: bookingsData } = await bookingService.getCleanerBookings(user?.id);
      setBookings(bookingsData.bookings || []);

      // ✅ Calcular estatísticas
      const completed = bookingsData.bookings?.filter(b => b.status === 'completed').length || 0;
      const total = bookingsData.bookings?.length || 0;
      
      // Calcular ganhos totais
      const totalEarnings = bookingsData.bookings?.reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0) || 0;
      
      // Ganhos deste mês
      const now = new Date();
      const currentMonth = bookingsData.bookings?.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
      }).reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice || 0), 0) || 0;

      // ✅ Calculador de bônus: próximo bônus em X avaliações 5★
      const nextBonus = Math.max(0, 10 - (user?.consecutiveFiveStars || 0));

      setStats({
        totalBookings: total,
        completedBookings: completed,
        totalEarnings: totalEarnings,
        currentMonthEarnings: currentMonth,
        averageRating: user?.averageRating || 0,
        reviewCount: user?.reviewCount || 0,
        consecutiveFiveStars: user?.consecutiveFiveStars || 0,
        topCleanerBadge: user?.topCleanerBadge || false,
        totalBonusEarned: user?.totalBonusEarned || 0,
        agilityScore: user?.agilityScore || 0,
        nextBonus: nextBonus
      });
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (current, total) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Seu Dashboard</h1>
          <p className="text-purple-100">Bem-vindo(a), {user?.name}! 👋</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'bookings'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 Agendamentos
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'earnings'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💰 Ganhos
          </button>
        </div>

        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 🏆 Banner Bônus TOP CLEANER */}
            {stats.topCleanerBadge && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                  <FaTrophy className="text-4xl" />
                  <div>
                    <h2 className="text-2xl font-bold">🏆 TOP CLEANER!</h2>
                    <p>Você conquistou o badge de TOP CLEANER por excelência!</p>
                  </div>
                </div>
              </div>
            )}

            {/* 🎁 Sistema de Bônus */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🎁 Sistema de Bônus</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Avaliações 5★ */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-2">Avaliações 5★</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.consecutiveFiveStars}</p>
                  <p className="text-xs text-gray-500 mt-2">Próximo bônus: {stats.nextBonus} avaliações</p>
                  
                  {/* Barra de progresso */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(stats.consecutiveFiveStars, 10)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{getProgressPercentage(stats.consecutiveFiveStars, 10)}% para bônus</p>
                </div>

                {/* Total de Bônus Ganho */}
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-2">Total em Bônus</p>
                  <p className="text-3xl font-bold text-green-600">R$ {stats.totalBonusEarned.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.totalBonusEarned > 0 ? '✅ Bônus(s) recebido(s)' : 'Nenhum bônus ainda'}
                  </p>
                </div>

                {/* Agilidade */}
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 mb-2">⚡ Agilidade</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.agilityScore.toFixed(1)}/10</p>
                  <p className="text-xs text-gray-500 mt-2">Respostas rápidas + conclusões</p>
                </div>
              </div>

              {/* Info sobre bônus */}
              <div className="mt-6 bg-gray-50 rounded p-4 border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-800 mb-2">💡 Como ganhar bônus?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Receba 10 avaliações 5⭐ = R$ 100 de bônus</li>
                  <li>✅ Mantenha altas avaliações = Mais agendamentos</li>
                  <li>✅ TOP CLEANER = Mais visibilidade + R$ 150 extra/mês</li>
                </ul>
              </div>
            </div>

            {/* 📊 Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card: Agendamentos */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Agendamentos</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.completedBookings} completados</p>
                  </div>
                  <FaCalendar className="text-4xl text-blue-500" />
                </div>
              </div>

              {/* Card: Ganhos Totais */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ganhos Totais</p>
                    <p className="text-3xl font-bold text-gray-800">R$ {stats.totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Todos os tempos</p>
                  </div>
                  <FaMoneyBillWave className="text-4xl text-green-500" />
                </div>
              </div>

              {/* Card: Ganhos Mês */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ganhos Este Mês</p>
                    <p className="text-3xl font-bold text-gray-800">R$ {stats.currentMonthEarnings.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Janeiro 2026</p>
                  </div>
                  <FaClock className="text-4xl text-orange-500" />
                </div>
              </div>

              {/* Card: Rating */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avaliação</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.reviewCount} avaliações</p>
                  </div>
                  <FaStar className="text-4xl text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENDAMENTOS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Seus Agendamentos</h2>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendar className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-600">Nenhum agendamento ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{booking.user?.name || 'Cliente'}</p>
                        <p className="text-sm text-gray-600">
                          📅 {new Date(booking.date).toLocaleDateString('pt-BR')} às {booking.startTime}
                        </p>
                        <p className="text-sm text-gray-600">📍 {booking.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">R$ {(booking.finalPrice || booking.estimatedPrice).toFixed(2)}</p>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'completed' ? '✅ Concluído' :
                           booking.status === 'pending' ? '⏳ Pendente' :
                           '❌ Cancelado'}
                        </span>\n                      </div>\n                    </div>\n                  ))}\n                </div>\n              )}
            </div>
          </div>
        )}

        {/* TAB 3: GANHOS */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalhes de Ganhos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ganhos Totais */}
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Ganhos Totais</p>
                <p className="text-4xl font-bold mt-2">R$ {stats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm mt-2">Desde que começou na plataforma</p>
              </div>

              {/* Este Mês */}
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Este Mês</p>
                <p className="text-4xl font-bold mt-2">R$ {stats.currentMonthEarnings.toFixed(2)}</p>
                <p className="text-sm mt-2">Janeiro 2026</p>
              </div>

              {/* Bônus */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
                <p className="text-sm opacity-90">Bônus Recebidos</p>
                <p className="text-4xl font-bold mt-2">R$ {stats.totalBonusEarned.toFixed(2)}</p>
                <p className="text-sm mt-2">Total ganho em bônus</p>\n              </div>\n            </div>\n\n            {/* Resumo de Pagamentos */}\n            <div className=\"mt-8\">\n              <h3 className=\"font-bold text-lg text-gray-800 mb-4\">Próximas Ações</h3>\n              <div className=\"space-y-3\">\n                <button className=\"w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2\">\n                  💳 Solicitar Saque\n                </button>\n                <button className=\"w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2\">\n                  📊 Ver Histórico de Pagamentos\n                </button>\n              </div>\n            </div>\n          </div>\n        )}\n      </div>\n    </div>\n  );\n};\n\nexport default CleanerDashboard;
