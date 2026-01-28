import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { FaBell, FaTimes } from 'react-icons/fa';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    notificationService.setupNotificationListener();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotificationHistory(null, 10);
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'bonus':
        return '🎉';
      case 'review':
        return '⭐';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-white">🔔 Notificações</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <FaTimes />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700 transition cursor-pointer ${
                    notification.read ? '' : 'bg-gray-700 bg-opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{notification.title}</p>
                        <p className="text-gray-300 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold whitespace-nowrap"
                      >
                        Marcar
                      </button>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <FaBell className="text-4xl mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
