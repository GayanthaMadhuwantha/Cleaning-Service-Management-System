import express from 'express';
import cors from 'cors';
const PORT = process.env.PORT || 5000;


const app=express()
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import serviceRoutes from './routes/services.js';
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});