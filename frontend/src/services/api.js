import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  registerUser: (email, password, name, phone) =>
    api.post('/auth/register/user', { email, password, name, phone }),
  
  registerCleaner: (data) =>
    api.post('/auth/register/cleaner', data),
  
  login: (email, password, userType) =>
    api.post('/auth/login', { email, password, userType }),
  
  validateToken: () =>
    api.get('/auth/validate')
};

export const cleanerService = {
  getCleaners: (region, page = 1) =>
    api.get('/cleaners', { params: { region, page } }),
  
  getCleanerById: (id) =>
    api.get(`/cleaners/${id}`),
  
  updateProfile: (data) =>
    api.put('/cleaners/profile', data),
  
  updateSchedule: (schedule) =>
    api.put('/cleaners/schedule', { schedule })
};

export const bookingService = {
  createBooking: (data) =>
    api.post('/bookings', data),
  
  getUserBookings: (userId) =>
    api.get(`/bookings/user/${userId}`),
  
  getCleanerBookings: (cleanerId) =>
    api.get(`/bookings/cleaner/${cleanerId}`),
  
  cancelBooking: (id, reason) =>
    api.put(`/bookings/${id}/cancel`, { reason })
};

export const paymentService = {
  getPaymentMethods: () =>
    api.get('/payments/methods'),
  
  createStripeIntent: (bookingId, amount) =>
    api.post('/payments/stripe/intent', { bookingId, amount }),
  
  confirmStripePayment: (paymentIntentId, bookingId) =>
    api.post('/payments/stripe/confirm', { paymentIntentId, bookingId }),
  
  createMercadopagoPreference: (data) =>
    api.post('/payments/mercadopago/preference', data)
};

export const reviewService = {
  createReview: (data) =>
    api.post('/reviews', data),
  
  getReviews: (cleanerId) =>
    api.get(`/reviews/cleaner/${cleanerId}`)
};

export const userService = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data) =>
    api.put('/users/profile', data),
  
  getNotifications: () =>
    api.get('/users/notifications'),
  
  markNotificationAsRead: (id) =>
    api.put(`/users/notifications/${id}/read`, {})
};

export const uploadService = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/uploads/photo/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const discountService = {
  getDiscount: (code) =>
    api.get(`/discounts/${code}`)
};

export const disputeService = {
  createDispute: (data) =>
    api.post('/disputes', data),
  
  getUserDisputes: () =>
    api.get('/disputes/user/disputes')
};

export default api;
