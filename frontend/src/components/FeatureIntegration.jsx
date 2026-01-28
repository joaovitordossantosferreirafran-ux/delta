// ========================================
// EXEMPLOS DE INTEGRAÇÃO FRONTEND - React
// ========================================

// ==================== 1. REAGENDAMENTO ====================

// RescheduleModal.jsx
import { useState } from 'react';
import api from '../services/api';

export function RescheduleModal({ bookingId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    newDate: '',
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/features/reschedule', {
        bookingId,
        newDate: formData.newDate,
        newStartTime: formData.newStartTime,
        newEndTime: formData.newEndTime,
        reason: formData.reason,
        initiatedBy: 'user',
      });

      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reagendar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Reagendar Limpeza</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={formData.newDate}
          onChange={(e) =>
            setFormData({ ...formData, newDate: e.target.value })
          }
          required
        />

        <input
          type="time"
          value={formData.newStartTime}
          onChange={(e) =>
            setFormData({ ...formData, newStartTime: e.target.value })
          }
          required
        />

        <input
          type="time"
          value={formData.newEndTime}
          onChange={(e) =>
            setFormData({ ...formData, newEndTime: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Motivo do reagendamento (opcional)"
          value={formData.reason}
          onChange={(e) =>
            setFormData({ ...formData, reason: e.target.value })
          }
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Reagendando...' : 'Confirmar Reagendamento'}
        </button>
      </form>
    </div>
  );
}

// ==================== 2. AVALIAÇÃO MÚTUA ====================

// RatingModal.jsx
import { useState } from 'react';
import api from '../services/api';

export function RatingModal({ bookingId, receiverId, receiverType, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    punctuality: 5,
    professionalism: 5,
    quality: 5,
    communication: 5,
  });
  const [loading, setLoading] = useState(false);

  const handleAspectChange = (aspect, value) => {
    setAspects({ ...aspects, [aspect]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        bookingId,
        rating,
        comment,
        punctuality: aspects.punctuality,
        professionalism: aspects.professionalism,
        quality: aspects.quality,
        communication: aspects.communication,
      };

      if (receiverType === 'cleaner') {
        payload.toCleanerId = receiverId;
        const user = await api.get('/users/me'); // pega user atual
        payload.givenByUserId = user.data.id;
      } else {
        payload.toUserId = receiverId;
        const cleaner = await api.get('/cleaners/me'); // pega cleaner atual
        payload.givenByCleanerId = cleaner.data.id;
      }

      const response = await api.post('/features/ratings', payload);
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={star <= value ? 'star filled' : 'star'}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="modal rating-modal">
      <h2>Avaliar {receiverType === 'cleaner' ? 'Limpador' : 'Cliente'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Avaliação Geral:</label>
          {renderStars(rating, setRating)}
          <p className="rating-text">{rating} de 5 estrelas</p>
        </div>

        <div className="aspects">
          <div className="aspect">
            <label>Pontualidade:</label>
            {renderStars(aspects.punctuality, (val) =>
              handleAspectChange('punctuality', val)
            )}
          </div>

          <div className="aspect">
            <label>Profissionalismo:</label>
            {renderStars(aspects.professionalism, (val) =>
              handleAspectChange('professionalism', val)
            )}
          </div>

          <div className="aspect">
            <label>Qualidade:</label>
            {renderStars(aspects.quality, (val) =>
              handleAspectChange('quality', val)
            )}
          </div>

          <div className="aspect">
            <label>Comunicação:</label>
            {renderStars(aspects.communication, (val) =>
              handleAspectChange('communication', val)
            )}
          </div>
        </div>

        <textarea
          placeholder="Deixe um comentário (opcional)"
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </button>
      </form>
    </div>
  );
}

// ==================== 3. VERIFICAÇÃO DE BLOQUEIO ====================

// PunishmentBanner.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export function PunishmentBanner({ cleanerId }) {
  const [blocked, setBlocked] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBlock = async () => {
      try {
        const response = await api.get(`/features/punishment/check/${cleanerId}`);
        setBlocked(response.data);
      } catch (error) {
        console.error('Erro ao verificar bloqueio:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBlock();
  }, [cleanerId]);

  if (loading || !blocked?.isBlocked) return null;

  return (
    <div className="banner warning">
      <h3>⚠️ Você está temporariamente bloqueado</h3>
      <p>
        Motivo: {blocked.punishments[0]?.reason}
      </p>
      <p>
        Bloqueio até: {new Date(blocked.blockedUntil).toLocaleDateString('pt-BR')}
      </p>
      <p>Você poderá usar o app novamente após essa data.</p>
    </div>
  );
}

// ==================== 4. SELETOR DE REGIÃO RÁPIDO ====================

// RegionQuickSelect.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export function RegionQuickSelect() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [quickMode, setQuickMode] = useState(false);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await api.get('/features/region/list');
        setRegions(response.data.regions);
      } catch (error) {
        console.error('Erro ao carregar regiões:', error);
      }
    };

    loadRegions();
  }, []);

  const handleActivateQuickMode = async (region) => {
    try {
      await api.post('/features/region/quick-mode', { region });
      setSelectedRegion(region);
      setQuickMode(true);
    } catch (error) {
      console.error('Erro ao ativar modo rápido:', error);
    }
  };

  const handleDeactivateQuickMode = async () => {
    try {
      await api.delete('/features/region/quick-mode');
      setSelectedRegion('');
      setQuickMode(false);
    } catch (error) {
      console.error('Erro ao desativar modo rápido:', error);
    }
  };

  return (
    <div className="quick-select">
      {!quickMode ? (
        <div className="region-buttons">
          <h3>Selecione uma região:</h3>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => handleActivateQuickMode(region)}
              className="region-btn"
            >
              {region}
            </button>
          ))}
        </div>
      ) : (
        <div className="quick-mode-active">
          <p>✅ Modo Rápido: {selectedRegion}</p>
          <button onClick={handleDeactivateQuickMode}>
            Desativar Modo Rápido
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== 5. CARD DE GRADE DE DESEMPENHO ====================

// CleanerGradeCard.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export function CleanerGradeCard({ cleanerId }) {
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrade = async () => {
      try {
        const response = await api.get(`/features/ranking/grade/${cleanerId}`);
        setGradeData(response.data);
      } catch (error) {
        console.error('Erro ao carregar grade:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGrade();
  }, [cleanerId]);

  if (loading) return <div>Carregando...</div>;
  if (!gradeData) return null;

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return '#22c55e';
      case 'B':
        return '#3b82f6';
      case 'C':
        return '#f59e0b';
      case 'D':
        return '#ef4444';
      case 'F':
        return '#7f1d1d';
      default:
        return '#666';
    }
  };

  return (
    <div className="grade-card">
      <div className="header">
        <img src={gradeData.cleaner.photo} alt={gradeData.cleaner.name} />
        <div className="info">
          <h3>{gradeData.cleaner.name}</h3>
          <p>{gradeData.cleaner.region}</p>
        </div>
        <div className="grade" style={{ backgroundColor: getGradeColor(gradeData.grade) }}>
          {gradeData.grade}
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <label>Agilidade</label>
          <div className="progress">
            <div
              className="bar"
              style={{ width: `${(gradeData.metrics.agilityScore / 10) * 100}%` }}
            />
          </div>
          <span>{gradeData.metrics.agilityScore}/10</span>
        </div>

        <div className="metric">
          <label>Taxa Aceitação</label>
          <span>{gradeData.metrics.acceptanceRate}%</span>
        </div>

        <div className="metric">
          <label>Taxa Conclusão</label>
          <span>{gradeData.metrics.completionRate}%</span>
        </div>

        <div className="metric">
          <label>Avaliação Média</label>
          <span>⭐ {gradeData.metrics.avgRating}</span>
        </div>
      </div>

      <div className="reputation">
        <p>
          <strong>Reputação:</strong> {gradeData.reputation.points} pts -{' '}
          {gradeData.reputation.status}
        </p>
      </div>

      <div className="ranking">
        <p>
          🏆 <strong>Rank Global:</strong> #{gradeData.global.rank}
        </p>
        {gradeData.global.topPerformer && <p>⭐ Top Performer (Top 5%)</p>}
        {gradeData.global.badge === 'TOP CLEANER' && (
          <p className="badge">👑 TOP CLEANER</p>
        )}
      </div>
    </div>
  );
}

