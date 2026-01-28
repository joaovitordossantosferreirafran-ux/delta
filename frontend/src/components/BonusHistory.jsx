import React, { useEffect, useState } from 'react';
import { bonusService } from '../services/bonusService';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import { FaTrophy, FaStar, FaCalendar, FaDollarSign } from 'react-icons/fa';

const BonusHistory = () => {
  const { user } = useAuthStore();
  const [bonusData, setBonusData] = useState(null);
  const [topCleanerStatus, setTopCleanerStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);

  useEffect(() => {
    loadBonusData();
  }, [user?.id]);

  const loadBonusData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const historyData = await bonusService.getBonusHistory(user.id);
      setBonusData(historyData);

      const topCleanerData = await bonusService.getTopCleanerStatus(user.id);
      setTopCleanerStatus(topCleanerData);

      const eligibilityData = await bonusService.checkBonusEligibility(user.id);
      setEligibilityCheck(eligibilityData);
    } catch (error) {
      console.error('Erro ao carregar dados de bônus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    if (!eligibilityCheck?.eligible) {
      toast.warning('Você ainda não é elegível para um bônus');
      return;
    }

    try {
      const result = await bonusService.processBonus(user.id);
      
      if (result.success) {
        toast.success(`Bônus de R$ ${result.amount} adicionado à sua conta!`);
        await notificationService.sendNotification({
          userId: user.id,
          title: '🎉 Bônus Recebido!',
          message: `Você recebeu R$ ${result.amount} de bônus`,
          type: 'bonus'
        });
        loadBonusData();
      }
    } catch (error) {
      toast.error('Erro ao receber bônus');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">Carregando dados de bônus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {eligibilityCheck?.eligible && (
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 border border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-200 mb-2">🎉 Novo Bônus Disponível!</h3>
              <p className="text-gray-300 mb-2">
                Você tem {eligibilityCheck.consecutiveFiveStars} avaliações 5 estrelas
              </p>
              <p className="text-xl font-bold text-yellow-300">
                Ganhe R$ {eligibilityCheck.bonusAmount} agora!
              </p>
            </div>
            <button
              onClick={handleClaimBonus}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition"
            >
              Receber Bônus
            </button>
          </div>
        </div>
      )}

      {topCleanerStatus?.isTopCleaner && (
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 border border-purple-700">
          <div className="flex items-center gap-4">
            <FaTrophy className="text-5xl text-yellow-300" />
            <div>
              <h3 className="text-lg font-bold text-purple-200 mb-2">👑 TOP CLEANER</h3>
              <p className="text-gray-300 mb-1">
                Parabéns! Você é um TOP CLEANER até {new Date(topCleanerStatus.topCleanerUntil).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-400">
                Receba bônus exclusivos e aumente sua visibilidade na plataforma
              </p>
              <p className="text-yellow-300 font-semibold mt-2">
                Total ganho em bônus: R$ {topCleanerStatus.totalBonusEarned.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Histórico de Bônus
          </h3>
        </div>

        <div className="divide-y divide-gray-700">
          {bonusData?.bonuses && bonusData.bonuses.length > 0 ? (
            bonusData.bonuses.map((bonus) => (
              <div key={bonus.id} className="p-4 hover:bg-gray-700 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {bonus.status === 'completed' ? (
                        <FaDollarSign className="text-2xl text-green-500" />
                      ) : (
                        <FaDollarSign className="text-2xl text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{bonus.reason}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <FaCalendar className="text-xs" />
                        {new Date(bonus.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">R$ {bonus.amount.toFixed(2)}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      bonus.status === 'completed'
                        ? 'text-green-300'
                        : bonus.status === 'pending'
                        ? 'text-yellow-300'
                        : 'text-red-300'
                    }`}>
                      {bonus.status === 'completed'
                        ? '✅ Concluído'
                        : bonus.status === 'pending'
                        ? '⏳ Pendente'
                        : '❌ Cancelado'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <FaStar className="text-4xl mx-auto mb-2 opacity-50" />
              <p>Nenhum bônus ainda. Comece a receber 5 estrelas!</p>
            </div>
          )}
        </div>
      </div>

      {bonusData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total em Bônus</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              R$ {bonusData.totalBonusEarned?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Avaliações 5 Estrelas</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {eligibilityCheck?.consecutiveFiveStars || 0} / 10
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Próximo Bônus</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              R$ {(eligibilityCheck?.bonusAmount || 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusHistory;
