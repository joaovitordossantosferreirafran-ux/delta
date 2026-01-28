import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cleaners from './pages/Cleaners';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import CleanerDashboard from './pages/CleanerDashboard';
import CleanerSchedule from './pages/CleanerSchedule';
import AdminDashboard from './pages/AdminDashboard';
import ReferralSystem from './pages/ReferralSystem';
import BookingHistory from './pages/BookingHistory';
import ChatWindow from './pages/ChatWindow';

function App() {
  const { validateToken, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/cleaners" element={token ? <Cleaners /> : <Navigate to="/login" />} />
        <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
        <Route path="/payment/:bookingId" element={token ? <Payment /> : <Navigate to="/login" />} />
        <Route path="/cleaner/dashboard" element={token ? <CleanerDashboard /> : <Navigate to="/login" />} />
        <Route path="/cleaner/schedule" element={token ? <CleanerSchedule /> : <Navigate to="/login" />} />
        <Route path="/cleaner/referral" element={token ? <ReferralSystem /> : <Navigate to="/login" />} />
        <Route path="/cleaner/history" element={token ? <BookingHistory /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <ChatWindow /> : <Navigate to="/login" />} />
        <Route path="/admin/dashboard" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
