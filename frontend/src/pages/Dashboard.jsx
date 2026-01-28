import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { FaTrophy, FaChartBar, FaCoins, FaStar, FaCheckCircle } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [topCleaners, setTopCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userType = localStorage.getItem('userType') || 'user';
  const cleanerId = localStorage.getItem('cleanerId');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      if (userType === 'cleaner' && cleanerId) {
        const { data } = await api.get(`/metrics/${cleanerId}/current`);
        setDashboard(data?.dashboard || null);

        const { data: topData } = await api.get('/metrics/top/cleaners?limit=5');
        setTopCleaners(topData?.topCleaners || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (userType === 'cleaner') {
        toast.error('Erro ao carregar dados do dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // CLIENTE VIEW
  if (userType === 'user') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Bem-vindo! 👋</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => navigate('/cleaners')}
              className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition transform"
            >
              <div className="text-5xl mb-4">🧹</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Encontrar Faxineira</h2>
              <p className="text-gray-600">Busque profissionais disponíveis na sua região</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition transform">
              <div className="text-5xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Meus Agendamentos</h2>
              <p className="text-gray-600">Veja suas limpezas agendadas e histórico</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition transform">
              <div className="text-5xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Avaliações</h2>
              <p className="text-gray-600">Deixe sua avaliação das faxineiras</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition transform">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Mensagens</h2>
              <p className="text-gray-600">Converse com as faxineiras</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLEANER VIEW
  if (userType === 'cleaner' && dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Dashboard 📊</h1>
              <p className="text-gray-600 mt-1">Seu desempenho e ganhos</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>

          {/* Métricas Principal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 font-semibold">Agilidade</span>
                <FaChartBar className="text-blue-500 text-2xl" />
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {dashboard?.metrics?.agilityScore !== undefined 
                  ? dashboard.metrics.agilityScore.toFixed(1)
                  : '0'}/10
              </div>
              <p className="text-xs text-gray-500 mt-2">Score mensal</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 font-semibold">Aceitação</span>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
              <div className="text-4xl font-bold text-green-600">
                {dashboard?.metrics?.acceptanceRate || '0'}%
              </div>
              <p className="text-xs text-gray-500 mt-2">Chamadas aceitas</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 font-semibold">Conclusão</span>
                <FaStar className="text-yellow-500 text-2xl" />
              </div>
              <div className="text-4xl font-bold text-yellow-600">
                {dashboard?.metrics?.completionRate || '0'}%
              </div>
              <p className="text-xs text-gray-500 mt-2">Trabalhos completos</p>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Ganhos</span>
                <FaCoins className="text-2xl" />
              </div>
              <div className="text-4xl font-bold">
                {dashboard?.bonuses?.totalEarned || 'R$ 0,00'}
              </div>
              <p className="text-xs text-green-100 mt-2">Total acumulado</p>
            </div>
          </div>

          {/* TOP CLEANER Badge */}
          {dashboard?.cleaner?.topCleanerBadge && (
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-lg shadow-lg p-6 mb-8 text-white">
              <div className="flex items-center gap-4">
                <div className="text-6xl">🏆</div>
                <div>
                  <h2 className="text-3xl font-bold">TOP CLEANER!</h2>
                  <p className="text-yellow-100 text-lg">Você está entre os melhores! ⭐</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Cleaners */}
          {topCleaners.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top Faxineiras 🌟</h3>
              <div className="space-y-3">
                {topCleaners.slice(0, 5).map((ranking, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-500'
                      }`}>
                        {idx + 1}º
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{ranking.cleaner?.name || 'Faxineira'}</p>
                        <p className="text-xs text-gray-500">⭐ {ranking.metrics?.acceptanceRate || '0'}% aceitação</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{ranking.metrics?.agilityScore || 0}/10</p>
                      <p className="text-xs text-gray-500">Agilidade</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <button
              onClick={() => navigate('/schedule')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
            >
              📅 Gerenciar Agenda
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition transform hover:scale-105"
            >
              👤 Editar Perfil
            </button>
            <button
              onClick={fetchDashboard}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition transform hover:scale-105"
            >
              🔄 Atualizar Dados
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
