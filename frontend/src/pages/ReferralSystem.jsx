import React, { useState } from 'react';
import { FaShare, FaCopy, FaTrophy, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReferralSystem = () => {
  const [referralCode] = useState('CLEAN-USER12345');
  const [stats] = useState({
    total: 8,
    earned: 400,
    pending: 2,
    nextPayout: 'R$ 100 em 5 dias'
  });

  const [referrals] = useState([
    { id: 1, name: 'Maria Silva', status: 'earned', date: '2026-01-20', amount: 50 },
    { id: 2, name: 'João Santos', status: 'pending', date: '2026-01-18', amount: 50 },
    { id: 3, name: 'Ana Costa', status: 'earned', date: '2026-01-10', amount: 50 },
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('✅ Código copiado para clipboard!');
  };

  const shareOnWhatsApp = () => {
    const text = `Vem limpar com a gente! Use o código ${referralCode} e ganhe R$ 50 em créditos! 🧹`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareOnFacebook = () => {
    const text = `Compartilhe este código: ${referralCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodeURIComponent(text)}`);
  };

  const shareOnTwitter = () => {
    const text = `Venha limpar com a gente! Código: ${referralCode} 🧹✨`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaTrophy className="text-4xl text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">Sistema de Referral</h1>
          </div>
          <p className="text-gray-600">Indique amigos e ganhe R$ 50 por cada novo faxineiro</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-semibold">Total de Indicações</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-semibold">Ganho Efetivo</div>
            <div className="text-3xl font-bold text-green-600 mt-2">R$ {stats.earned}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="text-gray-600 text-sm font-semibold">Pendente</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-gray-600 text-sm font-semibold">Próximo Pagamento</div>
            <div className="text-lg font-bold text-purple-600 mt-2">{stats.nextPayout}</div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Seu Código Referral</h2>
          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 mb-6">
            <p className="text-white text-center text-sm opacity-90 mb-2">Compartilhe este código</p>
            <div className="flex items-center justify-between gap-4">
              <code className="text-white text-4xl font-bold">{referralCode}</code>
              <button
                onClick={copyToClipboard}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
              >
                <FaCopy /> Copiar
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Compartilhe em:</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={shareOnWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={shareOnFacebook}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                👍 Facebook
              </button>
              <button
                onClick={shareOnTwitter}
                className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                𝕏 Twitter
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-700">
              <strong>Como funciona:</strong> Quando alguém se registra com seu código, você ganha R$ 50 quando ela completa seu primeiro agendamento!
            </p>
          </div>
        </div>

        {/* Referrals History */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Indicações</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Pessoa Indicada</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Data</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Valor</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(ref => (
                  <tr key={ref.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{ref.name}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full font-semibold ${
                        ref.status === 'earned' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ref.status === 'earned' ? <FaCheck /> : <FaClock className="animate-spin" />}
                        {ref.status === 'earned' ? 'Ganho' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ref.date}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">R$ {ref.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;
