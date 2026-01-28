const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cleanerRoutes = require('./routes/cleaners');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const notificationRoutes = require('./routes/notifications');
const discountRoutes = require('./routes/discounts');
const disputeRoutes = require('./routes/disputes');
const bonusRoutes = require('./routes/bonuses');
const scheduleRoutes = require('./routes/schedules');
const metricsRoutes = require('./routes/metrics');
const featuresRoutes = require('./routes/features');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cleaners', cleanerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/features', featuresRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
