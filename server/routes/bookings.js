import express from 'express';
import db from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT 
        b.id,
        b.customer_name,
        b.address,
        b.date_time,
        b.status,
        b.notes,
        b.created_at,
        s.name,
        s.description,
        s.price,
        s.duration_hours
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.date_time DESC
    `, [req.user.userId]);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer_name, address, date_time, service_id, notes } = req.body;

    // Validation
    if (!customer_name || !address || !date_time || !service_id) {
      return res.status(400).json({ 
        message: 'Customer name, address, date/time, and service are required' 
      });
    }

    // Check if service exists
    const [services] = await db.execute('SELECT id FROM services WHERE id = ?', [service_id]);
    if (services.length === 0) {
      return res.status(400).json({ message: 'Invalid service selected' });
    }

    // Check if date is in the future
    const bookingDate = new Date(date_time);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ message: 'Booking date must be in the future' });
    }

    // Insert booking
    const [result] = await db.execute(`
      INSERT INTO bookings (customer_name, address, date_time, service_id, user_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [customer_name, address, date_time, service_id, req.user.userId, notes || null]);

    // Fetch the created booking with service details
    const [newBooking] = await db.execute(`
      SELECT 
        b.id,
        b.customer_name,
        b.address,
        b.date_time,
        b.status,
        b.notes,
        b.created_at,
        s.name,
        s.description,
        s.price,
        s.duration_hours
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, address, date_time, service_id, notes } = req.body;

    // Check if booking exists and belongs to user
    const [existingBookings] = await db.execute(
      'SELECT id, status FROM bookings WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingBookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (existingBookings[0].status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled booking' });
    }

    // Validation
    if (!customer_name || !address || !date_time || !service_id) {
      return res.status(400).json({ 
        message: 'Customer name, address, date/time, and service are required' 
      });
    }

    // Check if date is in the future
    const bookingDate = new Date(date_time);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ message: 'Booking date must be in the future' });
    }

    // Update booking
    await db.execute(`
      UPDATE bookings 
      SET customer_name = ?, address = ?, date_time = ?, service_id = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `, [customer_name, address, date_time, service_id, notes || null, id, req.user.userId]);

    // Fetch updated booking
    const [updatedBooking] = await db.execute(`
      SELECT 
        b.id,
        b.customer_name,
        b.address,
        b.date_time,
        b.status,
        b.notes,
        b.created_at,
        s.name as service_name,
        s.description as service_description,
        s.price as service_price,
        s.duration_hours
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [id]);

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const [existingBookings] = await db.execute(
      'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingBookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update status to cancelled instead of deleting
    await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
      ['cancelled', id, req.user.userId]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Permanently delete booking
router.delete('/permanently/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const [existingBookings] = await db.execute(
      'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingBookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Delete booking
    await db.execute('DELETE FROM bookings WHERE id = ? AND user_id = ?', [id, req.user.userId]);

    res.json({ message: 'Booking permanently deleted successfully' });
  } catch (error) {
    console.error('Error permanently deleting booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;