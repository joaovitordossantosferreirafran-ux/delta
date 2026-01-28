/**
 * Validadores de dados para formulários
 */

// Validar CPF (formato e dígitos verificadores)
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificar se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se não é uma sequência repetida
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Formatar CPF para exibição (123.456.789-00)
export const formatCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF
    .slice(0, 3) + '.' + 
    cleanCPF.slice(3, 6) + '.' + 
    cleanCPF.slice(6, 9) + '-' + 
    cleanCPF.slice(9, 11);
};

// Validar telefone
export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Formatar telefone (51) 99999-9999
export const formatPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length <= 10) {
    return cleanPhone.slice(0, 2) + ' ' + cleanPhone.slice(2, 6) + '-' + cleanPhone.slice(6);
  }
  return '(' + cleanPhone.slice(0, 2) + ') ' + cleanPhone.slice(2, 7) + '-' + cleanPhone.slice(7);
};

// Validar PIX (simplificado - aceita email, telefone, CPF ou aleatória)
export const validatePixKey = (key, type) => {
  const cleanKey = key.trim();
  
  if (!cleanKey) return false;
  
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey);
    case 'phone':
      return /^\+55\d{10,11}$|^\d{10,11}$/.test(cleanKey.replace(/\D/g, ''));
    case 'cpf':
      return validateCPF(cleanKey);
    case 'random':
      return cleanKey.length > 0; // Aceita qualquer valor não vazio
    default:
      return false;
  }
};

// Validar número de conta bancária
export const validateAccountNumber = (accountNumber) => {
  const clean = accountNumber.replace(/\D/g, '');
  return clean.length >= 5 && clean.length <= 20;
};

// Validar agência bancária
export const validateBankAgency = (agency) => {
  const clean = agency.replace(/\D/g, '');
  return clean.length >= 4 && clean.length <= 5;
};

// Validar dígito verificador (0-9)
export const validateAccountDigit = (digit) => {
  return /^\d$/.test(digit);
};

// Validar email
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validar senha (mínimo 6 caracteres)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Validar número de cartão (Luhn algorithm)
export const validateCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validar CVV (3 ou 4 dígitos)
export const validateCVV = (cvv) => {
  const clean = cvv.replace(/\D/g, '');
  return clean.length === 3 || clean.length === 4;
};

// Validar data de vencimento do cartão (MM/YY)
export const validateExpiryDate = (expiryDate) => {
  if (!expiryDate || expiryDate.length !== 5) return false;
  
  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
};

// Validar idade mínima (18 anos)
export const validateAge = (age) => {
  const ageNum = parseInt(age, 10);
  return ageNum >= 18 && ageNum <= 100;
};