// ==================== 6. LISTA DE RANKING ====================

// RankingList.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export function RankingList() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('global'); // 'global' ou region
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      try {
        let response;
        if (filter === 'global') {
          response = await api.get('/features/ranking/global?limit=50');
        } else if (selectedRegion) {
          response = await api.get(
            `/features/ranking/region/${encodeURIComponent(selectedRegion)}`
          );
        }
        setRanking(response.data.ranking);
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [filter, selectedRegion]);

  return (
    <div className="ranking-container">
      <h2>🏆 Ranking de Limpadores</h2>

      <div className="filters">
        <button
          className={filter === 'global' ? 'active' : ''}
          onClick={() => setFilter('global')}
        >
          Global
        </button>
        <button
          className={filter === 'region' ? 'active' : ''}
          onClick={() => setFilter('region')}
        >
          Por Região
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Região</th>
              <th>Avaliação</th>
              <th>Agilidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((cleaner) => (
              <tr key={cleaner.id}>
                <td>#{cleaner.globalRank || cleaner.regionalRank}</td>
                <td>{cleaner.name}</td>
                <td>{cleaner.region}</td>
                <td>
                  ⭐ {cleaner.averageRating} ({cleaner.reviewCount} avaliações)
                </td>
                <td>{cleaner.agilityScore}/10</td>
                <td>
                  {cleaner.topCleanerBadge && <span className="badge">TOP</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ==================== 7. SERVIÇO DE API ====================

// api.js - Atualizado
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ==================== 8. ESTILOS CSS ====================

/*
.modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.star-rating {
  display: flex;
  gap: 8px;
  margin: 12px 0;
}

.star-rating button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.star-rating button.filled {
  color: #fbbf24;
}

.grade {
  font-size: 32px;
  font-weight: bold;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grade-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th,
.ranking-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.ranking-table thead {
  background: #f9fafb;
}

.badge {
  background: #fbbf24;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.region-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.region-btn {
  padding: 12px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.region-btn:hover {
  background: #e5e7eb;
  border-color: #3b82f6;
}
*/

export {
  RescheduleModal,
  RatingModal,
  PunishmentBanner,
  RegionQuickSelect,
  CleanerGradeCard,
  RankingList,
};
