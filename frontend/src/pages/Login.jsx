import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password, userType);
      toast.success('Login realizado com sucesso!');
      navigate(userType === 'cleaner' ? '/cleaner/dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Leidy Cleaner</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUserType('user')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              userType === 'user'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Cliente
          </button>
          <button
            onClick={() => setUserType('cleaner')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              userType === 'cleaner'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Faxineira
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-purple-500 font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
