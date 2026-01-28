import React, { useState } from 'react';
import { FaComment, FaTimes, FaSearch, FaPaperPlane } from 'react-icons/fa';

const ChatWindow = () => {
  const [conversations] = useState([
    { id: 1, name: 'Maria Silva', avatar: '👩', online: true, unread: 2, lastMessage: 'Ok, pode ser amanhã?' },
    { id: 2, name: 'João Santos', avatar: '👨', online: false, unread: 0, lastMessage: 'Obrigado!' },
    { id: 3, name: 'Ana Costa', avatar: '👩', online: true, unread: 1, lastMessage: 'Qual é o horário?' },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Maria Silva', content: 'Oi! Tudo bem?', timestamp: '14:30', isMine: false },
    { id: 2, sender: 'Você', content: 'Oi! Tudo bem sim!', timestamp: '14:31', isMine: true },
    { id: 3, sender: 'Maria Silva', content: 'Você pode vir hoje?', timestamp: '14:32', isMine: false },
    { id: 4, sender: 'Você', content: 'Sim, a que horas?', timestamp: '14:33', isMine: true },
    { id: 5, sender: 'Maria Silva', content: 'Ok, pode ser amanhã?', timestamp: '14:34', isMine: false },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const timestamp = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'Você',
          content: newMessage,
          timestamp,
          isMine: true
        }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaComment className="text-blue-600" /> Chat
        </h1>

        <div className="flex gap-4 h-screen max-h-[calc(100vh-120px)]">
          {/* Conversations Sidebar */}
          <div className="w-72 bg-white rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    selectedConversation.id === conv.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-3xl">{conv.avatar}</span>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{conv.name}</p>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedConversation.avatar}</span>
                <div>
                  <h2 className="font-bold text-lg text-gray-800">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.online ? '🟢 Online' : '⚪ Offline'}
                  </p>
                </div>
              </div>
              <button className="text-2xl text-gray-600 hover:text-gray-800 transition">☎️</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.isMine
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-300 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isMine ? 'text-blue-100' : 'text-gray-600'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="text-2xl text-gray-600 hover:text-blue-600 transition">😊</button>
                <button className="text-2xl text-gray-600 hover:text-blue-600 transition">🖼️</button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaPaperPlane /> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
