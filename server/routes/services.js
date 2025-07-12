import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await db.execute(
      'SELECT id, name, description, price, duration_hours FROM services ORDER BY name'
    );
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;