import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { validateCPF, formatCPF, validatePhone, formatPhone, validatePixKey, validateEmail, validatePassword, validateAge, validateCardNumber, validateCVV, validateExpiryDate } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    cpf: '',
    age: '',
    region: ''
  });
  const [photo, setPhoto] = useState(null);
  const [bankData, setBankData] = useState({
    paymentMethod: 'pix', // 'pix' ou 'bank'
    pixKey: '',
    pixKeyType: 'phone', // phone, email, cpf, random
    bankCode: '',
    bankName: '',
    accountType: 'corrente',
    accountNumber: '',
    accountDigit: '',
    bankAgency: '',
    accountHolderName: '',
    hourlyRate: '75.00'
  });
  const { registerUser, registerCleaner, isLoading } = useAuthStore();

  const regions = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Metropolitana'];
  const bankCodes = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '033', name: 'Santander' },
    { code: '237', name: 'Bradesco' },
    { code: '104', name: 'Caixa' },
    { code: '041', name: 'Banrisul' },
    { code: '077', name: 'Inter' }
  ];

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Formatar CPF em tempo real
    if (name === 'cpf') {
      value = value.replace(/\D/g, '').slice(0, 11);
      if (value.length === 11) {
        value = formatCPF(value);
      }
    }
    
    // Formatar telefone em tempo real
    if (name === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleBankChange = (e) => {
    let { name, value } = e.target;
    
    // Formatar PIX key conforme o tipo
    if (name === 'pixKey' && bankData.pixKeyType === 'phone') {
      value = formatPhone(value);
    }
    
    setBankData({ ...bankData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Para MVP, usar URL de foto pública
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDAÇÃO 1: Email válido
    if (!validateEmail(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    // ✅ VALIDAÇÃO 2: Telefone válido
    if (!validatePhone(formData.phone)) {
      toast.error('Telefone inválido (use 10 ou 11 dígitos)');
      return;
    }

    // ✅ VALIDAÇÃO 3: Senhas conferem
    if (formData.password !== formData.confirmPassword) {
      toast.error('Senhas não conferem');
      return;
    }

    // ✅ VALIDAÇÃO 4: Senha forte
    if (!validatePassword(formData.password)) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      if (userType === 'user') {
        // Validações para cliente
        await registerUser(formData.email, formData.password, formData.name, formData.phone);
      } else {
        // ✅ VALIDAÇÃO 5: CPF válido para faxineira
        if (!formData.cpf || !validateCPF(formData.cpf)) {
          toast.error('CPF inválido');
          return;
        }

        // ✅ VALIDAÇÃO 6: Idade mínima 18 anos
        if (!validateAge(formData.age)) {
          toast.error('Você deve ter no mínimo 18 anos');
          return;
        }

        // ✅ VALIDAÇÃO 7: Região selecionada
        if (!formData.region) {
          toast.error('Selecione uma região');
          return;
        }

        // ✅ VALIDAÇÃO 8: Dados de pagamento preenchidos
        if (bankData.paymentMethod === 'pix') {
          if (!bankData.pixKey) {
            toast.error('Informe sua chave PIX');
            return;
          }
          if (!validatePixKey(bankData.pixKey, bankData.pixKeyType)) {
            toast.error(`Chave PIX inválida para tipo "${bankData.pixKeyType}"`);
            return;
          }
        } else if (bankData.paymentMethod === 'bank') {
          if (!bankData.bankCode) {
            toast.error('Selecione um banco');
            return;
          }
          if (!bankData.accountNumber) {
            toast.error('Informe o número da conta');
            return;
          }
          if (!bankData.accountDigit) {
            toast.error('Informe o dígito da conta');
            return;
          }
          if (!bankData.accountHolderName) {
            toast.error('Informe o nome do titular');
            return;
          }
        }
        
        await registerCleaner({
          ...formData,
          dateOfBirth: new Date(`${formData.age}-01-01`),
          photo: photo || 'https://via.placeholder.com/200',
          bankDetails: {
            paymentMethod: bankData.paymentMethod,
            pixKey: bankData.pixKey,
            pixKeyType: bankData.pixKeyType,
            bankCode: bankData.bankCode,
            bankName: bankData.bankName,
            accountType: bankData.accountType,
            accountNumber: bankData.accountNumber,
            accountDigit: bankData.accountDigit,
            accountHolderName: bankData.accountHolderName,
            hourlyRate: parseFloat(bankData.hourlyRate)
          }
        });
      }
      toast.success('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">Leidy Cleaner</h1>
          <p className="text-purple-100 text-center mt-2">Cadastro</p>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                userType === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setUserType('cleaner')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                userType === 'cleaner'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Faxineira
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" /> Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" /> Email
              </label>
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

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" /> Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+55 51 99999-9999"
              />
            </div>

            {userType === 'cleaner' && (
              <>
                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123.456.789-00"
                  />
                </div>

                {/* Idade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="80"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>

                {/* Região */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Região</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma região</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {photo ? (
                          <>
                            <img src={photo} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                            <p className="text-xs text-purple-600 mt-2">Clique para mudar</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-purple-600">Clique para enviar foto</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                </div>

                {/* Preço por Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💰 Preço por Hora (R$)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={bankData.hourlyRate}
                    onChange={handleBankChange}
                    required
                    step="0.01"
                    min="20"
                    max="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="75.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Padrão: R$ 75,00/hora</p>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">💳 Como deseja receber pagamentos?</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer"
                           style={bankData.paymentMethod === 'pix' ? { borderColor: '#a855f7' } : {}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={bankData.paymentMethod === 'pix'}
                        onChange={handleBankChange}
                      />
                      <span className="font-semibold">🟢 PIX (Instantâneo)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer"
                           style={bankData.paymentMethod === 'bank' ? { borderColor: '#a855f7' } : {}}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={bankData.paymentMethod === 'bank'}
                        onChange={handleBankChange}
                      />
                      <span className="font-semibold">🏦 Conta Bancária (24h)</span>
                    </label>
                  </div>
                </div>

                {/* PIX */}
                {bankData.paymentMethod === 'pix' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chave PIX {bankData.pixKey && validatePixKey(bankData.pixKey, bankData.pixKeyType) ? '✅' : ''}
                      </label>
                      <input
                        type="text"
                        name="pixKey"
                        value={bankData.pixKey}
                        onChange={handleBankChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          bankData.pixKey && !validatePixKey(bankData.pixKey, bankData.pixKeyType) 
                            ? 'border-red-500' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Insira sua chave PIX"
                      />
                      {bankData.pixKey && !validatePixKey(bankData.pixKey, bankData.pixKeyType) && (
                        <p className="text-xs text-red-600 mt-1">❌ Chave PIX inválida para o tipo "{bankData.pixKeyType}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {bankData.pixKeyType === 'phone' && 'Ex: 51 9 9999-9999 ou +55 51 99999-9999'}
                        {bankData.pixKeyType === 'email' && 'Ex: seu@email.com'}
                        {bankData.pixKeyType === 'cpf' && 'Ex: 123.456.789-00'}
                        {bankData.pixKeyType === 'random' && 'Sua chave aleatória (UUID)'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Chave</label>
                      <select
                        name="pixKeyType"
                        value={bankData.pixKeyType}
                        onChange={handleBankChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="phone">☎️ Telefone</option>
                        <option value="cpf">🪪 CPF</option>
                        <option value="email">📧 Email</option>
                        <option value="random">🔀 Aleatória</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Conta Bancária */}
                {bankData.paymentMethod === 'bank' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🏦 Banco {bankData.bankCode ? '✅' : ''}</label>
                      <select
                        name="bankCode"
                        value={bankData.bankCode}
                        onChange={handleBankChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um banco</option>
                        {bankCodes.map((bank) => (
                          <option key={bank.code} value={bank.code}>{bank.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                      <select
                        name="accountType"
                        value={bankData.accountType}
                        onChange={handleBankChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="corrente">💳 Conta Corrente</option>
                        <option value="poupanca">🏪 Conta Poupança</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Número {bankData.accountNumber ? '✅' : ''}
                        </label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankData.accountNumber}
                          onChange={handleBankChange}
                          required
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            bankData.accountNumber && bankData.accountNumber.length < 5 
                              ? 'border-red-500' 
                              : 'border-gray-300'
                          }`}
                          placeholder="123456"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Dígito {bankData.accountDigit ? '✅' : ''}
                        </label>
                        <input
                          type="text"
                          name="accountDigit"
                          value={bankData.accountDigit}
                          onChange={handleBankChange}
                          required
                          maxLength="1"
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            bankData.accountDigit && !/^\d$/.test(bankData.accountDigit) 
                              ? 'border-red-500' 
                              : 'border-gray-300'
                          }`}
                          placeholder="7"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Agência {bankData.bankAgency ? '✅' : ''}
                        </label>
                        <input
                          type="text"
                          name="bankAgency"
                          value={bankData.bankAgency || ''}
                          onChange={handleBankChange}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            bankData.bankAgency && bankData.bankAgency.length < 4 
                              ? 'border-yellow-500' 
                              : 'border-gray-300'
                          }`}
                          placeholder="0001"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Titular {bankData.accountHolderName ? '✅' : ''}
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={bankData.accountHolderName}
                        onChange={handleBankChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded p-3 text-xs text-blue-800">
                      <strong>💡 Dica:</strong> Todos os dados devem estar exatamente como aparecem no seu banco.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2" /> Senha
              </label>
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

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-purple-500 font-semibold hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
